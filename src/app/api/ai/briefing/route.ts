import { NextResponse } from 'next/server';
import { env } from "@/config/env";

export async function POST(req: Request) {
    let isChinese = false;
    try {
        const data = await req.json();
        const { user, weather, bike, tsb, locale = 'en-US' } = data;
        isChinese = locale.toLowerCase().startsWith('zh');

        // Enhanced Context: Including maintenance alerts in AI context
        const chainLubeStatus = isChinese
            ? (bike?.maintenance?.chainLube > 250 ? "链条急需润滑" : "传动系统状态良好")
            : (bike?.maintenance?.chainLube > 250 ? "Chain needs lubrication" : "Drivetrain in good condition");

        // Prompt Construction - Optimized for professional cycling context
        const prompt = `
            You are VeloTrace AI, a professional cycling performance consultant.
            Rider Profile: Age ${user.age}, Sex ${user.sex}, FTP ${user.ftp}W, Weight ${user.weight}kg, Fitness ${user.ctl ?? 45}.
            Power Profile (W): 5s:${user.mmp['5s']}, 1m:${user.mmp['1m']}, 5m:${user.mmp['5m']}, 20m:${user.mmp['20m']}.
            Current Status: TSB is ${tsb ?? 0}. Maintenance: ${chainLubeStatus}.
            Current Weather: ${weather?.temp ?? 20}°C, Wind ${weather?.windSpeed ?? 0}km/h.
            Active Bike: ${bike?.name || 'Road Bike'}.

            Task: Generate a bicycle training strategy in JSON format.
            Rules for Language: ALL fields MUST be in ${isChinese ? 'CHINESE (简体中文)' : 'ENGLISH'}.
            Format: {
                "session": "Short session title (max 15 chars)",
                "intensity": "Core intensity target (e.g. '240W / 3x3min')",
                "goal": "Physiological training goal",
                "advice": "Professional tactical briefing (2-3 sentences). Focus on adaptation and safety.",
                "logic": "The reasoning behind the strategy, referencing specific data."
            }
            Strategy Rules:
            1. Analyze form based on TSB. IF Age > 40 and TSB < -5, emphasize recovery.
            2. High temperature (>28C) calls for heat adaptation focus.
            3. No intros/outros. Strictly JSON.
        `;

        // Helper to parse AI response with structured defaults
        const parseAIResponse = (text: string) => {
            const defaults = {
                session: isChinese ? "基础有氧训练" : "Base Endurance",
                intensity: isChinese ? `${user.ftp * 0.7}W 巡航` : `${user.ftp * 0.7}W Cruise`,
                goal: isChinese ? "耐力系统建设" : "Aerobic Building",
                advice: text,
                logic: isChinese ? "基于实时生理数据分析。" : "Based on real-time physiological analysis."
            };
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    return { ...defaults, ...parsed };
                }
                return defaults;
            } catch {
                return defaults;
            }
        };

        // Timeout Controller for AI requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        try {
            // 1. Check for Qwen (DashScope) API
            const qwenKey = env.QWEN_API_KEY;
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
                            {
                                role: "system",
                                content: isChinese
                                    ? "你是一位资深的专业自行车教练。请严格按照 JSON 格式输出训练计划，所有内容必须使用简体中文。"
                                    : "You are a senior professional cycling coach. Please output the training plan strictly in JSON format, all content must be in English."
                            },
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
            const geminiKey = env.GEMINI_API_KEY;
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
            console.error("AI Fetch error (timeout or api issue)", e);
        } finally {
            clearTimeout(timeoutId);
        }

        // 3. Last Fallback: Intelligent Template
        const temp = weather?.temp ?? 20;

        return NextResponse.json({
            session: temp > 28
                ? (isChinese ? "热适应专项训练" : "Heat Acclimation")
                : (isChinese ? "Z2 基础有氧" : "Base Endurance"),
            intensity: `${Math.round(user.ftp * 0.65)}W - 60 ${isChinese ? '分钟' : 'min'}`,
            goal: temp > 28
                ? (isChinese ? "强化热耐受能力" : "Improve heat tolerance")
                : (isChinese ? "有氧系统维护" : "Aerobic maintenance"),
            advice: isChinese
                ? `今日气温${temp}°C，TSB为${tsb ?? 0}。建议进行基础耐力骑行。每一瓦特的输出都有其意义。`
                : `Temp is ${temp}°C, TSB is ${tsb ?? 0}. Base endurance ride suggested. Every watt counts.`,
            logic: isChinese
                ? `基于 TSB(${tsb ?? 0}) 及实时气温(${temp}°C) 进行的基准战术推演。`
                : `Baseline tactical deduction based on TSB(${tsb ?? 0}) and temp(${temp}°C).`
        });

    } catch {
        return NextResponse.json({
            session: isChinese ? "离线同步" : "OFFLINE",
            intensity: isChinese ? "Z2 基础有氧" : "Z2 Base",
            goal: isChinese ? "生理基础维护" : "Maintenance",
            advice: isChinese ? "连接超时。系统已启用离线基准策略。" : "Connection error. Stay in Z2 for base maintenance.",
            logic: isChinese ? "智脑同步: 离线" : "Offline fallback."
        });
    }
}
