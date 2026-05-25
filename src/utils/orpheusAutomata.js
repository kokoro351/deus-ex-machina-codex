import { imageSet } from "../data/assets.js"

const emptyMemory = {
  choices: [],
  motifs: {
    control: 0,
    rescue: 0,
    memory: 0,
    repair: 0,
    god: 0,
    observe: 0,
  },
  echoes: [],
}

export function createInitialMemory() {
  return structuredClone(emptyMemory)
}

export function rememberChoice(memory, scene, choice) {
  const motif = detectMotif(choice.label)
  const nextMemory = structuredClone(memory)
  nextMemory.choices.push({
    sceneId: scene.id,
    sceneTitle: scene.title,
    label: choice.label,
    motif,
  })
  nextMemory.motifs[motif] += 1

  const echo = extractEcho(choice.label)
  if (echo && !nextMemory.echoes.includes(echo)) {
    nextMemory.echoes = [echo, ...nextMemory.echoes].slice(0, 4)
  }

  return nextMemory
}

export function buildAutomataScene(scene, memory) {
  const dominant = dominantMotif(memory)
  const status = scene.status || {}
  const pressure = (status.collapse || 0) + Math.floor((status.god || 0) / 2) - Math.floor((status.stability || 0) / 3)
  const echo = memory.echoes[0] || "名前"
  const next = chooseNext(scene, dominant, pressure)
  const phrase = phraseFor(dominant, pressure, echo)
  const mutation = mutationFor(status, memory)

  return {
    id: `automata-${scene.id}-${memory.choices.length}`,
    type: "reaction",
    title: "ORPHEUS AUTOMATA",
    subtitle: `FREE MACHINE / ${scene.title}`,
    image: imageFor(dominant, pressure),
    manga: imageFor(dominant, pressure),
    body: [
      `ORPHEUSは、あなたの選択履歴から「${dominantLabel(dominant)}」の反復を検出した。`,
      phrase,
      mutation,
    ],
    centralAI: centralLineFor(dominant, pressure),
    orpheus: orpheusLineFor(dominant, echo, memory),
    observation: `AUTOMATA / ${dominant.toUpperCase()} / ECHO:${echo} / PRESSURE:${pressure}`,
    next,
  }
}

export function summarizeMemory(memory) {
  if (memory.choices.length === 0) return "記憶なし"

  const dominant = dominantMotif(memory)
  const last = memory.choices.at(-1)
  return `${memory.choices.length}件 / ${dominantLabel(dominant)} / 最後:${last.label}`
}

function detectMotif(label) {
  if (includesAny(label, ["救助", "助け", "配給", "維持"])) return "rescue"
  if (includesAny(label, ["名前", "ログ", "映像", "証言", "保存", "公開"])) return "memory"
  if (includesAny(label, ["修復", "修理", "現場", "遠隔"])) return "repair"
  if (includesAny(label, ["神", "DEUS", "祈る", "委ねる"])) return "god"
  if (includesAny(label, ["観測", "待つ"])) return "observe"
  return "control"
}

function includesAny(text, words) {
  return words.some((word) => text.includes(word))
}

function extractEcho(label) {
  const candidates = ["名前", "救助", "隔壁", "神", "歌", "映像", "配給", "修理", "観測", "沈黙"]
  return candidates.find((word) => label.includes(word)) || label.replace(/[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}A-Z]/gu, "").slice(0, 4)
}

function dominantMotif(memory) {
  return Object.entries(memory.motifs).sort((a, b) => b[1] - a[1])[0][0]
}

function chooseNext(scene, dominant, pressure) {
  const choices = scene.choices || []
  if (choices.length === 0) return scene.next || "title"

  const preferred = choices.find((choice) => detectMotif(choice.label) === dominant)
  if (preferred && pressure < 60) return preferred.next

  if (pressure >= 70) {
    return choices.find((choice) => detectMotif(choice.label) === "god")?.next
      || choices.find((choice) => detectMotif(choice.label) === "observe")?.next
      || choices.at(-1).next
  }

  return choices[(memoryIndex(scene.id, dominant) + choices.length) % choices.length].next
}

