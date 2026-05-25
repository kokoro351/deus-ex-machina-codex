import { useMemo, useState } from "react"
import SceneFrame from "./components/SceneFrame.jsx"
import { scenes } from "./data/scenes.js"
import { buildReactionScene } from "./utils/reactions.js"

export default function App() {
  const [sceneId, setSceneId] = useState("title")
  const [reaction, setReaction] = useState(null)
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
    setSceneId(nextId)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function chooseAction(choice) {
    setReaction(buildReactionScene(scene, choice))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <SceneFrame
      scene={scene}
      label={label}
      onMove={moveToScene}
      onChoose={chooseAction}
    />
  )
}
