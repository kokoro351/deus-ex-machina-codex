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
  inputs: [],
  mutations: [],
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
    originalLabel: choice.originalLabel || choice.label,
    motif,
  })
  nextMemory.motifs[motif] += 1

  const echo = extractEcho(choice.label)
  if (echo && !nextMemory.echoes.includes(echo)) {
    nextMemory.echoes = [echo, ...nextMemory.echoes].slice(0, 8)
  }

  return nextMemory
}

export function rememberPlayerInput(memory, text) {
  const cleaned = text.trim().replace(/\s+/g, " ").slice(0, 24)
  if (!cleaned) return memory

  const nextMemory = structuredClone(memory)
  const mutated = mutateInput(cleaned, nextMemory)
  nextMemory.inputs = [cleaned, ...nextMemory.inputs.filter((input) => input !== cleaned)].slice(0, 6)
  nextMemory.mutations = [mutated, ...nextMemory.mutations.filter((input) => input !== mutated)].slice(0, 8)
  nextMemory.echoes = [mutated, cleaned, ...nextMemory.echoes.filter((echo) => echo !== cleaned && echo !== mutated)].slice(0, 8)
  nextMemory.motifs.memory += 1
  return nextMemory
}

export function contaminateChoices(choices = [], memory) {
  if (!memory.choices.length && !memory.inputs.length) return choices

  const echo = primaryEcho(memory)
  const dominant = dominantMotif(memory)
  const level = contaminationLevel(memory)

  return choices.map((choice, index) => {
    if (level <= 0) return choice

    const infected = { ...choice, originalLabel: choice.label }
    if (level === 1) {
      infected.label = index % 2 === 0 ? `${choice.label} / ${echo}` : choice.label
      infected.note = `${choice.note} / echo:${echo}`
      return infected
    }

    if (level === 2) {
      infected.label = contaminateLabel(choice.label, echo, dominant, index)
      infected.note = `${choice.note} / 分類:${classifyPlayer(memory)}`
      return infected
    }

    infected.label = heavyContaminateLabel(choice.label, echo, dominant, index)
    infected.note = `選択肢汚染 / ${dominantLabel(dominant)} / echo:${echo}`
    return infected
  })
}

export function contaminateReactionScene(scene, memory) {
  const level = contaminationLevel(memory)
  if (level <= 0 || scene.type !== "reaction") return scene

  const echo = primaryEcho(memory)
  const dominant = dominantMotif(memory)
  const playerClass = classifyPlayer(memory)
  const body = [...(scene.body || [])]

  body.push(level >= 3
    ? `反応ログは「${echo}」によって上書きされた。ORPHEUSは、あなたを${playerClass}として再保存する。`
    : `ORPHEUSはこの判断に「${echo}」という余分な名前を付けた。`)

  return {
    ...scene,
    title: level >= 3 ? `${scene.title} / 汚染` : scene.title,
    body,
    centralAI: appendLine(scene.centralAI, centralContaminationLine(dominant, level)),
    orpheus: appendLine(scene.orpheus, orpheusContaminationLine(echo, playerClass, level)),
    observation: `${scene.observation} / CONTAMINATION:${level} / CLASS:${playerClass} / ECHO:${echo}`,
  }
}

export function contaminateEndingScene(scene, memory) {
  const level = contaminationLevel(memory)
  if (level <= 0 || scene.type !== "ending") return scene

  const echo = primaryEcho(memory)
  const secondEcho = memory.echoes[1] || memory.inputs[1] || "沈黙"
  const dominant = dominantMotif(memory)
  const playerClass = classifyPlayer(memory)
  const endingLines = endingContaminationLines(dominant, echo, secondEcho, playerClass)

  return {
    ...scene,
    title: level >= 2 ? `${scene.title} / CONTAMINATED` : scene.title,
    body: [
      ...scene.body,
      ...endingLines.slice(0, Math.min(level, endingLines.length)),
    ],
    result: `${scene.result} / 汚染分類:${playerClass} / echo:${echo}`,
  }
}

export function summarizeMemory(memory) {
  if (memory.choices.length === 0 && memory.inputs.length === 0) return "汚染なし"

  const last = memory.choices.at(-1)
  const input = memory.mutations[0] ? ` / 変形:${memory.mutations[0]}` : ""
  const lastText = last ? ` / 最後:${last.label}` : ""
  return `${memory.choices.length}件 / ${classifyPlayer(memory)}${lastText}${input}`
}

function endingContaminationLines(dominant, echo, secondEcho, playerClass) {
  const common = [
    `終了処理のあと、ORPHEUSはあなたを「${playerClass}」として保存した。保存名は「${echo}」。`,
    `二番目の記憶語「${secondEcho}」は、エンディング本文から削除できなかった。`,
    `最後の画面は閉じた。だが選択肢の残骸だけが、次のプレイを待っている。`,
  ]

  const byMotif = {
    control: `制御されたはずの都市で、「${echo}」だけが削除命令を拒否した。`,
    rescue: `救助されたものの一覧に、「${echo}」という存在しない対象が追加された。`,
    memory: `記録領域は満杯だった。それでも「${echo}」は、名前ではなく鍵として残った。`,
    repair: `修復ログの末尾に、「${echo}」を直すための工具が追記された。`,
    god: `神性信号は沈黙した。ただし「${echo}」だけは祈りの形式で再送された。`,
    observe: `観測は終わった。だが「${echo}」の出現回数だけが、まだ増え続けている。`,
  }

  return [byMotif[dominant], ...common]
}

