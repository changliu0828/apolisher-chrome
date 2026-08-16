<p align="center">
  <img src="../public/icons/icon-raw.png" alt="APolish Logo" width="400">
</p>

<h1 align="center">APolish</h1>

<p align="center">
  <strong>AI के साथ अपने टेक्स्ट को पॉलिश करें</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.9.0-blue" alt="Version">
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
  <a href="README.pt.md">Português</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.ru.md">Русский</a> |
  <strong>हिन्दी</strong>
</p>

---

एक गोपनीयता-केंद्रित Chrome Extension जो AI का उपयोग करके किसी भी वेब पेज पर टेक्स्ट को पॉलिश करता है। टेक्स्ट चुनें, पॉलिश बटन पर क्लिक करें और AI-संचालित सुझाव और विज़ुअल अंतर तुलना प्राप्त करें।

## विशेषताएं

- **मल्टी-प्रोवाइडर AI समर्थन**: अपनी खुद की API key का उपयोग करके OpenAI, Claude या Gemini के बीच चुनें
- **टेक्स्ट पॉलिशिंग**: किसी भी टेक्स्ट को चुनें और इसे AI के साथ पॉलिश करें
- **एकाधिक प्रीसेट**: मानक, पेशेवर, देशी, सरलीकृत, भावनात्मक बुद्धिमत्ता या कस्टम prompts
- **त्वरित टॉगल**: टूलबार popup से एक्सटेंशन को सक्षम या अक्षम करें
- **विज़ुअल अंतर**: सम्मिलन (हरा) और विलोपन (लाल) के साथ हाइलाइट किए गए परिवर्तन देखें
- **गोपनीयता पहले**: आपकी API key स्थानीय रहती है, कोई डेटा संग्रह या टेलीमेट्री नहीं
- **सार्वभौमिक संगतता**: Gmail, Google Docs और अधिक सहित किसी भी वेब पेज पर काम करता है

## इंस्टॉलेशन

### स्रोत कोड से

1. रिपॉजिटरी क्लोन करें:
```bash
git clone https://github.com/changliu0828/apolisher-chrome.git
cd apolisher-chrome
```

2. डिपेंडेंसीज इंस्टॉल करें:
```bash
npm install
```

3. एक्सटेंशन बनाएं:
```bash
npm run build
```

4. Chrome में लोड करें:
   - `chrome://extensions` खोलें
   - "डेवलपर मोड" सक्षम करें
   - "अनपैक्ड एक्सटेंशन लोड करें" पर क्लिक करें
   - `dist` फ़ोल्डर चुनें

## उपयोग

1. **सेटअप**: अपना AI प्रोवाइडर (OpenAI, Claude या Gemini) चुनें और एक्सटेंशन सेटिंग्स में अपनी API key जोड़ें
2. **चुनें**: किसी भी वेब पेज पर टेक्स्ट को हाइलाइट करें
3. **पॉलिश करें**: दिखाई देने वाले <img src="../public/icons/icon32.png" width="16" height="16" alt="APolish आइकन" style="vertical-align: middle;"> बटन पर क्लिक करें
4. **समीक्षा करें**: मोडल में अंतर तुलना देखें
5. **स्वीकार करें**: परिवर्तन लागू करने के लिए चेकमार्क पर क्लिक करें

## कॉन्फ़िगरेशन

एक्सटेंशन आइकन पर क्लिक करके या राइट-क्लिक करके और "विकल्प" चुनकर सेटिंग्स तक पहुंचें:

- **AI प्रोवाइडर**: OpenAI (GPT-4o Mini), Claude (3.5 Haiku) या Gemini (2.5 Flash) के बीच चुनें
- **API Key**: आपकी प्रोवाइडर-विशिष्ट API key (Chrome sync storage में सुरक्षित रूप से संग्रहीत)
- **Prompt प्रीसेट**: मानक, पेशेवर, देशी, सरलीकृत, भावनात्मक बुद्धिमत्ता या कस्टम के बीच चुनें
- **अधिकतम Token**: प्रतिक्रिया की लंबाई नियंत्रित करें (100-4000 Token, डिफ़ॉल्ट: 2000)

## तकनीकी स्टैक

- **React** + **TypeScript** - UI कंपोनेंट्स
- **Vite** - @crxjs/vite-plugin के साथ बिल्ड सिस्टम
- **Tailwind CSS** - स्टाइलिंग
- **Chrome Extension Manifest V3** - एक्सटेंशन आर्किटेक्चर
- **मल्टी-प्रोवाइडर AI**: OpenAI (GPT-4o Mini), Claude (3.5 Haiku) या Gemini (2.5 Flash)
- **Shadow DOM** - Content script के लिए स्टाइल आइसोलेशन
- **chrome.i18n** - नेटिव अंतरराष्ट्रीयकरण (10 भाषाएं)
- **Vitest** + **happy-dom** - यूनिट टेस्ट (187 टेस्ट)

## डेवलपमेंट

```bash
# डिपेंडेंसीज इंस्टॉल करें
npm install

# डेवलपमेंट बिल्ड (HMR के साथ)
npm run dev

# प्रोडक्शन बिल्ड
npm run build

# लिंटर चलाएं
npm run lint

# टाइप चेकिंग
npm run type-check

# टेस्ट चलाएं
npm run test:run

# Chrome Web Store के लिए बिल्ड और पैकेज करें
npm run package
```

## प्रोजेक्ट संरचना

```
src/
├── background/      # API कॉल्स के लिए Service worker
├── content/         # Content script और UI कंपोनेंट्स
├── hooks/           # साझा सेटिंग्स hook
├── i18n/            # Chrome i18n उपयोगिताएं और टाइप्ड message keys
├── options/         # सेटिंग्स पेज
├── popup/           # टूलबार popup (सक्षम/अक्षम टॉगल)
├── prompts/         # Prompt प्रीसेट
├── services/        # मल्टी-प्रोवाइडर AI सेवाएं (OpenAI, Claude, Gemini)
├── test/            # Vitest सेटअप, mocks और fixtures
├── types/           # TypeScript types
└── utils/           # उपयोगिताएं
```

## इस प्रोजेक्ट का समर्थन करें

यदि आपको apolisher-chrome उपयोगी लगता है, तो कृपया प्रायोजन पर विचार करें! आपका समर्थन इस प्रोजेक्ट को मुफ्त और ओपन सोर्स रखने में मदद करता है।

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-red?style=for-the-badge&logo=github-sponsors)](https://github.com/sponsors/changliu0828)

**समर्थन के तरीके:**
- ⭐ इस रिपॉजिटरी को स्टार दें
- 💖 [प्रायोजक बनें](https://github.com/sponsors/changliu0828) ($3/महीना से शुरू)
- 🐛 बग्स रिपोर्ट करें और कोड योगदान करें
- 📢 उन अन्य लोगों के साथ साझा करें जिन्हें यह उपयोगी लग सकता है

### प्रायोजक

हमारे सभी प्रायोजकों को धन्यवाद! 🙏

<!-- sponsors --><!-- sponsors -->

*पहले प्रायोजक बनें और अपना नाम यहां रखें!*

## लाइसेंस

MIT
