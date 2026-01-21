import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { auth } from '@clerk/nextjs/server';
import { checkAndIncrementAIUsage, checkAndIncrementGuestUsage } from '@/lib/aiUsage';


export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        let usageCheck;
        let isGuest = false;

        if (userId) {
            // Logged in user - use normal quota
            usageCheck = await checkAndIncrementAIUsage(userId);
        } else {
            // Guest user - use IP-based limited quota
            isGuest = true;
            const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                request.headers.get('x-real-ip') ||
                'unknown';
            usageCheck = await checkAndIncrementGuestUsage(ip);
        }

        if (!usageCheck.allowed) {
            const message = isGuest
                ? 'Bạn đã sử dụng hết lượt thử miễn phí (1 lần/ngày). Đăng nhập để có thêm lượt sử dụng!'
                : 'Bạn đã đạt giới hạn sử dụng AI trong ngày. Vui lòng quay lại vào ngày mai để tiếp tục.';
            return NextResponse.json(
                {
                    error: message,
                    isLimitReached: true,
                    isGuest
                },
                { status: 403 }
            );
        }


        // Parse form data
        const formData = await request.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return NextResponse.json(
                { error: 'Không tìm thấy hình ảnh.' },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'GEMINI_API_KEY is not configured.' },
                { status: 500 }
            );
        }

        // Convert file to base64
        const arrayBuffer = await imageFile.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const prompt = `Phân tích hình ảnh này và cho biết đây là loại rác gì (ví dụ: Nhựa, Giấy, Kim loại, Thủy tinh, Pin, Hữu cơ, Điện tử). Đưa ra gợi ý về cách tái chế hoặc xử lý loại rác này một cách phù hợp. ĐẶC BIỆT: Hãy liệt kê 2-3 ý tưởng sáng tạo (DIY) để biến loại rác này thành các vật dụng hữu ích, kèm theo các bước thực hiện tóm tắt. Trả lời bằng tiếng Việt.`;

        // Retry logic with exponential backoff
        const maxRetries = 3;
        let lastError: Error | null = null;
        let response;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: {
                        parts: [
                            { inlineData: { data: base64Data, mimeType: imageFile.type } },
                            { text: prompt }
                        ]
                    },
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                wasteType: {
                                    type: Type.STRING,
                                    description: 'Loại rác thải được xác định từ hình ảnh.'
                                },
                                recyclingSuggestion: {
                                    type: Type.STRING,
                                    description: 'Gợi ý xử lý.'
                                },
                                diyIdeas: {
                                    type: Type.ARRAY,
                                    description: 'Danh sách các ý tưởng tái chế sáng tạo (DIY).',
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING, description: 'Tên sản phẩm tái chế' },
                                            steps: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Các bước thực hiện tóm tắt' }
                                        },
                                        required: ['title', 'steps']
                                    }
                                }
                            },
                            required: ['wasteType', 'recyclingSuggestion', 'diyIdeas']
                        }
                    }
                });
                break; // Success, exit retry loop
            } catch (err) {
                lastError = err as Error;
                console.error(`Attempt ${attempt + 1} failed:`, err);

                // Check if it's a retryable error (503, 429, etc.)
                const errorMessage = String(err);
                const isRetryable = errorMessage.includes('503') ||
                    errorMessage.includes('429') ||
                    errorMessage.includes('UNAVAILABLE') ||
                    errorMessage.includes('overloaded');

                if (!isRetryable || attempt === maxRetries - 1) {
                    throw err;
                }

                // Exponential backoff: wait 1s, 2s, 4s...
                const waitTime = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }

        if (!response) {
            throw lastError || new Error('Failed to get response from AI');
        }

        const replyText = response.text || "{}";
        let replyJson;
        try {
            replyJson = JSON.parse(replyText);
        } catch (e) {
            console.error("Failed to parse Gemini response:", replyText);
            return NextResponse.json(
                { error: 'Lỗi xử lý phản hồi từ AI.' },
                { status: 500 }
            );
        }

        // Return the JSON directly
        return NextResponse.json({ ...replyJson, remaining: usageCheck.limit - usageCheck.usage });

    } catch (error) {
        console.error('Identify error:', error);

        const errorMessage = String(error);
        let userMessage = 'Đã xảy ra lỗi khi phân tích hình ảnh.';

        if (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE')) {
            userMessage = 'Dịch vụ AI đang quá tải. Vui lòng thử lại sau vài giây.';
        } else if (errorMessage.includes('429')) {
            userMessage = 'Đã đạt giới hạn yêu cầu AI. Vui lòng thử lại sau.';
        }

        return NextResponse.json(
            { error: userMessage },
            { status: 503 }
        );
    }
}

