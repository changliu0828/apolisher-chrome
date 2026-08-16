<p align="center">
  <img src="../public/icons/icon-raw.png" alt="APolish Logo" width="400">
</p>

<h1 align="center">APolish</h1>

<p align="center">
  <strong>AI であなたのテキストを磨く</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/chrome-extension-red" alt="Chrome">
  <img src="https://img.shields.io/badge/typescript-5.x-blue" alt="TypeScript">
</p>

<p align="center">
  <a href="../README.md">English</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <strong>日本語</strong> |
  <a href="README.es.md">Español</a> |
  <a href="README.pt.md">Português</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.hi.md">हिन्दी</a>
</p>

---

プライバシー重視の Chrome 拡張機能で、AI を使用してあらゆるウェブページのテキストを校正します。テキストを選択し、校正ボタンをクリックして、視覚的な差分比較を備えた AI 強化された提案を取得します。

## 機能

- **マルチプロバイダー AI サポート**：独自の API キーを使用して、OpenAI、Claude、または Gemini から選択
- **テキスト校正**：任意のテキストを選択して AI で校正
- **複数のプリセット**：標準、プロフェッショナル、ネイティブスピーカー、簡潔、気遣いのある発言、またはカスタムプロンプト
- **モデル選択**：プロバイダーごとに、API キーで利用できる任意のモデルを選択できます（一覧は API から取得）
- **クイック切り替え**：ツールバーのポップアップから拡張機能を有効/無効にできます
- **視覚的差分**：挿入（緑色）と削除（赤色）で強調表示された変更を確認
- **プライバシー優先**：API キーはローカルに保存され、データ収集やテレメトリはありません
- **普遍的な互換性**：Gmail、Google Docs などを含む、あらゆるウェブページで動作

## インストール

### ソースからインストール

1. リポジトリをクローン：
```bash
git clone https://github.com/changliu0828/apolisher-chrome.git
cd apolisher-chrome
```

2. 依存関係をインストール：
```bash
npm install
```

3. 拡張機能をビルド：
```bash
npm run build
```

4. Chrome に読み込む：
   - `chrome://extensions` を開く
   - 「デベロッパーモード」を有効にする
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - `dist` フォルダを選択

## 使用方法

1. **セットアップ**：拡張機能の設定で AI プロバイダー（OpenAI、Claude、または Gemini）を選択し、API キーを追加
2. **選択**：任意のウェブページでテキストをハイライト
3. **校正**：表示される <img src="../public/icons/icon32.png" width="16" height="16" alt="APolish アイコン" style="vertical-align: middle;"> ボタンをクリック
4. **レビュー**：モーダルで差分比較を表示
5. **承認**：チェックマークをクリックして変更を適用

## 設定

拡張機能アイコンをクリックするか、右クリックして「オプション」を選択して設定にアクセス：

- **AI プロバイダー**：OpenAI (GPT-5.6 Luna)、Claude (Haiku 4.5)、または Gemini (3.1 Flash Lite) から選択
- **API キー**：プロバイダー固有の API キー（Chrome 同期ストレージに安全に保存）
- **モデル**：選択したプロバイダーで使うモデルを選べます。一覧は API キーで取得されます（既定は上記のモデル）
- **プロンプトプリセット**：標準、プロフェッショナル、ネイティブ、簡潔、気遣いのある発言、またはカスタムから選択
- **最大Token数**：応答の長さを制御（100-4000 Token、デフォルト：2000）

## 技術スタック

- **React** + **TypeScript** - UI コンポーネント
- **Vite** - @crxjs/vite-plugin を使用したビルドシステム
- **Tailwind CSS** - スタイリング
- **Chrome Extension Manifest V3** - 拡張機能アーキテクチャ
- **マルチプロバイダー AI**：OpenAI (GPT-5.6 Luna)、Claude (Haiku 4.5)、または Gemini (3.1 Flash Lite)
- **Shadow DOM** - コンテンツスクリプトのスタイル分離
- **chrome.i18n** - ネイティブの国際化（10 言語）
- **Vitest** + **happy-dom** - ユニットテスト（264 テスト）

## 開発

```bash
# 依存関係をインストール
npm install

# 開発ビルド（HMR 付き）
npm run dev

# 本番ビルド
npm run build

# linter を実行
npm run lint

# 型チェック
npm run type-check

# テストを実行
npm run test:run

# ビルドして Chrome ウェブストア用にパッケージ化
npm run package
```

## プロジェクト構造

```
src/
├── background/      # API 呼び出し用のサービスワーカー
├── content/         # コンテンツスクリプトと UI コンポーネント
├── hooks/           # 共有設定フック
├── i18n/            # Chrome i18n ユーティリティと型付きメッセージキー
├── options/         # 設定ページ
├── popup/           # ツールバーポップアップ（有効/無効の切り替え）
├── prompts/         # プロンプトプリセット
├── services/        # マルチプロバイダー AI サービス（OpenAI、Claude、Gemini）
├── test/            # Vitest のセットアップ、モック、フィクスチャ
├── types/           # TypeScript 型
└── utils/           # ユーティリティ
```

## このプロジェクトをサポート

apolisher-chrome が役立つと思われる場合は、スポンサーになることをご検討ください！あなたのサポートは、このプロジェクトを無料でオープンソースに保つのに役立ちます。

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-red?style=for-the-badge&logo=github-sponsors)](https://github.com/sponsors/changliu0828)

**サポート方法：**
- ⭐ このリポジトリにスターを付ける
- 💖 [スポンサーになる](https://github.com/sponsors/changliu0828)（月額 $3 から）
- 🐛 バグを報告してコードを貢献
- 📢 役立つと思われる他の人と共有

### スポンサー

すべてのスポンサーに感謝します！🙏

<!-- sponsors --><!-- sponsors -->

*最初のスポンサーになって、ここにあなたの名前を残しましょう！*

## ライセンス

MIT
