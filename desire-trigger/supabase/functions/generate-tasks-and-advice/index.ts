
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

type GenerateRequest = {
    profile_id: string
    diagnostic_id: string
    scores: Metrics
    answers: QuestionAnswer[]
    availability: string // timing: 'now' | 'morning' | 'night' | 'auto'
    profile: {
        job_title: string | string[] // 配列または文字列（後方互換性）
        hobbies: string[]
        interests: string[]
    }
    previous_titles?: string[] // 重複防止用
    userContext?: { currentMode?: string }
}

type GeneratedTask = {
    title: string
    description: string
    level: 'quick' | 'core' | 'deep'
    category: '探索系' | '没頭系' | '整理系' | '貢献系' | '元気系'
}

type AdviceResponse = {
    exploration: string
    immersion: string
    organization: string
    contribution: string
    vitality: string
}

type CombinedResponse = {
    tasks: GeneratedTask[]
    advice: AdviceResponse
}

// ─── OpenAI呼び出し関数 ───

async function callOpenAI(apiKey: string, tasksPrompt: string, advicePrompt: string): Promise<CombinedResponse> {
    // 両方のプロンプトを統合して1回のAPI呼び出しで処理
    const combinedPrompt = `
以下の2つのタスクを実行し、JSON形式で返してください。

【タスク1: タスク生成】
${tasksPrompt}

【タスク2: アドバイス生成】
${advicePrompt}

以下のJSON形式のみで返してください（前置き・説明不要）:
{
  "tasks": [
    {
      "title": "タスクタイトル",
      "description": "説明",
      "level": "quick" | "core" | "deep",
      "category": "探索系" | "没頭系" | "整理系" | "貢献系" | "元気系"
    }
  ],
  "advice": {
    "exploration": "探索スコアへのアドバイス",
    "immersion": "没頭スコアへのアドバイス",
    "organization": "整理スコアへのアドバイス",
    "contribution": "貢献スコアへのアドバイス",
    "vitality": "元気スコアへのアドバイス"
  }
}

重要: categoryフィールドは必ず上記の5つのカテゴリのいずれか（探索系、没頭系、整理系、貢献系、元気系）を使用してください。
英語名（exploration、immersion、vitality等）は使用しないでください。
`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'あなたはITエンジニアのメンタルコーチです。JSON形式のみで応答してください。' },
                { role: 'user', content: combinedPrompt }
            ],
            temperature: 0.7,
        }),
    })

    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`OpenAI API Error: ${res.status} ${errorText}`)
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
        throw new Error('OpenAI: No content in response')
    }

    // JSONパース（Markdownコードブロック除去）
    const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim()
    return JSON.parse(jsonStr)
}

// ─── Gemini呼び出し関数（フォールバック） ───

