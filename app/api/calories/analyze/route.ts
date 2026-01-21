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

        const prompt = `Bạn là một chuyên gia dinh dưỡng. Hãy phân tích hình ảnh này và xác định món ăn. 
        Ước lượng lượng calo và các thành phần dinh dưỡng (protein, carbs, fat) dựa trên khẩu phần trong ảnh. 
        Cung cấp một lời khuyên sức khỏe ngắn gọn. 
        Trả lời bằng tiếng Việt dưới dạng JSON.`;

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
                                foodName: { type: Type.STRING, description: "Tên món ăn" },
                                calories: { type: Type.NUMBER, description: "Ước lượng calo (kcal)" },
                                protein: { type: Type.STRING, description: "Lượng đạm (ví dụ: '20g')" },
                                carbs: { type: Type.STRING, description: "Lượng tinh bột (ví dụ: '50g')" },
                                fat: { type: Type.STRING, description: "Lượng chất béo (ví dụ: '10g')" },
                                portionSize: { type: Type.STRING, description: "Ước lượng khẩu phần (ví dụ: '1 bát', '200g')" },
                                healthTip: { type: Type.STRING, description: "Lời khuyên sức khỏe ngắn gọn" }
                            },
                            required: ["foodName", "calories", "protein", "carbs", "fat", "portionSize", "healthTip"]
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

        const replyText = response.text || "{}";
        let analysis;
        try {
            analysis = JSON.parse(replyText);
        } catch (e) {
            console.error("Failed to parse Gemini response:", replyText);
            return NextResponse.json(
                { error: 'Lỗi xử lý phản hồi từ AI.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ ...analysis, remaining: usageCheck.limit - usageCheck.usage });

    } catch (error) {
        console.error('Calorie Analyze error:', error);

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

