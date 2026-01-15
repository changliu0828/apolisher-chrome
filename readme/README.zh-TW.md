<p align="center">
  <img src="../public/icons/icon-raw.png" alt="APolish Logo" width="400">
</p>

<h1 align="center">APolish</h1>

<p align="center">
  <strong>用 AI 為你的文字潤飾</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.8.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/chrome-extension-red" alt="Chrome">
  <img src="https://img.shields.io/badge/typescript-5.x-blue" alt="TypeScript">
</p>

<p align="center">
  <a href="../README.md">English</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <strong>繁體中文</strong> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.pt.md">Português</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.hi.md">हिन्दी</a>
</p>

---

一個隱私優先的 Chrome 擴充功能，使用 AI 潤飾任何網頁上的文字。選擇文字，點擊潤飾按鈕，獲得具有視覺化差異比較的 AI 增強建議。

## 功能特色

- **多供應商 AI 支援**：使用自己的 API 金鑰在 OpenAI、Claude 或 Gemini 之間選擇
- **文字潤飾**：選擇任何文字並使用 AI 進行潤飾
- **多種預設**：標準、專業、母語人士、簡化或自訂提示
- **視覺化差異**：以插入（綠色）和刪除（紅色）突顯顯示變更
- **隱私優先**：您的 API 金鑰保存在本地，無資料收集或遙測
- **通用相容性**：適用於任何網頁，包括 Gmail、Google Docs 等

## 安裝

### 從原始碼安裝

1. 克隆儲存庫：
```bash
git clone https://github.com/changliu0828/apolisher-chrome.git
cd apolisher-chrome
```

2. 安裝依賴：
```bash
npm install
```

3. 建置擴充功能：
```bash
npm run build
```

4. 載入到 Chrome：
   - 開啟 `chrome://extensions`
   - 啟用「開發者模式」
   - 點擊「載入未封裝項目」
   - 選擇 `dist` 資料夾

## 使用方法

1. **設定**：在擴充功能設定中選擇您的 AI 供應商（OpenAI、Claude 或 Gemini）並新增您的 API 金鑰
2. **選擇**：在任何網頁上突顯文字
3. **潤飾**：點擊出現的 <img src="../public/icons/icon32.png" width="16" height="16" alt="APolish 圖示" style="vertical-align: middle;"> 按鈕
4. **檢視**：在彈出視窗中檢視差異比較
5. **接受**：點擊勾號以套用變更

## 設定

點擊擴充功能圖示或右鍵點擊並選擇「選項」來存取設定：

- **AI 供應商**：在 OpenAI (GPT-4o Mini)、Claude (3.5 Haiku) 或 Gemini (2.5 Flash) 之間選擇
- **API 金鑰**：您的供應商特定 API 金鑰（安全儲存在 Chrome 同步儲存空間中）
- **提示預設**：從標準、專業、母語人士、簡化或自訂中選擇
- **最大Token數**：控制回應長度（100-4000 Token，預設：2000）

## 技術堆疊

- **React** + **TypeScript** - UI 元件
- **Vite** - 使用 @crxjs/vite-plugin 的建置系統
- **Tailwind CSS** - 樣式設計
- **Chrome Extension Manifest V3** - 擴充功能架構
- **多供應商 AI**：OpenAI (GPT-4o Mini)、Claude (3.5 Haiku) 或 Gemini (2.5 Flash)
- **Shadow DOM** - 內容腳本的樣式隔離

## 開發

```bash
# 安裝依賴
npm install

# 開發建置（含 HMR）
npm run dev

# 生產建置
npm run build

# 執行 linter
npm run lint

# 型別檢查
npm run type-check
```

## 專案結構

```
src/
├── background/      # API 呼叫的服務工作程式
├── content/         # 內容腳本和 UI 元件
├── options/         # 設定頁面
├── prompts/         # 提示預設
├── services/        # 多供應商 AI 服務（OpenAI、Claude、Gemini）
├── types/           # TypeScript 型別
└── utils/           # 工具程式
```

## 支持本專案

如果您覺得 apolisher-chrome 有用，請考慮贊助！您的支持有助於保持此專案的免費和開源。

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-red?style=for-the-badge&logo=github-sponsors)](https://github.com/sponsors/changliu0828)

**支持方式：**
- ⭐ 為此儲存庫加星號
- 💖 [成為贊助者](https://github.com/sponsors/changliu0828)（每月 $3 起）
- 🐛 回報錯誤並貢獻程式碼
- 📢 與其他可能覺得有用的人分享

### 贊助者

感謝所有贊助者！🙏

<!-- sponsors --><!-- sponsors -->

*成為第一位贊助者，將您的名字放在這裡！*

## 授權

MIT