async function callGemini(apiKey: string, tasksPrompt: string, advicePrompt: string): Promise<CombinedResponse> {
    const combinedPrompt = `
以下の2つのタスクを実行し、JSON形式で返してください。

【タスク1: タスク生成】
${tasksPrompt}

【タスク2: アドバイス生成】
${advicePrompt}

以下のJSON形式のみで返してください（前置き・説明不要）:
{
  "tasks": [
    {
      "title": "タスクタイトル",
      "description": "説明",
      "level": "quick" | "core" | "deep",
      "category": "探索系" | "没頭系" | "整理系" | "貢献系" | "元気系"
    }
  ],
  "advice": {
    "exploration": "探索スコアへのアドバイス",
    "immersion": "没頭スコアへのアドバイス",
    "organization": "整理スコアへのアドバイス",
    "contribution": "貢献スコアへのアドバイス",
    "vitality": "元気スコアへのアドバイス"
  }
}

重要: categoryフィールドは必ず上記の5つのカテゴリのいずれか（探索系、没頭系、整理系、貢献系、元気系）を使用してください。
英語名（exploration、immersion、vitality等）は使用しないでください。
`

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: combinedPrompt }]
            }]
        }),
    })

    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Gemini API Error: ${res.status} ${errorText}`)
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

// ─── プロンプト構築関数 ───

function buildTasksPrompt(
    metrics: Metrics,
    profile: any,
    timing: string,
    taskLevels: string,
    targetCategories: string[],
    previousTitles?: string[]
): string {
    const metricEntries = Object.entries(metrics) as [MetricKey, number][]
    const sortedMetrics = metricEntries.sort((a, b) => a[1] - b[1])
    const lowestThree = sortedMetrics.slice(0, 3)

    const metricNames: Record<MetricKey, string> = {
        exploration: '探索',
        immersion: '没頭',
        organization: '整理',
        contribution: '貢献',
        vitality: '元気'
    }

    const focusAreas = lowestThree.map(([key, value]) =>
        `${metricNames[key]}: ${value}/100`
    ).join('、')

    const timingDescriptions: Record<string, string> = {
        'morning': '朝にやる → 朝に適したタスク（散歩、瞑想、計画立案など）',
        'daytime': '昼にやる → 日中に適したタスク（集中作業、学習、実行系のタスクなど）',
        'night': '夜にやる → 夜に適したタスク（読書、振り返り、軽い学習、リラックスなど）',
    }

    const timingDesc = timingDescriptions[timing] || timingDescriptions['daytime']

    const previousTitlesText = previousTitles && previousTitles.length > 0
        ? `\n【過去のタスク（以下と同じタイトルは使わないでください）】\n${previousTitles.map(t => `- ${t}`).join('\n')}`
        : ''

    return `
あなたはITエンジニアのメンタルコーチです。
以下の状態に基づいて、最適なタスクを3つ提案してください。

【エンジニア情報】
職種: ${Array.isArray(profile.job_title) ? profile.job_title.join(', ') : profile.job_title}
趣味: ${profile.hobbies.join(', ')}
興味分野: ${profile.interests.join(', ')}

【今日のメンタル状態】
探索: ${metrics.exploration}/100
没頭: ${metrics.immersion}/100
整理: ${metrics.organization}/100
貢献: ${metrics.contribution}/100
元気: ${metrics.vitality}/100

【重点改善エリア（スコアが低い3つ）】
${focusAreas}
※ これらのパラメータを改善するタスクを優先的に提案してください

【実行タイミング】
${timingDesc}${previousTitlesText}

【タスクのレベル構成（必ずこの順番で3つ生成）】
${taskLevels}
例: quick/core/deep → 1枚目はquick、2枚目はcore、3枚目はdeep
※ 元気スコア(${metrics.vitality})に基づいて自動設定されています

levelの基準:
- quick: 5分以内
- core: 15〜30分
- deep: 30〜60分

【タスクカテゴリ（必ずこの順番で3つ生成）】
1枚目: ${targetCategories[0]}
2枚目: ${targetCategories[1]}
3枚目: ${targetCategories[2]}
※ 必ず上記のカテゴリを順番通りに使用してください

