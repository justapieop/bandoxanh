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

        const prompt = `Bạn là một đầu bếp chay chuyên nghiệp. 

        Hãy phân tích hình ảnh này để xác định tất cả các nguyên liệu thực phẩm có trong đó. 
        
        Nhiệm vụ:
        1. Xác định nguyên liệu có trong ảnh.
        2. Gợi ý 3-5 món ăn chay có thể nấu từ các nguyên liệu này.
        3. Mỗi món cần có tên hấp dẫn, mô tả ngắn và công thức nấu đơn giản.

        Trả về kết quả dưới dạng JSON với cấu trúc:
        {
            "ingredients": ["danh sách nguyên liệu nhận diện được"],
            "dishes": [
                {
                    "name": "Tên món ăn",
                    "description": "Mô tả hấp dẫn",
                    "recipe": "Hướng dẫn chi tiết các bước nấu"
                }
            ]
        }`;




        // Retry logic
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
                                ingredients: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                    description: 'Danh sách các nguyên liệu thực phẩm nhận diện được từ hình ảnh.'
                                },
                                dishes: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            name: { type: Type.STRING },
                                            description: { type: Type.STRING },
                                            recipe: { type: Type.STRING }
                                        },
                                        required: ['name', 'description', 'recipe']
                                    },
                                    description: 'Danh sách 3 món chay gợi ý.'
                                }
                            },
                            required: ['ingredients', 'dishes']
                        }
                    }
                });
                break;
            } catch (err) {
                lastError = err as Error;
                console.error(`Attempt ${attempt + 1} failed:`, err);
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

        const replyText = response.text || JSON.stringify({ error: "Không nhận được phản hồi từ API" });
        const replyJson = JSON.parse(replyText);

        return NextResponse.json({ ...replyJson, remaining: usageCheck.limit - usageCheck.usage });

    } catch (error) {
        console.error('Vegetarian analysis error:', error);

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
