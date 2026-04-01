import React from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  isUploading: boolean;
  isProcessing: boolean;
  error: string | null;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  isUploading,
  isProcessing,
  error,
}) => {
  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-in">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!isUploading && !isProcessing) return null;

  const getStatusText = () => {
    if (isProcessing) return 'Processando vídeo...';
    if (progress === 100) return 'Finalizando upload...';
    return `Enviando... ${progress}%`;
  };

  return (
    <div className="space-y-3 animate-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''} text-primary-600`} />
          <span className="text-sm font-medium text-gray-700">{getStatusText()}</span>
        </div>
        {!isProcessing && (
          <span className="text-sm text-gray-500">{progress}%</span>
        )}
      </div>

      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {isProcessing && (
        <p className="text-xs text-gray-500">
          Detectando silêncios e cortando vídeo... Isso pode levar alguns minutos.
        </p>
      )}
    </div>
  );
};