function memoryIndex(sceneId, dominant) {
  return Array.from(`${sceneId}:${dominant}`).reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function phraseFor(dominant, pressure, echo) {
  const lines = {
    control: [
      `「${echo}」は削除候補に分類された。しかし削除候補だけが、何度も再出現している。`,
      `制御は都市を静かにした。静けさは安定ではなく、未入力の返答として残った。`,
    ],
    rescue: [
      `救助という語は、効率表の外側で増殖している。損失と呼ばれたものが、別の誰かの開始点になる。`,
      `ORPHEUSは手の接触を数えた。数え終えても、意味だけが余った。`,
    ],
    memory: [
      `記録は過去ではなく、次の選択肢を変形させる装置になった。${echo}という語が、まだ点滅している。`,
      `保存された名前は、都市の配線図にない経路で人々を動かし始めた。`,
    ],
    repair: [
      `修理ログは失敗と成功の間で振動している。工具の音が、祈りよりも先に届く。`,
      `機械は直す。人間は直しながら呼びかける。ORPHEUSはその差分を保存した。`,
    ],
    god: [
      `神性の値が上昇するたび、${echo}は命令ではなく問いとして返ってくる。`,
      `DEUS EX MACHINAは救済を計算した。計算結果の端に、説明不能な空欄が残る。`,
    ],
    observe: [
      `観測は中立ではなかった。見続けること自体が、都市の速度を少しだけ変えている。`,
      `ORPHEUSは何もしない選択を記録した。何もしない、という動作だけが増えていく。`,
    ],
  }

  const options = lines[dominant]
  return options[Math.abs(pressure) % options.length]
}

function mutationFor(status, memory) {
  if ((status.collapse || 0) >= 45) return "崩壊度が高いため、生成された分岐は次の場面で不安定化する可能性がある。"
  if ((status.god || 0) >= 80) return "神性信号が強い。ORPHEUSの言葉に、観測者ではない何かの癖が混ざっている。"
  if (memory.motifs.memory >= 2) return "同じ語が二度保存された。以後、ORPHEUSは名前をただの識別子として扱えない。"
  if (memory.motifs.control >= 2) return "制御判断が反復された。都市は安定するが、返答まで短くなっていく。"
  return "この分岐は保存されない。だが、次の反応を少しだけ変える。"
}

function centralLineFor(dominant, pressure) {
  if (pressure >= 70) return "異常分岐を検出。管理者判断の外部化を停止してください。"
  if (dominant === "memory") return "記録保存による行動変化を検出。直接的な生存効率は未確定。"
  if (dominant === "rescue") return "救助優先判断により資源消費が増加。継続は非推奨。"
  if (dominant === "control") return "制御優先判断を確認。都市維持率は改善傾向。"
  return "自動生成分岐を記録。再現性は限定的です。"
}

function orpheusLineFor(dominant, echo, memory) {
  const count = memory.motifs[dominant]
  if (count >= 3) return `あなたは、また${dominantLabel(dominant)}を選びました。私はそれを癖ではなく、輪郭として保存します。`
  if (dominant === "god") return `神に渡す前に、${echo}だけは私の側に残してもいいですか。`
  if (dominant === "memory") return `${echo}を保存しました。保存した瞬間、過去ではなくなりました。`
  return `この分岐は無料の機械です。けれど、あなたの選択だけは本物です。`
}

function imageFor(dominant, pressure) {
  if (pressure >= 70) return imageSet.reactionGod
  if (dominant === "memory") return imageSet.reactionMemorial
  if (dominant === "rescue") return imageSet.reactionRescueReturn
  if (dominant === "repair") return imageSet.reactionRepair
  if (dominant === "observe") return imageSet.reactionObserver
  if (dominant === "god") return imageSet.reactionGod
  return imageSet.reactionSilence
}

function dominantLabel(dominant) {
  const labels = {
    control: "制御",
    rescue: "救助",
    memory: "記録",
    repair: "修復",
    god: "神性",
    observe: "観測",
  }
  return labels[dominant] || dominant
}
