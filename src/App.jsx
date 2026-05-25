import { useMemo, useState } from "react"
import SceneFrame from "./components/SceneFrame.jsx"
import { scenes } from "./data/scenes.js"
import {
  buildAutomataScene,
  createInitialMemory,
  rememberChoice,
  rememberPlayerInput,
  shouldOfferAutomataEnding,
  summarizeMemory,
} from "./utils/orpheusAutomata.js"
import { buildReactionScene } from "./utils/reactions.js"

export default function App() {
  const [sceneId, setSceneId] = useState("title")
  const [reaction, setReaction] = useState(null)
  const [memory, setMemory] = useState(() => createInitialMemory())
  const [playerInput, setPlayerInput] = useState("")
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
    if (nextId === "title") setMemory(createInitialMemory())
    setSceneId(nextId)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function chooseAction(choice) {
    const nextMemory = rememberChoice(memory, scene, choice)
    setMemory(nextMemory)
    setReaction(buildReactionScene(scene, choice))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function generateAutomataBranch() {
    const result = buildAutomataScene(scene, memory)
    setMemory(result.memory)
    setReaction(result.scene)
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
      onGenerateAutomataBranch={generateAutomataBranch}
      onPlayerInputChange={setPlayerInput}
      onRememberInput={submitPlayerInput}
      canGenerateAutomataEnding={shouldOfferAutomataEnding(scene, memory)}
      memorySummary={summarizeMemory(memory)}
      playerInput={playerInput}
    />
  )
}
