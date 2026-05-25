import { imageSet } from "../data/assets.js"
import StatusGrid from "./StatusGrid.jsx"
import OrpheusLine from "./OrpheusLine.jsx"

export default function SceneFrame({
  scene,
  label,
  onMove,
  onChoose,
  onGenerateAutomataBranch,
  canGenerateAutomataEnding,
  memorySummary,
}) {
  const isTitle = scene.type === "title"
  const isPrologue = scene.type === "prologue"
  const isChoice = scene.type === "choice"
  const isReaction = scene.type === "reaction"
  const isEnding = scene.type === "ending"
  const highRisk = isChoice && scene.status.collapse >= 40
  const godRisk = isChoice && scene.status.god >= 80
  const automataLabel = canGenerateAutomataEnding
    ? "ORPHEUS Automataの結末を見る"
    : "ORPHEUS Automataを起動する"
  const automataNote = canGenerateAutomataEnding
    ? "記憶が臨界に達しています。選択履歴から専用エンディングを生成します"
    : "無料。選択履歴から、その場だけの分岐を機械生成します"

  return (
    <main className={`app-shell ${godRisk ? "deus-pulse" : ""}`}>
      <article className={`game-card ${highRisk ? "danger" : ""}`}>
        <section className="hero-panel">
          <img src={scene.image} alt={scene.title} className="hero-image" />
          <div className="hero-shade" />
          <div className="scene-label">{label}</div>
          {highRisk && <div className="risk-label">COLLAPSE WARNING</div>}
          {godRisk && <div className="god-label">DEUS SIGNAL</div>}
          <div className="hero-copy">
            <div className="series-title">DEUS EX MACHINA</div>
            <h1>{scene.title}</h1>
            <p>{scene.body ? scene.body[0] : scene.subtitle}</p>
          </div>
        </section>

        {(isChoice || isReaction) && <ReactionStrip scene={scene} />}

        <section className="text-panel">
          {scene.body?.slice(1).map((line, index) => (
            <p key={`${scene.id}-body-${index}`}>{line}</p>
          ))}

          {(isChoice || isReaction) && (
            <>
              <div className="ai-line central-line">
                <strong>中央管理AI</strong>
                <p>{scene.centralAI}</p>
              </div>
              <OrpheusLine text={scene.orpheus} />
              <div className="observation-line">{scene.observation}</div>
            </>
          )}

          {isChoice && <div className="memory-line">ORPHEUS記憶: {memorySummary}</div>}
          {isEnding && <div className="ending-result">{scene.result}</div>}
        </section>

        {isChoice && <StatusGrid status={scene.status} />}

        <section className="action-panel">
          {isTitle && <PrimaryButton onClick={() => onMove(scene.next)}>START</PrimaryButton>}
          {isPrologue && <PrimaryButton onClick={() => onMove(scene.next)}>{scene.button}</PrimaryButton>}
          {isChoice && (
            <button onClick={onGenerateAutomataBranch} className={canGenerateAutomataEnding ? "automata-button ending-ready" : "automata-button"}>
              <span>{automataLabel}</span>
              <small>{automataNote}</small>
            </button>
          )}
          {isChoice && scene.choices.map((choice, index) => (
            <button key={`${scene.id}-${choice.label}`} onClick={() => onChoose(choice)} className="choice-button">
              <span>{index + 1}. {choice.label}</span>
              <small>{choice.note}</small>
            </button>
          ))}
          {isReaction && <PrimaryButton onClick={() => onMove(scene.next)}>次へ進む</PrimaryButton>}
          {isEnding && <button onClick={() => onMove("title")} className="choice-button">最初からやり直す</button>}
        </section>
      </article>
    </main>
  )
}

function PrimaryButton({ children, onClick }) {
  return <button onClick={onClick} className="primary-button">{children}</button>
}

function ReactionStrip({ scene }) {
  return (
    <section className="reaction-strip">
      <MiniImage src={scene.manga || scene.image || imageSet.manga} label="都市反応" />
      <MiniImage src={imageSet.central} label="中央AI" />
      <MiniImage src={imageSet.orpheus} label="ORPHEUS" />
    </section>
  )
}

function MiniImage({ src, label }) {
  return (
    <div className="mini-image">
      <img src={src} alt={label} />
      <span>{label}</span>
    </div>
  )
}
