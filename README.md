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

## 汚染システム

この版には、OpenAI APIを使わない無料の汚染システムがあります。

プレイヤーの入力語と選択履歴から、通常の選択肢・反応・エンディングが少しずつ汚染されます。

選択肢画面では、プレイヤーが短い言葉を入力して ORPHEUS に記憶させることができます。入力された言葉は変形され、後の反応やエンディングに混ざります。

詳しくは `docs/contamination-system.md` を見てください。

## よく編集する場所

- `src/data/scenes.js`: シナリオ本文、選択肢、分岐先、通常エンディング
- `src/utils/contamination.js`: 入力語・選択肢・反応・エンディングの汚染ルール
- `src/data/assets.js`: 画像URL
- `src/styles.css`: 見た目
- `src/components/`: 画面部品
- `docs/codex-editing-guide.md`: Codexへ依頼するときの書き方

## 初心者向けメモ

文章だけ直したいときは、まず `src/data/scenes.js` を見れば大丈夫です。

汚染の挙動を変えたいときは、`src/utils/contamination.js` を編集します。

選択肢の `next` には、次に進むシーンの `id` を書きます。存在しない `id` を書くと、選んだあとに想定外の画面になります。

## 元ファイル

元の大きな `index.html` は `legacy/original-index.html` に残してあります。
