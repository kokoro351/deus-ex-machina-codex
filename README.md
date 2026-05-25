# DEUS EX MACHINA Codex Edition

「デウスエクスマキナ」を Codex で編集しやすいように整理した版です。

元版は `index.html` にゲーム本体がまとまっていました。この版では、文章・分岐・画像・画面部品を分けてあります。

## 起動方法

最初の1回だけ:

```bash
npm install
```

起動:

```bash
npm run dev
```

表示されたURL、たとえば `http://127.0.0.1:5173/deus-ex-machina-codex/` をブラウザで開くと遊べます。

PowerShellで `npm` が止められる場合は、次のように `npm.cmd` を使ってください。

```powershell
npm.cmd run dev
```

## ORPHEUS Automata

この版には、OpenAI APIを使わない無料の機械生成分岐があります。

選択肢画面で `ORPHEUS Automataを起動する` を押すと、プレイヤーの選択履歴から、その場だけの反応や分岐を生成します。

選択肢画面では、プレイヤーが短い言葉を入力して ORPHEUS に記憶させることもできます。入力された言葉は、Automataの反応や専用エンディングに混ざります。

記憶が一定以上たまると、ボタンが `ORPHEUS Automataの結末を見る` に変わり、専用エンディングへ進めます。

詳しくは `docs/orpheus-automata.md` を見てください。

## よく編集する場所

- `src/data/scenes.js`: シナリオ本文、選択肢、分岐先、通常エンディング
- `src/utils/orpheusAutomata.js`: ORPHEUS Automata の記憶・分類・生成・専用エンディング
- `src/data/assets.js`: 画像URL
- `src/styles.css`: 見た目
- `src/components/`: 画面部品
- `docs/codex-editing-guide.md`: Codexへ依頼するときの書き方

## 初心者向けメモ

文章だけ直したいときは、まず `src/data/scenes.js` を見れば大丈夫です。

Automataの挙動を変えたいときは、`src/utils/orpheusAutomata.js` を編集します。

選択肢の `next` には、次に進むシーンの `id` を書きます。存在しない `id` を書くと、選んだあとに想定外の画面になります。

## 元ファイル

元の大きな `index.html` は `legacy/original-index.html` に残してあります。
