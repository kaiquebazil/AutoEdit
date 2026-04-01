import React from 'react';
import { Download, Clock, Scissors, Zap, RotateCcw } from 'lucide-react';
import type { ProcessingResult } from '../hooks/useVideoProcessor';

interface ResultCardProps {
  result: ProcessingResult;
  onDownload: () => void;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onDownload,
  onReset,
}) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatSavedTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  const savingsPercent = result.originalDuration > 0
    ? Math.round((result.timeSaved / result.originalDuration) * 100)
    : 0;

  return (
    <div className="card p-6 space-y-6 animate-in">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Zap className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Vídeo Processado!
          </h3>
          <p className="text-sm text-gray-500">
            {result.cutsMade} {result.cutsMade === 1 ? 'corte realizado' : 'cortes realizados'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Original</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatDuration(result.originalDuration)}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Scissors className="w-4 h-4" />
            <span className="text-xs font-medium">Cortado</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatDuration(result.processedDuration)}
          </p>
        </div>
      </div>

      {/* Time Saved Highlight */}
      <div className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tempo economizado</p>
            <p className="text-2xl font-bold gradient-text">
              {formatSavedTime(result.timeSaved)}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
              -{savingsPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onDownload}
          className="btn-primary flex-1"
        >
          <Download className="w-5 h-5 mr-2" />
          Baixar Vídeo
        </button>

        <button
          onClick={onReset}
          className="btn-secondary px-4"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
