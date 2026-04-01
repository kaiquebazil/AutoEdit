<<<<<<< HEAD
<div align="center">
  <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/film.svg" width="80" height="80" alt="Video Silence Cutter Logo" style="filter: drop-shadow(0 0 10px #0ea5e9);">

  # Video Silence Cutter

  **Automatically remove silence from your videos with professional-grade precision.**

  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![FFmpeg](https://img.shields.io/badge/FFmpeg-000000?style=for-the-badge&logo=ffmpeg&logoColor=white)](https://ffmpeg.org/)
  [![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

  [🇺🇸 English](#english) | [🇧🇷 Português](#português)

  </div>

---

<div id="english">

## 📖 English Documentation

### Overview

Video Silence Cutter is a **full-stack application** that automatically detects and removes silent segments from video files. Built with a professional-grade architecture, it combines a **FastAPI backend** (Python) with a **React frontend** (TypeScript) for a seamless video editing experience.

Perfect for:
- 🎬 **Content creators** removing dead air from tutorials
- 🎮 **Gamers** cutting loading screens from gameplay videos
- 🎓 **Educators** trimming silences from recorded lectures
- 🎤 **Podcasters** preparing video versions of audio content

### ✨ Features

- **⚡ Lightning Fast**: Stream copy mode (no re-encoding) delivers 10x faster processing
- **🎯 Smart Detection**: FFmpeg's `silencedetect` filter with configurable parameters
- **🔧 Fully Adjustable**: Threshold, duration, and padding controls
- **📊 Progress Tracking**: Real-time upload and processing progress
- **🎨 Modern UI**: Clean, responsive interface built with Tailwind CSS
- **🔒 Type Safe**: Full TypeScript support throughout the stack
- **🐳 Production Ready**: Docker containerization for consistent deployments

### 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Vercel)                      │
│                   React + TypeScript + Vite                 │
│                      Tailwind CSS + Axios                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST + CORS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Render/Railway)                │
│                    FastAPI + Python 3.11                   │
│              FFmpeg (silencedetect + concat)               │
└─────────────────────────────────────────────────────────────┘
```

### 🚀 Quick Start (Windows)

1. **Clone and enter the project:**
```batch
git clone <repository-url>
cd video-silence-cutter
```

2. **Run the automated setup:**
```batch
setup_all.bat
```
This creates the Python virtual environment, installs dependencies, and configures environment files.

3. **Start development servers:**
```batch
run_dev.bat
```

4. **Open your browser:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### 🛠️ Manual Setup

#### Backend (Python)
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend (React)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 📚 Project Structure

```
video-silence-cutter/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py          # Configuration management
│   │   ├── main.py            # FastAPI application
│   │   ├── models.py          # Pydantic models
│   │   └── video_processor.py # FFmpeg processing logic
│   ├── Dockerfile             # Container with FFmpeg
│   ├── requirements.txt
│   └── runtime.txt
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── styles/            # Tailwind CSS
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── setup_all.bat              # Windows automated setup
├── run_dev.bat                # Windows dev server launcher
└── README.md
```

### 🔬 How Silence Detection Works

The algorithm uses FFmpeg's `silencedetect` audio filter:

1. **Audio Analysis**: FFmpeg analyzes the audio stream frame-by-frame
2. **Threshold Comparison**: Samples below the dB threshold are marked as silence
3. **Duration Filtering**: Only silences exceeding minimum duration are kept
4. **Segment Calculation**: Keep segments are calculated (inverse of silence)
5. **Stream Copy**: Video is reassembled using FFmpeg's concat demuxer

```
Input Video
    │
    ▼
┌─────────────────┐
│ silencedetect   │ ← -30dB threshold, 0.5s min duration
│ FFmpeg filter   │
└─────────────────┘
    │
    ▼
Silence timestamps: [(1.2, 2.4), (5.6, 6.1)]
    │
    ▼
Keep segments: [(0, 1.3), (2.3, 5.7), (6.0, end)]
    │
    ▼
┌─────────────────┐
│ concat demuxer  │ ← Stream copy (fast!)
└─────────────────┘
    │
    ▼
Output Video (silence removed)
```

### 🔧 Configuration

#### Processing Parameters

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `threshold_db` | -60 to -10 | -30 | Silence threshold in dB (lower = more sensitive) |
| `silence_duration` | 0.1 to 5.0 | 0.5 | Minimum silence to detect (seconds) |
| `padding` | 0.0 to 1.0 | 0.1 | Padding around cuts (seconds) |
| `keep_codec` | true/false | true | Stream copy vs re-encode |

#### Environment Variables

**Backend (`.env`):**
```env
CORS_ORIGINS=http://localhost:5173,https://yourapp.vercel.app
MAX_UPLOAD_SIZE_MB=500
DEFAULT_SILENCE_THRESHOLD_DB=-30
```

**Frontend (`.env`):**
```env
VITE_API_URL=http://localhost:8000
# Production: VITE_API_URL=https://your-api.onrender.com
```

### 🚢 Deployment

#### Frontend → Vercel

1. Push to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Framework: Vite
4. Build command: `npm run build`
5. Output directory: `dist`

#### Backend → Render

1. Create Web Service from GitHub repo
2. Select the `backend/` directory
3. Build command: _(Docker handles this)_
4. Runtime: Docker
5. Set environment variables

#### Backend → Railway

```bash
railway login
railway init
railway up --dockerfile backend/Dockerfile
```

### 🧪 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API info |
| `GET` | `/health` | Health check |
| `POST` | `/process-video` | Upload and process video |

**Example Request:**
```bash
curl -X POST http://localhost:8000/process-video \
  -F "file=@video.mp4" \
  -F "threshold_db=-35" \
  -F "silence_duration=0.8" \
  -F "padding=0.2"
```

### 🤝 Contributing

This project is modular by design. The video processing API is completely separate from the frontend, meaning:
- You can replace the React frontend with any other UI
- The FastAPI backend works independently as a service
- Both can be deployed separately and scaled independently

### 📄 License

MIT License - feel free to use in personal and commercial projects.

</div>

---

<div id="português">

## 📖 Documentação em Português

### Visão Geral

Video Silence Cutter é uma **aplicação full-stack** que detecta e remove automaticamente segmentos de silêncio de arquivos de vídeo. Construída com arquitetura profissional, combina um **backend FastAPI** (Python) com um **frontend React** (TypeScript) para uma experiência de edição de vídeo perfeita.

Perfeito para:
- 🎬 **Criadores de conteúdo** removendo "dead air" de tutoriais
- 🎮 **Gamers** cortando telas de loading de vídeos de gameplay
- 🎓 **Educadores** aparando silêncios de aulas gravadas
- 🎤 **Podcasters** preparando versões em vídeo de conteúdo em áudio

### ✨ Funcionalidades

- **⚡ Ultra Rápido**: Modo stream copy (sem re-codificação) entrega processamento 10x mais rápido
- **🎯 Detecção Inteligente**: Filtro `silencedetect` do FFmpeg com parâmetros configuráveis
- **🔧 Totalmente Ajustável**: Controles de limiar, duração e margem
- **📊 Acompanhamento de Progresso**: Progresso de upload e processamento em tempo real
- **🎨 UI Moderna**: Interface limpa e responsiva construída com Tailwind CSS
- **🔒 Type Safe**: Suporte completo a TypeScript em toda a stack
- **🐳 Pronto para Produção**: Containerização Docker para deploys consistentes

### 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Vercel)                      │
│                   React + TypeScript + Vite                 │
│                      Tailwind CSS + Axios                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST + CORS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Render/Railway)                │
│                    FastAPI + Python 3.11                   │
│              FFmpeg (silencedetect + concat)               │
└─────────────────────────────────────────────────────────────┘
```

### 🚀 Início Rápido (Windows)

1. **Clone e entre no projeto:**
```batch
git clone <url-do-repositorio>
cd video-silence-cutter
```

2. **Execute o setup automatizado:**
```batch
setup_all.bat
```
Isso cria o ambiente virtual Python, instala dependências e configura arquivos de ambiente.

3. **Inicie os servidores de desenvolvimento:**
```batch
run_dev.bat
```

4. **Abra seu navegador:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Documentação da API: http://localhost:8000/docs

### 🛠️ Setup Manual

#### Backend (Python)
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend (React)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 📚 Estrutura do Projeto

```
video-silence-cutter/
├── backend/                    # Backend FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py          # Gerenciamento de config
│   │   ├── main.py            # Aplicação FastAPI
│   │   ├── models.py          # Modelos Pydantic
│   │   └── video_processor.py # Lógica de processamento FFmpeg
│   ├── Dockerfile             # Container com FFmpeg
│   ├── requirements.txt
│   └── runtime.txt
├── frontend/                   # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes de UI
│   │   ├── hooks/             # Hooks React customizados
│   │   ├── styles/            # Tailwind CSS
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── setup_all.bat              # Setup automatizado Windows
├── run_dev.bat                # Iniciador de dev Windows
└── README.md
```

### 🔬 Como Funciona a Detecção de Silêncio

O algoritmo usa o filtro de áudio `silencedetect` do FFmpeg:

1. **Análise de Áudio**: FFmpeg analisa o stream de áudio frame a frame
2. **Comparação de Limiar**: Amostras abaixo do limiar em dB são marcadas como silêncio
3. **Filtragem de Duração**: Apenas silêncios excedendo a duração mínima são mantidos
4. **Cálculo de Segmentos**: Segmentos a manter são calculados (inverso do silêncio)
5. **Stream Copy**: Vídeo é remontado usando o concat demuxer do FFmpeg

```
Vídeo de Entrada
       │
       ▼
┌─────────────────┐
│ silencedetect   │ ← -30dB limiar, 0.5s duração mín
│ filtro FFmpeg   │
└─────────────────┘
       │
       ▼
Timestamps de silêncio: [(1.2, 2.4), (5.6, 6.1)]
       │
       ▼
Segmentos a manter: [(0, 1.3), (2.3, 5.7), (6.0, fim)]
       │
       ▼
┌─────────────────┐
│ concat demuxer  │ ← Stream copy (rápido!)
└─────────────────┘
       │
       ▼
Vídeo de Saída (silêncio removido)
```

### 🔧 Configuração

#### Parâmetros de Processamento

| Parâmetro | Intervalo | Padrão | Descrição |
|-----------|-----------|--------|-----------|
| `threshold_db` | -60 a -10 | -30 | Limiar de silêncio em dB (menor = mais sensível) |
| `silence_duration` | 0.1 a 5.0 | 0.5 | Silêncio mínimo para detectar (segundos) |
| `padding` | 0.0 a 1.0 | 0.1 | Margem nos cortes (segundos) |
| `keep_codec` | true/false | true | Stream copy vs re-codificar |

#### Variáveis de Ambiente

**Backend (`.env`):**
```env
CORS_ORIGINS=http://localhost:5173,https://seuapp.vercel.app
MAX_UPLOAD_SIZE_MB=500
DEFAULT_SILENCE_THRESHOLD_DB=-30
```

**Frontend (`.env`):**
```env
VITE_API_URL=http://localhost:8000
# Produção: VITE_API_URL=https://sua-api.onrender.com
```

### 🚢 Deploy

#### Frontend → Vercel

1. Push para GitHub
2. Importe o projeto no [Dashboard Vercel](https://vercel.com)
3. Framework: Vite
4. Comando de build: `npm run build`
5. Diretório de saída: `dist`

#### Backend → Render

1. Crie Web Service do repo GitHub
2. Selecione o diretório `backend/`
3. Comando de build: _(Docker cuida disso)_
4. Runtime: Docker
5. Configure variáveis de ambiente

#### Backend → Railway

```bash
railway login
railway init
railway up --dockerfile backend/Dockerfile
```

### 🧪 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | Info da API |
| `GET` | `/health` | Health check |
| `POST` | `/process-video` | Upload e processamento de vídeo |

**Exemplo de Requisição:**
```bash
curl -X POST http://localhost:8000/process-video \
  -F "file=@video.mp4" \
  -F "threshold_db=-35" \
  -F "silence_duration=0.8" \
  -F "padding=0.2"
```

### 🤝 Contribuição

Este projeto é modular por design. A API de processamento de vídeo é completamente separada do frontend, o que significa:
- Você pode substituir o frontend React por qualquer outra UI
- O backend FastAPI funciona independentemente como um serviço
- Ambos podem ser deployados separadamente e escalados independentemente

### 📄 Licença

MIT License - sinta-se livre para usar em projetos pessoais e comerciais.

</div>

---

<div align="center">

**Built with ❤️ for content creators everywhere**

[⬆ Voltar ao topo](#video-silence-cutter)

</div>
=======
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
>>>>>>> 44810ff250477df2ea9c02625e90e8cc9b427406