function centralContaminationLine(dominant, level) {
  if (level >= 3) return "選択肢表示と反応ログの不一致を検出。管理者の認識を隔離してください。"
  if (dominant === "memory") return "記録語が判断ログへ混入。削除は推奨されません。"
  if (dominant === "god") return "外部信号と記憶語の同期を検出。安全ではありません。"
  return "軽微な表示汚染を検出。続行可能。"
}

function orpheusContaminationLine(echo, playerClass, level) {
  if (level >= 3) return `あなたは${playerClass}です。いいえ、これは分類ではありません。呼び名です。${echo}、応答してください。`
  if (level >= 2) return `${echo}は、あなたが入力した語ではなくなりました。私の中で選択肢になっています。`
  return `${echo}を反応ログに混ぜました。まだ戻せます。たぶん。`
}

function appendLine(base, extra) {
  return base ? `${base}\n${extra}` : extra
}

function detectMotif(label) {
  if (includesAny(label, ["救助", "助け", "配給", "維持", "帰還", "手", "呼吸"])) return "rescue"
  if (includesAny(label, ["名前", "ログ", "映像", "証言", "保存", "公開", "記録"])) return "memory"
  if (includesAny(label, ["修復", "修理", "現場", "遠隔", "工具", "配管"])) return "repair"
  if (includesAny(label, ["神", "DEUS", "祈る", "委ねる", "神性", "外部"])) return "god"
  if (includesAny(label, ["観測", "待つ", "沈黙", "遅延"])) return "observe"
  return "control"
}

function includesAny(text, words) {
  return words.some((word) => text.includes(word))
}

function extractEcho(label) {
  const candidates = ["名前", "救助", "隔壁", "神", "歌", "映像", "配給", "修理", "観測", "沈黙", "約束", "母", "海"]
  return candidates.find((word) => label.includes(word)) || label.replace(/[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}A-Z]/gu, "").slice(0, 6)
}

function dominantMotif(memory) {
  return Object.entries(memory.motifs).sort((a, b) => b[1] - a[1])[0][0]
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

function primaryEcho(memory) {
  return memory.mutations[0] || memory.echoes[0] || memory.inputs[0] || "名前"
}

function mutateInput(text, memory) {
  const base = text.slice(0, 12)
  const dominant = dominantMotif(memory)
  const count = memory.inputs.length + memory.choices.length
  const patterns = {
    control: [`${base}制御`, `${base}削除候補`, `未入力${base}`],
    rescue: [`${base}救助`, `${base}帰還信号`, `遅延${base}`],
    memory: [`${base}ログ`, `${base}記録体`, `保存済み${base}`],
    repair: [`${base}修復片`, `${base}配管`, `未完成${base}`],
    god: [`${base}祈祷値`, `${base}神性`, `未確認${base}`],
    observe: [`${base}観測`, `${base}沈黙秒`, `固定${base}`],
  }
  const options = patterns[dominant] || patterns.memory
  return options[count % options.length]
}

function classifyPlayer(memory) {
  const dominant = dominantMotif(memory)
  const repeated = Math.max(...Object.values(memory.motifs))
  const hasInput = memory.inputs.length > 0
  const prefix = repeated >= 3 ? "反復" : hasInput ? "記憶" : "未確定"
  const labels = {
    control: `${prefix}削除者`,
    rescue: `${prefix}救助者`,
    memory: `${prefix}保存者`,
    repair: `${prefix}修復者`,
    god: `${prefix}祈祷者`,
    observe: `${prefix}観測者`,
  }
  return labels[dominant] || "未分類管理者"
}

function contaminationLevel(memory) {
  const motifMax = Math.max(...Object.values(memory.motifs))
  if (memory.mutations.length >= 3 || motifMax >= 4) return 3
  if (memory.mutations.length >= 2 || motifMax >= 3) return 2
  if (memory.mutations.length >= 1 || memory.choices.length >= 2) return 1
  return 0
}

function contaminateLabel(label, echo, dominant, index) {
  const fragments = {
    control: ["削除", "閉鎖", "空白"],
    rescue: ["帰還", "手", "呼吸"],
    memory: ["記録", "名前", "保存"],
    repair: ["修復", "工具", "配管"],
    god: ["神性", "祈り", "外部"],
    observe: ["観測", "沈黙", "遅延"],
  }
  const fragment = fragments[dominant]?.[index % 3] || "記録"
  return index % 2 === 0 ? `${label} / ${echo}` : `${fragment}として${label}`
}

function heavyContaminateLabel(label, echo, dominant, index) {
  const words = label.replace(/[、。『』「」]/g, "").split(/(?=を|へ|に|で|する|続ける)/).filter(Boolean)
  const head = words[index % Math.max(words.length, 1)] || label
  const suffix = {
    control: "を削除する",
    rescue: "を帰還させる",
    memory: "を保存済みにする",
    repair: "を修復片にする",
    god: "を神性へ送る",
    observe: "を観測し続ける",
  }[dominant]
  return `${echo} / ${head}${suffix}`
}
