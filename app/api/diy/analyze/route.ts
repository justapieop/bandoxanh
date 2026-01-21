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
            usageCheck = await checkAndIncrementAIUsage(userId);
        } else {
            isGuest = true;
            const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                request.headers.get('x-real-ip') ||
                'unknown';
            usageCheck = await checkAndIncrementGuestUsage(ip);
        }

        if (!usageCheck.allowed) {
            const message = isGuest
                ? 'Bạn đã sử dụng hết lượt thử miễn phí (2 lần/ngày). Đăng nhập để có thêm lượt sử dụng!'
                : 'Bạn đã đạt giới hạn sử dụng AI trong ngày. Vui lòng quay lại vào ngày mai để tiếp tục.';
            return NextResponse.json(
                { error: message, isLimitReached: true, isGuest },
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

        const prompt = `Bạn là chuyên gia tái chế sáng tạo. Phân tích hình ảnh này và:

1. Xác định CỤ THỂ đây là vật gì (ví dụ: "ống hút nhựa", "chai nhựa", "hộp sữa giấy", "lon bia", "quần jean cũ", v.v.)
2. Xác định chất liệu của vật đó (Nhựa, Giấy, Kim loại, Thủy tinh, Vải, v.v.)
3. Đề xuất 3-5 ý tưởng DIY sáng tạo có thể làm từ vật này, kèm theo:
   - Tên sản phẩm
   - Độ khó (Dễ/Trung bình/Khó)
   - Nguyên liệu cần thêm
   - Các bước thực hiện chi tiết

Trả lời bằng tiếng Việt, thực tế và có thể thực hiện được tại nhà.`;

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
                                identifiedItem: {
                                    type: Type.STRING,
                                    description: 'Tên cụ thể của vật được nhận diện (ví dụ: ống hút nhựa, chai nhựa 1.5L, lon bia, hộp sữa giấy)'
                                },
                                material: {
                                    type: Type.STRING,
                                    description: 'Chất liệu chính của vật (Nhựa, Giấy, Kim loại, Thủy tinh, Vải, Hữu cơ)'
                                },
                                diyIdeas: {
                                    type: Type.ARRAY,
                                    description: 'Danh sách các ý tưởng DIY có thể làm từ vật này',
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: {
                                                type: Type.STRING,
                                                description: 'Tên sản phẩm DIY'
                                            },
                                            difficulty: {
                                                type: Type.STRING,
                                                description: 'Độ khó: Dễ, Trung bình, hoặc Khó'
                                            },
                                            materials: {
                                                type: Type.ARRAY,
                                                items: { type: Type.STRING },
                                                description: 'Danh sách nguyên liệu cần thêm'
                                            },
                                            steps: {
                                                type: Type.ARRAY,
                                                items: { type: Type.STRING },
                                                description: 'Các bước thực hiện chi tiết'
                                            }
                                        },
                                        required: ['title', 'difficulty', 'materials', 'steps']
                                    }
                                }
                            },
                            required: ['identifiedItem', 'material', 'diyIdeas']
                        }
                    }
                });
                break;
            } catch (err) {
                lastError = err as Error;
                console.error(`Attempt ${attempt + 1} failed: `, err);
                const errorMessage = String(err);
                const isRetryable = errorMessage.includes('503') ||
                    errorMessage.includes('429') ||
                    errorMessage.includes('UNAVAILABLE') ||
                    errorMessage.includes('overloaded');

                if (!isRetryable || attempt === maxRetries - 1) throw err;
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }

        if (!response) {
            throw lastError || new Error('Failed to get response from AI');
        }

        const responseText = response.text || "{}";
        let replyJson;
        try {
            replyJson = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse Gemini response:", responseText);
            return NextResponse.json(
                { error: 'Lỗi xử lý phản hồi từ AI.' },
                { status: 500 }
            );
        }

        // Return the result with identified item and DIY ideas
        const result = {
            identifiedItem: replyJson.identifiedItem || 'Không xác định được',
            material: replyJson.material || 'Không xác định',
            projects: replyJson.diyIdeas || []
        };

        return NextResponse.json({ ...result, remaining: usageCheck.limit - usageCheck.usage });

    } catch (error) {
        console.error('DIY Analyze error:', error);

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
