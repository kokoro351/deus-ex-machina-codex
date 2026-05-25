import { useMemo, useState } from "react"
import SceneFrame from "./components/SceneFrame.jsx"
import { imageSet } from "./data/assets.js"
import { scenes } from "./data/scenes.js"
import { buildReactionScene } from "./utils/reactions.js"

export default function App() {
  const [sceneId, setSceneId] = useState("title")
  const [reaction, setReaction] = useState(null)
  const [aiState, setAiState] = useState({ loading: false, error: "" })
  const scene = reaction ?? scenes[sceneId] ?? scenes.title

  const label = useMemo(() => {
    if (scene.type === "title") return "TITLE"
    if (scene.type === "prologue") return scene.subtitle
    if (scene.type === "choice") return `TURN ${scene.turn}`
    if (scene.type === "reaction") return scene.subtitle
    return "ENDING"
  }, [scene])

  function moveToScene(nextId) {
    setReaction(null)
    setAiState({ loading: false, error: "" })
    setSceneId(nextId)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function chooseAction(choice) {
    setReaction(buildReactionScene(scene, choice))
    setAiState({ loading: false, error: "" })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function generateAiBranch() {
    setAiState({ loading: true, error: "" })

    try {
      const response = await fetch("http://127.0.0.1:8787/api/generate-branch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "AI生成に失敗しました。")
      }

      setReaction({
        id: `ai-${scene.id}-${Date.now()}`,
        type: "reaction",
        title: data.title,
        subtitle: `AI BRANCH / ${scene.title}`,
        image: imageSet.reactionOrpheus,
        manga: imageSet.reactionOrpheus,
        body: data.body,
        centralAI: data.centralAI,
        orpheus: data.orpheus,
        observation: data.observation,
        next: data.next,
      })
      setAiState({ loading: false, error: "" })
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      setAiState({
        loading: false,
        error: error instanceof Error ? error.message : "AI生成に失敗しました。",
      })
    }
  }

  return (
    <SceneFrame
      scene={scene}
      label={label}
      onMove={moveToScene}
      onChoose={chooseAction}
      onGenerateAiBranch={generateAiBranch}
      aiState={aiState}
    />
  )
}
