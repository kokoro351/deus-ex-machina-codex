import { createServer } from "node:http"
import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

loadLocalEnv()

const port = Number(process.env.AI_SERVER_PORT || 8787)
const model = process.env.OPENAI_MODEL || "gpt-5-mini"
const apiKey = process.env.OPENAI_API_KEY

const server = createServer(async (request, response) => {
  setCorsHeaders(response)

  if (request.method === "OPTIONS") {
    response.writeHead(204)
    response.end()
    return
  }

  if (request.url === "/api/health") {
    sendJson(response, 200, {
      ok: true,
      hasApiKey: Boolean(apiKey),
      model,
    })
    return
  }

  if (request.method === "POST" && request.url === "/api/generate-branch") {
    try {
      if (!apiKey) {
        sendJson(response, 500, {
          error: "OPENAI_API_KEY is missing. .env を作ってAPIキーを入れてください。",
        })
        return
      }

      const body = await readJsonBody(request)
      const generated = await generateBranch(body)
      sendJson(response, 200, generated)
    } catch (error) {
      sendJson(response, 500, {
        error: error instanceof Error ? error.message : "AI生成に失敗しました。",
      })
    }
    return
  }

  sendJson(response, 404, { error: "Not found" })
})

server.listen(port, "127.0.0.1", () => {
  console.log(`AI server ready: http://127.0.0.1:${port}`)
  console.log(`Model: ${model}`)
})

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env")
  if (!existsSync(envPath)) return

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const separatorIndex = trimmed.indexOf("=")
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "")
    if (key && !process.env[key]) process.env[key] = value
  }
}

async function readJsonBody(request) {
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString("utf8")
  return raw ? JSON.parse(raw) : {}
}

async function generateBranch({ scene }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "あなたはノベルゲーム DEUS EX MACHINA の分岐生成エンジンです。",
                "深海都市、中央管理AI、ORPHEUS、未完成な神という雰囲気を守ってください。",
                "返答はJSONだけにしてください。Markdownや説明文は不要です。",
                "JSONのキーは title, body, centralAI, orpheus, observation, next の6つです。",
                "bodyは日本語の文字列配列で2文。nextは候補nextIdsの中から1つだけ選んでください。",
              ].join("\n"),
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                currentScene: {
                  id: scene.id,
                  title: scene.title,
                  body: scene.body,
                  status: scene.status,
                  choices: scene.choices,
                  centralAI: scene.centralAI,
                  orpheus: scene.orpheus,
                  aiDirection: scene.aiDirection,
                },
                nextIds: scene.choices?.map((choice) => choice.next) ?? [],
              }),
            },
          ],
        },
      ],
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI API request failed.")
  }

  const text = data.output_text || collectOutputText(data)
  const parsed = JSON.parse(extractJson(text))

  return {
    title: String(parsed.title || "ORPHEUS生成分岐"),
    body: normalizeStringArray(parsed.body, 2),
    centralAI: String(parsed.centralAI || "外部生成分岐を記録。"),
    orpheus: String(parsed.orpheus || "生成された可能性を提示します。"),
    observation: String(parsed.observation || "AI GENERATED BRANCH"),
    next: String(parsed.next || scene.choices?.[0]?.next || "title"),
  }
}

function collectOutputText(data) {
  return data.output
    ?.flatMap((item) => item.content || [])
    ?.filter((content) => content.type === "output_text")
    ?.map((content) => content.text)
    ?.join("\n") || ""
}

function extractJson(text) {
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AIの返答からJSONを読み取れませんでした。")
  }
  return text.slice(start, end + 1)
}

function normalizeStringArray(value, fallbackCount) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value === "string") return [value]
  return Array.from({ length: fallbackCount }, () => "生成された分岐の本文が空でした。")
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*")
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
  response.setHeader("Access-Control-Allow-Headers", "Content-Type")
}

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" })
  response.end(JSON.stringify(data))
}
