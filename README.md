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

表示されたURL、たとえば `http://127.0.0.1:5173/` をブラウザで開くと遊べます。

## よく編集する場所

- `src/data/scenes.js`: シナリオ本文、選択肢、分岐先、エンディング
- `src/data/assets.js`: 画像URL
- `src/styles.css`: 見た目
- `src/components/`: 画面部品
- `docs/codex-editing-guide.md`: Codexへ依頼するときの書き方

## 初心者向けメモ

文章だけ直したいときは、ほぼ `src/data/scenes.js` だけ見れば大丈夫です。

選択肢の `next` には、次に進むシーンの `id` を書きます。存在しない `id` を書くと、選んだあとに想定外の画面になります。

## 元ファイル

元の大きな `index.html` は `legacy/original-index.html` に残してあります。
