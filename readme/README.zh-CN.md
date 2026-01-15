<p align="center">
  <img src="../public/icons/icon-raw.png" alt="APolish Logo" width="400">
</p>

<h1 align="center">APolish</h1>

<p align="center">
  <strong>用 AI 为你的文字润色</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.8.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/chrome-extension-red" alt="Chrome">
  <img src="https://img.shields.io/badge/typescript-5.x-blue" alt="TypeScript">
</p>

<p align="center">
  <a href="../README.md">English</a> |
  <strong>简体中文</strong> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.pt.md">Português</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.hi.md">हिन्दी</a>
</p>

---

一个隐私优先的 Chrome 扩展，使用 AI 润色任何网页上的文本。选择文本，点击润色按钮，获得带有可视化对比的 AI 增强建议。

## 功能特点

- **多提供商 AI 支持**：使用您自己的 API 密钥，在 OpenAI、Claude 或 Gemini 之间选择
- **文本润色**：选择任何文本并使用 AI 进行润色
- **多种预设**：标准、专业、母语、简化或自定义提示词
- **可视化对比**：查看突出显示的更改，插入（绿色）和删除（红色）
- **隐私优先**：您的 API 密钥保存在本地，不收集数据或遥测
- **通用兼容性**：适用于任何网页，包括 Gmail、Google Docs 等

## 安装

### 从源码安装

1. 克隆仓库：
```bash
git clone https://github.com/changliu0828/apolisher-chrome.git
cd apolisher-chrome
```

2. 安装依赖：
```bash
npm install
```

3. 构建扩展：
```bash
npm run build
```

4. 在 Chrome 中加载：
   - 打开 `chrome://extensions`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `dist` 文件夹

## 使用方法

1. **设置**：在扩展设置中选择您的 AI 提供商（OpenAI、Claude 或 Gemini）并添加您的 API 密钥
2. **选择**：在任何网页上高亮显示文本
3. **润色**：点击出现的 <img src="../public/icons/icon32.png" width="16" height="16" alt="APolish 图标" style="vertical-align: middle;"> 按钮
4. **审查**：在模态框中查看对比结果
5. **接受**：点击对勾应用更改

## 配置

通过点击扩展图标或右键选择"选项"来访问设置：

- **AI 提供商**：在 OpenAI (GPT-4o Mini)、Claude (3.5 Haiku) 或 Gemini (2.5 Flash) 之间选择
- **API 密钥**：您的提供商特定的 API 密钥（安全存储在 Chrome 同步存储中）
- **提示词预设**：从标准、专业、母语、简化或自定义中选择
- **最大Token数**：控制响应长度（100-4000 Token，默认：2000）

## 技术栈

- **React** + **TypeScript** - UI 组件
- **Vite** - 构建系统，带 @crxjs/vite-plugin
- **Tailwind CSS** - 样式
- **Chrome Extension Manifest V3** - 扩展架构
- **多提供商 AI**：OpenAI (GPT-4o Mini)、Claude (3.5 Haiku) 或 Gemini (2.5 Flash)
- **Shadow DOM** - 内容脚本的样式隔离

## 开发

```bash
# 安装依赖
npm install

# 开发构建（带 HMR）
npm run dev

# 生产构建
npm run build

# 运行 linter
npm run lint

# 类型检查
npm run type-check
```

## 项目结构

```
src/
├── background/      # API 调用的服务工作器
├── content/         # 内容脚本和 UI 组件
├── options/         # 设置页面
├── prompts/         # 提示词预设
├── services/        # 多提供商 AI 服务（OpenAI、Claude、Gemini）
├── types/           # TypeScript 类型
└── utils/           # 工具函数
```

## 支持这个项目

如果您觉得 apolisher-chrome 有用，请考虑赞助！您的支持有助于保持这个项目免费和开源。

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-red?style=for-the-badge&logo=github-sponsors)](https://github.com/sponsors/changliu0828)

**支持方式：**
- ⭐ 为这个仓库加星
- 💖 [成为赞助者](https://github.com/sponsors/changliu0828)（从每月 $3 起）
- 🐛 报告 bug 并贡献代码
- 📢 与可能觉得有用的其他人分享

### 赞助者

感谢我们所有的赞助者！🙏

<!-- sponsors --><!-- sponsors -->

*成为第一个赞助者，在这里留下您的名字！*

## 许可证

MIT
