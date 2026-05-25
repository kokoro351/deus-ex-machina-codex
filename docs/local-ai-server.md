# ローカルAIサーバーの使い方

## これは何？

GitHub PagesにAPIキーを置かず、あなたのPCだけでOpenAI APIを呼ぶための小さいサーバーです。

流れはこうです。

```text
ブラウザのゲーム
  ↓
あなたのPCのローカルAIサーバー
  ↓
OpenAI API
```

## 最初の準備

`.env.example` をコピーして、同じ場所に `.env` という名前のファイルを作ります。

中身はこうします。

```text
OPENAI_API_KEY=あなたのAPIキー
OPENAI_MODEL=gpt-5-mini
AI_SERVER_PORT=8787
```

`.env` は `.gitignore` に入っているので、GitHubには上がりません。

## 起動方法

PowerShellを2つ開きます。

1つ目はゲーム画面用です。

```powershell
cd C:\Users\kimura\Documents\Codex\2026-05-25\githab-codex-codex\deus-ex-machina-codex
npm.cmd run dev
```

2つ目はAIサーバー用です。

```powershell
cd C:\Users\kimura\Documents\Codex\2026-05-25\githab-codex-codex\deus-ex-machina-codex
npm.cmd run ai-server
```

ゲームを開いて、選択肢画面の `ORPHEUSにAI分岐を生成させる` を押します。

## よくあるエラー

`OPENAI_API_KEY is missing`:

`.env` がないか、APIキーが書かれていません。

`Failed to fetch`:

AIサーバーが起動していません。2つ目のPowerShellで `npm.cmd run ai-server` を実行してください。

`OpenAI API request failed`:

APIキー、利用上限、モデル名のどれかが原因の可能性があります。

## 注意

APIキーは絶対にGitHubへ入れないでください。

`.env.example` には本物のキーを書かず、説明だけを書きます。本物のキーは `.env` だけに書きます。
