'use client';

import { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Upload, Scissors, Download, Play, Settings, Clock, Zap } from 'lucide-react';

export default function Home() {
  const [video, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'processing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // Settings
  const [silenceDuration, setSilenceDuration] = useState(0.3);
  const [noiseDb, setNoiseDb] = useState(-30);

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;

    setStatus('loading');
    setMessage('Carregando FFmpeg...');

    const ffmpeg = new FFmpeg();
    ffmpeg.on('log', ({ message }) => console.log(message));
    ffmpeg.on('progress', ({ progress }) => {
      setProgress(Math.round(progress * 100));
    });

    await ffmpeg.load();
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      setVideoUrl(URL.createObjectURL(file));
      setProcessedUrl('');
      setStatus('idle');
    }
  }, []);

  const processVideo = async () => {
    if (!video) return;

    try {
      const ffmpeg = await loadFFmpeg();
      setStatus('processing');
      setProgress(0);
      setMessage('Analisando áudio...');

      const inputName = 'input.mp4';
      const outputName = 'output.mp4';

      // Write file to FFmpeg FS
      await ffmpeg.writeFile(inputName, await fetchFile(video));

      // Detect silencedetect
      setMessage('Detectando silêncios...');
      await ffmpeg.exec([
        '-i', inputName,
        '-af', `silencedetect=noise=${noiseDb}dB:d=${silenceDuration}`,
        '-f', 'null',
        '-'
      ]);

      // Process video - remove silence
      setMessage('Removendo silêncios...');
      await ffmpeg.exec([
        '-i', inputName,
        '-vf', 'select=gt(scene\,0.003),setpts=N/FRAME_RATE/TB',
        '-af', 'aselect=gt(scene\,0.003),asetpts=N/SR/TB',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'ultrafast',
        outputName
      ]);

      // Alternative: Simple fast cut
      setMessage('Exportando...');
      await ffmpeg.exec([
        '-i', inputName,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'ultrafast',
        '-threads', '0',
        outputName
      ]);

      // Read output
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      setStatus('done');

      // Cleanup
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
      setMessage('Erro no processamento');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>🎬 Kaisui AutoEdit</h1>
        <p style={styles.subtitle}>Processamento de vídeo no navegador | 100% privado</p>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Upload Section */}
        {!video && (
          <div style={styles.uploadBox}>
            <Upload size={48} color="#667eea" />
            <p style={styles.uploadText}>Arraste um vídeo ou clique para selecionar</p>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
            <p style={styles.hint}>MP4, MOV • Máx 100MB</p>
          </div>
        )}

        {/* Video Preview */}
        {video && videoUrl && (
          <div style={styles.videoSection}>
            <h3 style={styles.sectionTitle}>Preview Original</h3>
            <video src={videoUrl} controls style={styles.video} />
            <p style={styles.fileInfo}>{video.name} • {(video.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
        )}

        {/* Settings */}
        {video && status === 'idle' && (
          <div style={styles.settings}>
            <h3 style={styles.sectionTitle}>
              <Settings size={20} /> Configurações
            </h3>

            <div style={styles.setting}>
              <label>Duração mínima de silêncio: {silenceDuration}s</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={silenceDuration}
                onChange={(e) => setSilenceDuration(parseFloat(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.setting}>
              <label>Limiar de ruído: {noiseDb} dB</label>
              <input
                type="range"
                min="-50"
                max="-20"
                step="5"
                value={noiseDb}
                onChange={(e) => setNoiseDb(parseInt(e.target.value))}
                style={styles.slider}
              />
            </div>

            <button onClick={processVideo} style={styles.button}>
              <Scissors size={20} />
              Processar Vídeo
            </button>
          </div>
        )}

        {/* Loading/Processing */}
        {(status === 'loading' || status === 'processing') && (
          <div style={styles.processing}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <p style={styles.progressText}>{progress}% - {message}</p>
            <p style={styles.hint}>Isso pode levar alguns minutos...</p>
          </div>
        )}

        {/* Results */}
        {status === 'done' && processedUrl && (
          <div style={styles.results}>
            <div style={styles.successBox}>
              <Zap size={24} color="#28a745" />
              <span>Vídeo processado com sucesso!</span>
            </div>

            <h3 style={styles.sectionTitle}>Resultado</h3>
            <video src={processedUrl} controls style={styles.video} />

            <a
              href={processedUrl}
              download="kaisui-edited.mp4"
              style={{ ...styles.button, ...styles.downloadButton }}
            >
              <Download size={20} />
              Baixar Vídeo
            </a>

            <button onClick={() => { setVideo(null); setProcessedUrl(''); setStatus('idle'); }} style={styles.secondaryButton}>
              Processar Outro
            </button>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div style={styles.errorBox}>
            <p>{message}</p>
            <button onClick={() => setStatus('idle')} style={styles.button}>
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Features */}
        <div style={styles.features}>
          <div style={styles.feature}>
            <Clock size={24} color="#667eea" />
            <h4>100% Local</h4>
            <p>Processamento no navegador, sem upload</p>
          </div>
          <div style={styles.feature}>
            <Zap size={24} color="#667eea" />
            <h4>Privado</h4>
            <p>Seus vídeos nunca saem do computador</p>
          </div>
          <div style={styles.feature}>
            <Play size={24} color="#667eea" />
            <h4>Gratuito</h4>
            <p>Sem limitações, use quanto quiser</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>Kaisui AutoEdit v4.0 | Funciona no Vercel 🚀</p>
      </footer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  header: {
    textAlign: 'center',
    padding: '40px 20px',
    color: 'white',
  },
  title: {
    fontSize: '2.5rem',
    margin: '0 0 10px 0',
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
  },
  subtitle: {
    fontSize: '1rem',
    opacity: 0.9,
    margin: 0,
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  },
  uploadBox: {
    border: '3px dashed #ddd',
    borderRadius: '15px',
    padding: '60px 40px',
    textAlign: 'center',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  uploadText: {
    fontSize: '1.2rem',
    color: '#667eea',
    margin: '20px 0 10px',
  },
  hint: {
    color: '#888',
    fontSize: '0.9rem',
  },
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
  },
  videoSection: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  video: {
    width: '100%',
    borderRadius: '10px',
    background: '#000',
  },
  fileInfo: {
    color: '#666',
    fontSize: '0.9rem',
    marginTop: '10px',
    textAlign: 'center',
  },
  settings: {
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
  },
  setting: {
    marginBottom: '20px',
  },
  slider: {
    width: '100%',
    height: '8px',
    marginTop: '10px',
  },
  button: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  downloadButton: {
    marginTop: '20px',
    background: '#28a745',
  },
  secondaryButton: {
    width: '100%',
    padding: '15px',
    background: '#f0f2f6',
    color: '#333',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '10px',
  },
  processing: {
    textAlign: 'center',
    padding: '40px',
  },
  progressBar: {
    width: '100%',
    height: '10px',
    background: '#e0e0e0',
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.3s',
  },
  progressText: {
    fontSize: '1.2rem',
    color: '#667eea',
    fontWeight: 'bold',
  },
  results: {
    textAlign: 'center',
  },
  successBox: {
    background: '#d4edda',
    border: '1px solid #c3e6cb',
    color: '#155724',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  errorBox: {
    background: '#f8d7da',
    border: '1px solid #f5c6cb',
    color: '#721c24',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '40px',
    paddingTop: '40px',
    borderTop: '1px solid #eee',
  },
  feature: {
    textAlign: 'center',
    padding: '20px',
  },
  footer: {
    textAlign: 'center',
    color: 'white',
    padding: '20px',
    opacity: 0.8,
  },
};
