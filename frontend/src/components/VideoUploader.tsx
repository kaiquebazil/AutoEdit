import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Film, AlertCircle, X } from 'lucide-react';

interface VideoUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ACCEPTED_FORMATS = {
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
  'video/webm': ['.webm'],
  'video/mkv': ['.mkv'],
};

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  onFileSelect,
  selectedFile,
  onClear,
}) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
          setError('Arquivo muito grande. Tamanho máximo: 500MB');
        } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
          setError('Formato inválido. Use: MP4, MOV, AVI, WEBM ou MKV');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.size > MAX_FILE_SIZE) {
          setError('Arquivo muito grande. Tamanho máximo: 500MB');
          return;
        }
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: !!selectedFile,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (selectedFile) {
    return (
      <div className="card p-6 animate-in">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Film className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-sm text-gray-500">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <button
            onClick={onClear}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Remover arquivo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200 ease-out
          ${isDragActive && !isDragReject ? 'drag-active' : 'border-gray-300 hover:border-gray-400'}
          ${isDragReject ? 'border-red-400 bg-red-50' : 'bg-white'}
          ${selectedFile ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          <div className={`
            mx-auto w-16 h-16 rounded-full flex items-center justify-center
            transition-colors duration-200
            ${isDragActive ? 'bg-primary-100' : 'bg-gray-100'}
          `}>
            <Upload className={`
              w-8 h-8 transition-colors duration-200
              ${isDragActive ? 'text-primary-600' : 'text-gray-400'}
            `} />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Solte o vídeo aqui' : 'Arraste seu vídeo aqui'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              ou{' '}
              <span className="text-primary-600 font-medium hover:text-primary-700">
                clique para selecionar
              </span>
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {Object.values(ACCEPTED_FORMATS).flat().map((ext) => (
              <span
                key={ext}
                className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded"
              >
                {ext.toUpperCase().replace('.', '')}
              </span>
            ))}
          </div>

          <p className="text-xs text-gray-400">
            Tamanho máximo: 500MB
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg animate-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
