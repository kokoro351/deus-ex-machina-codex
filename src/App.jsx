import { useMemo, useState } from "react"
import SceneFrame from "./components/SceneFrame.jsx"
import { scenes } from "./data/scenes.js"
import {
  contaminateChoices,
  contaminateEndingScene,
  contaminateReactionScene,
  createInitialMemory,
  rememberChoice,
  rememberPlayerInput,
  summarizeMemory,
} from "./utils/contamination.js"
import { buildReactionScene } from "./utils/reactions.js"

export default function App() {
  const [sceneId, setSceneId] = useState("title")
  const [reaction, setReaction] = useState(null)
  const [memory, setMemory] = useState(() => createInitialMemory())
  const [playerInput, setPlayerInput] = useState("")
  const baseScene = reaction ?? scenes[sceneId] ?? scenes.title
  const scene = baseScene.type === "ending" ? contaminateEndingScene(baseScene, memory) : baseScene
  const displayedChoices = scene.type === "choice" ? contaminateChoices(scene.choices, memory) : []

  const label = useMemo(() => {
    if (scene.type === "title") return "TITLE"
    if (scene.type === "prologue") return scene.subtitle
    if (scene.type === "choice") return `TURN ${scene.turn}`
    if (scene.type === "reaction") return scene.subtitle
    return "ENDING"
  }, [scene])

  function moveToScene(nextId) {
    setReaction(null)
    if (nextId === "title") setMemory(createInitialMemory())
    setSceneId(nextId)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function chooseAction(choice) {
    const nextMemory = rememberChoice(memory, scene, choice)
    setMemory(nextMemory)
    setReaction(contaminateReactionScene(buildReactionScene(scene, choice), nextMemory))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function submitPlayerInput(event) {
    event.preventDefault()
    setMemory(rememberPlayerInput(memory, playerInput))
    setPlayerInput("")
  }

  return (
    <SceneFrame
      scene={scene}
      label={label}
      onMove={moveToScene}
      onChoose={chooseAction}
      displayedChoices={displayedChoices}
      onPlayerInputChange={setPlayerInput}
      onRememberInput={submitPlayerInput}
      memorySummary={summarizeMemory(memory)}
      playerInput={playerInput}
    />
  )
}
