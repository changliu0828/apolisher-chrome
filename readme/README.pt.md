<p align="center">
  <img src="../public/icons/icon-raw.png" alt="APolish Logo" width="400">
</p>

<h1 align="center">APolish</h1>

<p align="center">
  <strong>Pula seu texto com IA</strong>
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
  <a href="README.zh-TW.md">繁體中文</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.es.md">Español</a> |
  <strong>Português</strong> |
  <a href="README.fr.md">Français</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.hi.md">हिन्दी</a>
</p>

---

Uma extensão do Chrome que prioriza a privacidade e pule texto em qualquer página web usando IA. Selecione texto, clique no botão de polir e obtenha sugestões aprimoradas com IA e comparação visual de diferenças.

## Características

- **Suporte Multi-Provedor de IA**: Escolha entre OpenAI, Claude ou Gemini usando sua própria chave API
- **Polimento de Texto**: Selecione qualquer texto e pula-o com IA
- **Múltiplos Presets**: Prompts padrão, profissional, nativo, simplificado ou personalizado
- **Diferenças Visuais**: Veja as alterações destacadas com inserções (verde) e exclusões (vermelho)
- **Privacidade Primeiro**: Sua chave API fica local, sem coleta de dados ou telemetria
- **Compatibilidade Universal**: Funciona em qualquer página web, incluindo Gmail, Google Docs e mais

## Instalação

### Do Código Fonte

1. Clonar o repositório:
```bash
git clone https://github.com/changliu0828/apolisher-chrome.git
cd apolisher-chrome
```

2. Instalar dependências:
```bash
npm install
```

3. Construir a extensão:
```bash
npm run build
```

4. Carregar no Chrome:
   - Abrir `chrome://extensions`
   - Ativar "Modo de desenvolvedor"
   - Clicar em "Carregar sem compactação"
   - Selecionar a pasta `dist`

## Uso

1. **Configuração**: Escolha seu provedor de IA (OpenAI, Claude ou Gemini) e adicione sua chave API nas configurações da extensão
2. **Selecionar**: Destaque texto em qualquer página web
3. **Polir**: Clique no botão <img src="../public/icons/icon32.png" width="16" height="16" alt="Ícone APolish" style="vertical-align: middle;"> que aparece
4. **Revisar**: Veja a comparação de diferenças no modal
5. **Aceitar**: Clique na marca de verificação para aplicar as alterações

## Configuração

Acesse as configurações clicando no ícone da extensão ou clicando com o botão direito e selecionando "Opções":

- **Provedor de IA**: Escolha entre OpenAI (GPT-4o Mini), Claude (3.5 Haiku) ou Gemini (2.5 Flash)
- **Chave API**: Sua chave API específica do provedor (armazenada com segurança no armazenamento de sincronização do Chrome)
- **Presets de Prompt**: Escolha entre padrão, profissional, nativo, simplificado ou personalizado
- **Máximo de Token**: Controle o comprimento da resposta (100-4000 Token, padrão: 2000)

## Stack Tecnológico

- **React** + **TypeScript** - Componentes de UI
- **Vite** - Sistema de construção com @crxjs/vite-plugin
- **Tailwind CSS** - Estilos
- **Chrome Extension Manifest V3** - Arquitetura de extensão
- **IA Multi-Provedor**: OpenAI (GPT-4o Mini), Claude (3.5 Haiku) ou Gemini (2.5 Flash)
- **Shadow DOM** - Isolamento de estilos para script de conteúdo

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Construção de desenvolvimento (com HMR)
npm run dev

# Construção de produção
npm run build

# Executar linter
npm run lint

# Verificação de tipos
npm run type-check
```

## Estrutura do Projeto

```
src/
├── background/      # Service worker para chamadas API
├── content/         # Script de conteúdo e componentes UI
├── options/         # Página de configuração
├── prompts/         # Presets de prompts
├── services/        # Serviços de IA multi-provedor (OpenAI, Claude, Gemini)
├── types/           # Tipos TypeScript
└── utils/           # Utilitários
```

## Apoie este Projeto

Se você achar o apolisher-chrome útil, considere patrocinar! Seu apoio ajuda a manter este projeto gratuito e de código aberto.

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-red?style=for-the-badge&logo=github-sponsors)](https://github.com/sponsors/changliu0828)

**Formas de apoiar:**
- ⭐ Dê uma estrela a este repositório
- 💖 [Torne-se um patrocinador](https://github.com/sponsors/changliu0828) (a partir de $3/mês)
- 🐛 Reporte bugs e contribua com código
- 📢 Compartilhe com outros que possam achar útil

### Patrocinadores

Obrigado a todos os nossos patrocinadores! 🙏

<!-- sponsors --><!-- sponsors -->

*Torne-se o primeiro patrocinador e coloque seu nome aqui!*

## Licença

MIT
