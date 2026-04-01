import { useState, useCallback } from 'react';
import { VideoUploader } from './components/VideoUploader';
import { ProcessingControls, ProcessingOptions } from './components/ProcessingControls';
import { ProgressBar } from './components/ProgressBar';
import { ResultCard } from './components/ResultCard';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { useVideoProcessor } from './hooks/useVideoProcessor';
import { Play, Sparkles } from 'lucide-react';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [options, setOptions] = useState<ProcessingOptions>({
    thresholdDb: -30,
    silenceDuration: 0.5,
    padding: 0.1,
    keepCodec: true,
  });

  const {
    isUploading,
    isProcessing,
    uploadProgress,
    error,
    result,
    processVideo,
    downloadResult,
    reset,
  } = useVideoProcessor();

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    reset();
  }, [reset]);

  const handleProcess = useCallback(async () => {
    if (!selectedFile) return;
    await processVideo(selectedFile, options);
  }, [selectedFile, options, processVideo]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    reset();
  }, [reset]);

  const isBusy = isUploading || isProcessing;

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Intro Section */}
          {!result && !isBusy && (
            <div className="text-center mb-8 animate-in">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Corte automático de silêncios
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto">
                Remova automaticamente os momentos de silêncio dos seus vídeos.
                Ideal para tutoriais, aulas, podcasts e gameplay.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Video Uploader */}
            <VideoUploader
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onClear={handleClear}
            />

            {/* Processing Controls - only show when file selected and no result */}
            {selectedFile && !result && (
              <ProcessingControls
                options={options}
                onChange={setOptions}
                disabled={isBusy}
              />
            )}

            {/* Progress Bar */}
            <ProgressBar
              progress={uploadProgress}
              isUploading={isUploading}
              isProcessing={isProcessing}
              error={error}
            />

            {/* Result Card */}
            {result && (
              <ResultCard
                result={result}
                onDownload={downloadResult}
                onReset={handleReset}
              />
            )}

            {/* Process Button */}
            {selectedFile && !result && !isBusy && (
              <button
                onClick={handleProcess}
                disabled={!selectedFile || isBusy}
                className="w-full btn-primary text-lg py-4 group"
              >
                <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Processar Vídeo
                <Play className="w-5 h-5 ml-2" />
              </button>
            )}

            {/* Features */}
            {!selectedFile && !result && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
                <FeatureCard
                  title="Processamento Rápido"
                  description="Stream copy sem re-codificação. 10x mais rápido que editores tradicionais."
                  icon="⚡"
                />
                <FeatureCard
                  title="Controle Total"
                  description="Ajuste limiar, duração e margem. Personalize para cada tipo de vídeo."
                  icon="🔧"
                />
                <FeatureCard
                  title="Qualidade Original"
                  description="Mantém a qualidade do vídeo original. Sem compressão adicional."
                  icon="✨"
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="card p-6 text-center hover:-translate-y-1 transition-transform">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

export default App;
