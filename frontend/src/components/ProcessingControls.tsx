import React from 'react';
import { Volume2, Clock, Scissors, Settings2 } from 'lucide-react';

export interface ProcessingOptions {
  thresholdDb: number;
  silenceDuration: number;
  padding: number;
  keepCodec: boolean;
}

interface ProcessingControlsProps {
  options: ProcessingOptions;
  onChange: (options: ProcessingOptions) => void;
  disabled: boolean;
}

export const ProcessingControls: React.FC<ProcessingControlsProps> = ({
  options,
  onChange,
  disabled,
}) => {
  const handleChange = (
    key: keyof ProcessingOptions,
    value: number | boolean
  ) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
        <Settings2 className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Configurações de Corte
        </h3>
      </div>

      <div className="space-y-6">
        {/* Threshold */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Volume2 className="w-4 h-4 text-gray-400" />
              Limiar de Silêncio
            </label>
            <span className="text-sm font-semibold text-primary-600">
              {options.thresholdDb} dB
            </span>
          </div>
          <input
            type="range"
            min="-60"
            max="-10"
            step="1"
            value={options.thresholdDb}
            onChange={(e) => handleChange('thresholdDb', parseInt(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                       accent-primary-600 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500">
            Valores mais baixos detectam mais silêncio. Padrão: -30 dB
          </p>
        </div>

        {/* Silence Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4 text-gray-400" />
              Duração Mínima
            </label>
            <span className="text-sm font-semibold text-primary-600">
              {options.silenceDuration}s
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={options.silenceDuration}
            onChange={(e) => handleChange('silenceDuration', parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                       accent-primary-600 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500">
            Silêncios menores que isso serão ignorados. Padrão: 0.5s
          </p>
        </div>

        {/* Padding */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Scissors className="w-4 h-4 text-gray-400" />
              Margem de Segurança
            </label>
            <span className="text-sm font-semibold text-primary-600">
              {options.padding}s
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={options.padding}
            onChange={(e) => handleChange('padding', parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                       accent-primary-600 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500">
            Tempo extra antes/depois dos cortes. Padrão: 0.1s
          </p>
        </div>

        {/* Keep Codec */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Modo Rápido (Stream Copy)
            </label>
            <p className="text-xs text-gray-500">
              Mantém codec original - processamento 10x mais rápido
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={options.keepCodec}
              onChange={(e) => handleChange('keepCodec', e.target.checked)}
              disabled={disabled}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300
                            rounded-full peer peer-checked:after:translate-x-full
                            peer-checked:after:border-white after:content-[''] after:absolute
                            after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300
                            after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                            peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};
