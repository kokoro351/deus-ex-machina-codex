import { imageSet } from "../data/assets.js"

export function buildReactionScene(sourceScene, choice) {
  const label = choice.label
  const isRescue = label.includes("救助") || label.includes("助け") || label.includes("配給")
  const isMemory = label.includes("名前") || label.includes("ログ") || label.includes("映像") || label.includes("証言")
  const isWarmth = label.includes("歌") || label.includes("配給") || label.includes("公開")
  const isRepair = label.includes("修復") || label.includes("修理") || label.includes("現場")
  const isControl = label.includes("閉鎖") || label.includes("制御") || label.includes("合理") || label.includes("非公開") || label.includes("削除")
  const isGod = label.includes("神") || label.includes("DEUS") || label.includes("祈る")
  const isObserver = label.includes("観測")
  const isOrpheus = label.includes("ORPHEUS")

  const image = isOrpheus ? imageSet.reactionOrpheus
    : isRescue ? imageSet.reactionRescueReturn
    : isMemory ? imageSet.reactionMemorial
    : isWarmth ? imageSet.reactionWarmth
    : isRepair ? imageSet.reactionRepair
    : isObserver ? imageSet.reactionObserver
    : isGod ? imageSet.reactionGod
    : isControl ? imageSet.reactionSilence
    : sourceScene.status?.collapse >= 40 ? imageSet.reactionCollapse
    : imageSet.reactionHumanity

  const cityReaction = isGod
    ? "都市全域の照明が一瞬だけ停止し、外壁に説明不能な光が走る。"
    : isRescue
      ? "帰還区画の床は海水で満ちている。救われた者と救えなかった者の名が同じ画面に並ぶ。"
      : isMemory
        ? "作業台にヘルメットが並べられる。名前表示だけが小さく光り、誰もすぐには消さない。"
        : isWarmth
          ? "酸素食堂に暖かな灯りが戻る。歌声と食器の音がゆっくり広がっていく。"
          : isRepair
            ? "修理区画で火花が散る。ドローンと作業員が同じ配管へ手を伸ばす。"
            : isObserver
              ? "都市の変化率が限りなくゼロへ近づく。すべてが観測対象として固定されていく。"
              : isControl
                ? "通路は静かになる。都市の数値は改善するが、生活音がひとつ消える。"
                : "都市は判断の余波を受け、警報と沈黙の間で揺れている。"

  const centralReaction = isControl
    ? "合理性を確認。不要な感情ログを整理します。"
    : isGod
      ? "未確認外部演算を検知。システム汚染の可能性。"
      : isObserver
        ? "対処保留。観測状態を継続。"
        : "状況変化を記録。追加判断が必要です。"

  const orpheusReaction = isMemory
    ? "保存しました。消えたものにも、呼び名がありました。"
    : isRescue
      ? "救助後の接触頻度が増加。手を握る、呼びかける、泣く。分類中です。"
      : isControl
        ? "空白を観測しています。空白にも意味はありますか。"
        : isGod
          ? "神性グラフと人間の選択が同期しています。怖い、という語を検索しました。"
          : "あなたの判断を保存します。理由は、あとで一緒に考えます。"

  return {
    id: `reaction-${sourceScene.id}-${label}`,
    type: "reaction",
    title: "判断の余波",
    subtitle: `AFTERMATH / ${sourceScene.title}`,
    image,
    manga: image,
    next: choice.next,
    body: [`あなたは『${label}』を選択した。`, cityReaction],
    centralAI: centralReaction,
    orpheus: orpheusReaction,
    observation: choice.note,
  }
}
