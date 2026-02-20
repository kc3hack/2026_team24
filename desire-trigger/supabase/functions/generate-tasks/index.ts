
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

type GenerateTasksRequest = {
    profile_id: string
    diagnostic_id: string
    timing: string // ActionTiming
    task_levels: string // 'quick/quick/quick' etc.
    profile: {
        job_title: string
        hobbies: string[]
        interests: string[]
    }
    metrics: Metrics
    previous_titles?: string[] // 重複防止用：過去のタスクタイトル
}

type GeneratedTask = {
    title: string
    description: string
    level: 'quick' | 'core' | 'deep'
    category: '探索系' | '集中系' | '実行系' | '休息系'
}

// ─── AI呼び出し関数（Gemini 2.5 Flash Lite のみ） ───

async function callGemini(apiKey: string, prompt: string): Promise<GeneratedTask[]> {
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
        const { profile_id, diagnostic_id, timing, task_levels, profile, metrics, previous_titles } = await req.json() as GenerateTasksRequest
        const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY')

        if (!GEMINI_KEY) {
            throw new Error('GEMINI_API_KEY is not set')
        }

        // 1. 最も低い3つのスコアを特定
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

        // メトリックとカテゴリのマッピング
        const metricToCategory: Record<MetricKey, string> = {
            exploration: '探索系',
            immersion: '集中系',
            organization: '実行系',
            contribution: '貢献系',
            vitality: '休息系'
        }

        const focusAreas = lowestThree.map(([key, value]) =>
            `${metricNames[key]}: ${value}/100`
        ).join('、')

        // 低い3つのメトリックに対応するカテゴリを選択（重複を排除）
        const allCategories = ['探索系', '集中系', '実行系', '休息系'];
        const selectedCategories: string[] = [];
        const usedCategories = new Set<string>();

        // まず、低い3つのメトリックから異なるカテゴリを選択
        for (const [key] of lowestThree) {
            const category = metricToCategory[key];
            if (!usedCategories.has(category)) {
                selectedCategories.push(category);
                usedCategories.add(category);
            }
        }

        // 3つ未満の場合、残りのカテゴリから追加
        while (selectedCategories.length < 3) {
            const remainingCategories = allCategories.filter(c => !usedCategories.has(c));
            if (remainingCategories.length > 0) {
                const category = remainingCategories[0];
                selectedCategories.push(category);
                usedCategories.add(category);
            } else {
                break;
            }
        }

        const targetCategories = selectedCategories.slice(0, 3);

        // 元気スコアに基づいてタスク難易度を決定
        const vitality = metrics.vitality;
        let taskLevels: string;
        if (vitality < 30) {
            taskLevels = 'quick/quick/core';
        } else if (vitality < 70) {
            taskLevels = 'quick/core/core';
        } else {
            taskLevels = 'quick/core/deep';
        }

        // 2. タイミングに応じた説明
        const timingDescriptions: Record<string, string> = {
            'now': '今からやる → 屋内で今すぐ実行できるタスク',
            'morning': '明日の朝やる → 朝に適したタスク（散歩、瞑想、計画立案など）',
            'night': '今日の夜やる → 夜に適したタスク（読書、振り返り、軽い学習など）',
            'auto': 'おまかせ → 時間帯を問わないタスク'
        }

        const timingDesc = timingDescriptions[timing] || timingDescriptions['auto']

        // 3. 重複防止用の過去タイトル整形
        const previousTitlesText = previous_titles && previous_titles.length > 0
            ? `\n【過去のタスク（以下と同じタイトルは使わないでください）】\n${previous_titles.map(t => `- ${t}`).join('\n')}`
            : '';

        // 4. プロンプト構築
        const prompt = `
あなたはITエンジニアのメンタルコーチです。
以下の状態に基づいて、最適なタスクを3つ提案してください。

【エンジニア情報】
職種: ${profile.job_title}
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
※ 元気スコア(${vitality})に基づいて自動設定されています

levelの基準:
- quick: 5分以内
- core: 15〜30分
- deep: 30〜60分

【タスクカテゴリ（必ずこの順番で3つ生成）】
1枚目: ${targetCategories[0]}
2枚目: ${targetCategories[1]}
3枚目: ${targetCategories[2]}
※ 必ず上記のカテゴリを順番通りに使用してください

以下のJSON形式のみで返してください（前置き・説明不要）:
[
  {
    "title": "タスクタイトル（15文字以内）",
    "description": "なぜこのタスクか（2〜3文、スコアに言及する）",
    "level": "quick" | "core" | "deep",
    "category": "探索系" | "集中系" | "実行系" | "休息系"
  }
]
`

        // 2. Gemini呼び出し
        console.log("Calling Gemini 2.5 Flash Lite...")
        const tasks = await callGemini(GEMINI_KEY, prompt)

        if (!tasks || tasks.length !== 3) {
            throw new Error('Generated tasks count is not 3')
        }

        // 3. DB保存
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const taskInserts = tasks.map((task) => {
            return {
                profile_id,
                diagnostic_id,
                title: task.title,
                description: task.description,
                level: task.level,
                category: task.category,
                action_timing: timing,
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

        // Response
        return new Response(
            JSON.stringify({ success: true, task_ids: taskIds }),
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
