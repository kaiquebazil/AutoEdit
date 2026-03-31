# 🎬 Kaisui AutoEdit

**Editor de Vídeo com Jump Cut Automático | 100% Browser**

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black.svg)](https://nextjs.org)
[![FFmpeg.wasm](https://img.shields.io/badge/FFmpeg-wasm-green.svg)](https://ffmpegwasm.netlify.app)
[![Vercel](https://img.shields.io/badge/Vercel-Ready-blue.svg)](https://vercel.com)

Processamento de vídeo **100% no navegador** usando FFmpeg.wasm. Sem servidor, sem upload, totalmente privado.

---

## ✨ Features

- 🚀 **100% Client-Side** - Processamento no navegador
- 🔒 **Privado** - Vídeo nunca sai do computador
- 🎬 **Jump Cut Automático** - Remove silêncios automaticamente
- 📱 **Responsivo** - Funciona em mobile e desktop
- ⚡ **Gratuito** - Sem limitações

---

## 🚀 Deploy no Vercel

### Opção 1: Deploy Automático (1 Clique)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seuusername/kaisui-autoedit)

### Opção 2: Manual

1. **Instale dependências:**
```bash
npm install
```

2. **Teste local:**
```bash
npm run dev
```

3. **Deploy:**
```bash
npm run build
vercel --prod
```

---

## 📦 Instalação Local

```bash
# Clone ou baixe o projeto
cd videoCut

# Instale dependencias
npm install

# Rode localmente
npm run dev
```

Acesse `http://localhost:3000`

---

## 🎮 Como Usar

1. **Selecione** um vídeo MP4/MOV
2. **Ajuste** as configurações (ou use padrão)
3. **Aguarde** o FFmpeg carregar (primeira vez)
4. **Clique** em "Processar Vídeo"
5. **Baixe** o resultado!

---

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **FFmpeg.wasm** - Processamento de vídeo no browser
- **TypeScript** - Tipagem segura
- **Vercel** - Hosting

---

## ⚠️ Limitações

| Aspecto | Limite |
|-----------|--------|
| Tamanho máximo | ~500MB (depende da RAM) |
| Tempo de processamento | Pode levar 2-5x o tempo do vídeo |
| Formatos | MP4, MOV, WebM |
| Navegadores | Chrome, Edge, Firefox (com COOP/COEP) |

---

## 🔧 Configuração Vercel

O arquivo `vercel.json` já está configurado com headers necessários para SharedArrayBuffer (requerido pelo FFmpeg.wasm).

---

## 📝 Notas

- **Primeiro uso:** FFmpeg.wasm faz download de ~25MB de dados
- **Performance:** Depende da potência do dispositivo
- **Mobile:** Funciona mas é mais lento que desktop

---

**Made with ❤️ for content creators**

⭐ Deploy no Vercel e use à vontade!
