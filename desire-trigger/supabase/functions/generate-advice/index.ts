
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// ─── 型定義 ───

type MetricKey = 'exploration' | 'immersion' | 'organization' | 'contribution' | 'vitality'

type Metrics = {
    exploration: number
    immersion: number
    organization: number
    contribution: number
    vitality: number
}

type QuestionAnswer = {
    question_id: string
    question_text: string
    direction: 'yes' | 'no'
    swipe_value: number // 0-100
}

type GenerateAdviceRequest = {
    answers: QuestionAnswer[]
    scores: Metrics
}

type AdviceResponse = {
    exploration: string
    immersion: string
    organization: string
    contribution: string
    vitality: string
}

// ─── AI呼び出し関数（Gemini 2.5 Flash Lite のみ） ───

async function callGemini(apiKey: string, prompt: string): Promise<AdviceResponse> {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        }),
    })

    if (!res.ok) {
        throw new Error(`Gemini API Error: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
        throw new Error('Gemini: No content in response')
    }

    // JSONパース（Markdownコードブロック除去）
    const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim()
    return JSON.parse(jsonStr)
}

// ─── メインロジック ───

serve(async (req) => {
    // CORS check
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        })
    }

    try {
        const { answers, scores } = await req.json() as GenerateAdviceRequest
        const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY')

        if (!GEMINI_KEY) {
            throw new Error('GEMINI_API_KEY is not set')
        }

        // 1. 回答情報を文字列化
        const answersText = answers.map((a, i) => {
            const response = a.direction === 'yes' ? 'はい' : 'いいえ'
            return `${i + 1}. ${a.question_text}\n   回答: ${response} (強さ: ${a.swipe_value}%)`
        }).join('\n\n')

        // 2. プロンプト構築
        const prompt = `
あなたはITエンジニアのメンタルコーチです。
以下の診断結果に基づいて、5つのパラメータそれぞれについてアドバイスを生成してください。

【質問への回答】
${answersText}

【計算されたスコア】
探索 (exploration): ${scores.exploration}/100
没頭 (immersion): ${scores.immersion}/100
整理 (organization): ${scores.organization}/100
貢献 (contribution): ${scores.contribution}/100
元気 (vitality): ${scores.vitality}/100

【指示】
各パラメータについて、以下の2つの観点でアドバイスを書いてください：
1. このスコアになった理由（回答内容から推察）
2. このパラメータを改善するための具体的なアドバイス

アドバイスは各パラメータにつき2〜3文で、親しみやすく前向きな口調で書いてください。

以下のJSON形式のみで返してください（前置き・説明不要）:
{
  "exploration": "探索スコアへのアドバイス",
  "immersion": "没頭スコアへのアドバイス",
  "organization": "整理スコアへのアドバイス",
  "contribution": "貢献スコアへのアドバイス",
  "vitality": "元気スコアへのアドバイス"
}
`

        // 3. Gemini呼び出し
        console.log("Calling Gemini 2.5 Flash Lite...")
        const advice = await callGemini(GEMINI_KEY, prompt)

        // Response
        return new Response(
            JSON.stringify({ success: true, advice }),
            { headers: { "Content-Type": "application/json" } },
        )

    } catch (error) {
        console.error(error)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        )
    }
})
