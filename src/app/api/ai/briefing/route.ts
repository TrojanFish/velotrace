import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { user, weather, bike, tsb } = data;

        // Enhanced Context: Including maintenance alerts in AI context
        const chainLubeStatus = bike?.maintenance?.chainLube > 250 ? "链条急需润滑" : "传动系统状态良好";

        // Prompt Construction - Optimized for professional cycling context
        const prompt = `
            You are VeloTrace AI, a professional cycling performance consultant.
            Rider Profile: Age ${user.age}, Sex ${user.sex}, FTP ${user.ftp}W, Weight ${user.weight}kg, Fitness ${user.ctl ?? 45}.
            Power Profile (W): 5s:${user.mmp['5s']}, 1m:${user.mmp['1m']}, 5m:${user.mmp['5m']}, 20m:${user.mmp['20m']}.
            Current Status: TSB is ${tsb ?? 0}. Maintenance: ${chainLubeStatus}.
            Current Weather: ${weather?.temp ?? 20}°C, Wind ${weather?.windSpeed ?? 0}km/h.
            Active Bike: ${bike?.name || 'Road Bike'}.

            Task: Generate a bicycle training strategy in JSON format.
            Rules for Language: ALL fields MUST be in CHINESE (简体中文). Do not use English for session names or goals.
            Format: {
                "session": "15字以内的课表标题，例如：'Z2耐力 + Z4间歇' (必须中文)",
                "intensity": "核心强度指标，例如：'240W / 3x3分钟' (必须中文)",
                "goal": "生理训练目标，例如：'提高热耐受 / 乳酸缓冲能力' (必须中文)",
                "advice": "深度的专业战术简报 (2-3句中文)。侧重于身体适应和安全建议。",
                "logic": "该策略背后的推导逻辑，引用具体数据进行分析 (中文)。"
            }
            Strategy Rules:
            1. Analyze form based on TSB. IF Age > 40 and TSB < -5, emphasize recovery.
            2. High temperature (>28C) calls for heat adaptation focus.
            3. No intros/outros. Strictly JSON.
        `;

        // Helper to parse AI response with structured defaults
        const parseAIResponse = (text: string) => {
            const defaults = {
                session: "基础有氧训练",
                intensity: `${user.ftp * 0.7}W 巡航`,
                goal: "耐力系统建设",
                advice: text,
                logic: "基于实时生理数据分析。"
            };
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    return { ...defaults, ...parsed };
                }
                return defaults;
            } catch (e) {
                return defaults;
            }
        };

        // Timeout Controller for AI requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        try {
            // 1. Check for Qwen (DashScope) API
            const qwenKey = process.env.QWEN_API_KEY;
            if (qwenKey) {
                const res = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${qwenKey}`,
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal,
                    body: JSON.stringify({
                        model: "qwen-plus",
                        messages: [
                            { role: "system", content: "你是一位资深的专业自行车教练。请严格按照 JSON 格式输出训练计划，所有内容必须使用简体中文。" },
                            { role: "user", content: prompt }
                        ],
                        temperature: 0.8
                    })
                });
                const chatData = await res.json();
                if (chatData.choices?.[0]?.message?.content) {
                    const parsed = parseAIResponse(chatData.choices[0].message.content);
                    return NextResponse.json(parsed);
                }
            }

            // 2. Fallback to Gemini
            const geminiKey = process.env.GEMINI_API_KEY;
            if (geminiKey) {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    signal: controller.signal,
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                const aiData = await res.json();
                if (aiData.candidates?.[0]?.content?.parts?.[0]?.text) {
                    const parsed = parseAIResponse(aiData.candidates[0].content.parts[0].text);
                    return NextResponse.json(parsed);
                }
            }
        } catch (e) {
            console.error("AI Fetch error (timeout or api issue)");
            // Fall through to hardcoded template
        } finally {
            clearTimeout(timeoutId);
        }

        // 3. Last Fallback: Intelligent Template
        const temp = weather?.temp ?? 20;

        return NextResponse.json({
            session: temp > 28 ? "热适应专项训练" : "Z2 有氧耐力",
            intensity: `${Math.round(user.ftp * 0.65)}W - 60分钟`,
            goal: temp > 28 ? "强化热耐受能力" : "有氧系统日常维护",
            advice: `今日气温${temp}°C，TSB为${tsb ?? 0}。建议进行基础耐力骑行。每一瓦特输出都有其意义。`,
            logic: `基于 TSB(${tsb ?? 0}) 及实时气温(${temp}°C) 进行的基准战术推演。`
        });

    } catch (error) {
        return NextResponse.json({
            session: "离线战术模版",
            intensity: "Z2 基础代谢区",
            goal: "维持心肺基础",
            advice: "⚠️ 同步逻辑异常。由于风场环境复杂，建议今日保持在 Z2 区间进行基础维护性骑行。",
            logic: "API 调用链路中断，启用本地紧急安全策略。"
        });
    }
}