タスクは配列形式で3つ返してください。
`
}

function buildAdvicePrompt(answers: QuestionAnswer[], scores: Metrics): string {
    const answersText = answers.map((a, i) => {
        const response = a.direction === 'yes' ? 'はい' : 'いいえ'
        return `${i + 1}. ${a.question_text}\n   回答: ${response} (強さ: ${a.swipe_value}%)`
    }).join('\n\n')

    return `
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
`
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
        const {
            profile_id,
            diagnostic_id,
            scores,
            answers,
            availability,
            profile,
            previous_titles
        } = await req.json() as GenerateRequest

        const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY')
        const GEMINI_KEY_1 = Deno.env.get('GEMINI_API_KEY_1')
        const GEMINI_KEY_2 = Deno.env.get('GEMINI_API_KEY_2')
        const GEMINI_KEY_3 = Deno.env.get('GEMINI_API_KEY_3')
        const GEMINI_KEY_4 = Deno.env.get('GEMINI_API_KEY_4')

        // 1. タスク難易度を決定（vitalityベース）
        const vitality = scores.vitality
        let taskLevels: string
        if (vitality < 30) {
            taskLevels = 'quick/quick/core'
        } else if (vitality < 70) {
            taskLevels = 'quick/core/core'
        } else {
            taskLevels = 'quick/core/deep'
        }

        // 2. カテゴリ選択（スコアが低い順に3つ、全て異なる）
        const metricToCategory: Record<MetricKey, string> = {
            exploration: '探索系',
            immersion: '没頭系',
            organization: '整理系',
            contribution: '貢献系',
            vitality: '元気系'
        }

        const metricEntries = Object.entries(scores) as [MetricKey, number][]
        const sortedMetrics = metricEntries.sort((a, b) => a[1] - b[1])
        const lowestThree = sortedMetrics.slice(0, 3)

        const selectedCategories: string[] = []
        const usedCategories = new Set<string>()

        for (const [key] of lowestThree) {
            const category = metricToCategory[key]
            if (!usedCategories.has(category)) {
                selectedCategories.push(category)
                usedCategories.add(category)
            }
        }

        // 3つ未満の場合、残りのカテゴリから追加
        const allCategories = ['探索系', '没頭系', '整理系', '貢献系', '元気系']
        while (selectedCategories.length < 3) {
            const remainingCategories = allCategories.filter(c => !usedCategories.has(c))
            if (remainingCategories.length > 0) {
                const category = remainingCategories[0]
                selectedCategories.push(category)
                usedCategories.add(category)
            } else {
                break
            }
        }

        const targetCategories = selectedCategories.slice(0, 3)

        // 3. プロンプト構築
        const tasksPrompt = buildTasksPrompt(scores, profile, availability, taskLevels, targetCategories, previous_titles)
        const advicePrompt = buildAdvicePrompt(answers, scores)

        // 4. AI呼び出し（OpenAI → Gemini 1,2,3,4 フォールバック）
        let result: CombinedResponse | null = null
        const errors: string[] = []

        // 試行順: OpenAI → Gemini 1 → Gemini 2 → Gemini 3 → Gemini 4
        const apiAttempts = [
            { name: 'OpenAI', key: OPENAI_KEY, fn: callOpenAI },
            { name: 'Gemini_1', key: GEMINI_KEY_1, fn: callGemini },
            { name: 'Gemini_2', key: GEMINI_KEY_2, fn: callGemini },
            { name: 'Gemini_3', key: GEMINI_KEY_3, fn: callGemini },
            { name: 'Gemini_4', key: GEMINI_KEY_4, fn: callGemini },
        ]

        for (const attempt of apiAttempts) {
            if (!attempt.key) {
                console.log(`${attempt.name}: API key not set, skipping...`)
                errors.push(`${attempt.name}: API key not configured`)
                continue
            }

            try {
                console.log(`Trying ${attempt.name}...`)
                result = await attempt.fn(attempt.key, tasksPrompt, advicePrompt)
                console.log(`✓ ${attempt.name} succeeded`)
                break // 成功したらループを抜ける
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error)
                console.error(`✗ ${attempt.name} failed:`, errorMsg)
                errors.push(`${attempt.name}: ${errorMsg}`)
                // 次のAPIを試す
            }
        }

        // すべてのAPIが失敗した場合
        if (!result) {
            throw new Error(`All AI APIs failed:\n${errors.join('\n')}`)
        }

        if (!result.tasks || result.tasks.length !== 3) {
            throw new Error('Generated tasks count is not 3')
        }

        // 5. タスクをDBに保存
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const taskInserts = result.tasks.map((task) => {
            return {
                profile_id,
                diagnostic_id,
                title: task.title,
                description: task.description,
                level: task.level,
                category: task.category,
                action_timing: availability,
                status: 'pending',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            }
        })

        const { data: insertedTasks, error: dbError } = await supabaseClient
            .from('tasks')
            .insert(taskInserts)
            .select('id')

        if (dbError) throw dbError

        const taskIds = insertedTasks.map(t => t.id)

        // 6. レスポンス
        return new Response(
            JSON.stringify({
                success: true,
                task_ids: taskIds,
                tasks: result.tasks,
                advice: result.advice
            }),
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
