import { useState, useCallback, useRef } from 'react';
import axios, { AxiosProgressEvent } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ProcessingOptions {
  thresholdDb: number;
  silenceDuration: number;
  padding: number;
  keepCodec: boolean;
}

export interface ProcessingResult {
  blob: Blob;
  filename: string;
  originalDuration: number;
  processedDuration: number;
  timeSaved: number;
  cutsMade: number;
}

export interface ProcessingState {
  isUploading: boolean;
  isProcessing: boolean;
  uploadProgress: number;
  error: string | null;
  result: ProcessingResult | null;
}

export const useVideoProcessor = () => {
  const [state, setState] = useState<ProcessingState>({
    isUploading: false,
    isProcessing: false,
    uploadProgress: 0,
    error: null,
    result: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      isUploading: false,
      isProcessing: false,
      uploadProgress: 0,
      error: null,
      result: null,
    });
  }, []);

  const processVideo = useCallback(async (
    file: File,
    options: ProcessingOptions
  ): Promise<void> => {
    // Reset state
    setState({
      isUploading: true,
      isProcessing: false,
      uploadProgress: 0,
      error: null,
      result: null,
    });

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('threshold_db', options.thresholdDb.toString());
    formData.append('silence_duration', options.silenceDuration.toString());
    formData.append('padding', options.padding.toString());
    formData.append('keep_codec', options.keepCodec.toString());

    try {
      const response = await axios.post(
        `${API_BASE_URL}/process-video`,
        formData,
        {
          signal: abortControllerRef.current.signal,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'blob',
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setState((prev) => ({
                ...prev,
                uploadProgress: progress,
                isProcessing: progress === 100,
              }));
            }
          },
        }
      );

      // Extract headers
      const headers = response.headers;
      const originalDuration = parseFloat(headers['x-original-duration'] || '0');
      const processedDuration = parseFloat(headers['x-processed-duration'] || '0');
      const timeSaved = parseFloat(headers['x-time-saved'] || '0');
      const cutsMade = parseInt(headers['x-cuts-made'] || '0');

      // Get filename from content-disposition header
      const contentDisposition = headers['content-disposition'] || '';
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] || `cut_${file.name}`;

      setState({
        isUploading: false,
        isProcessing: false,
        uploadProgress: 100,
        error: null,
        result: {
          blob: response.data as Blob,
          filename,
          originalDuration,
          processedDuration,
          timeSaved,
          cutsMade,
        },
      });
    } catch (error) {
      if (axios.isCancel(error)) {
        setState({
          isUploading: false,
          isProcessing: false,
          uploadProgress: 0,
          error: 'Processamento cancelado',
          result: null,
        });
      } else {
        let errorMessage = 'Erro ao processar vídeo';
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 413) {
            errorMessage = 'Arquivo muito grande (máx: 500MB)';
          } else if (error.response?.status === 400) {
            errorMessage = 'Tipo de arquivo inválido';
          } else if (error.response?.data) {
            // Try to parse error from blob
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const errorData = JSON.parse(reader.result as string);
                errorMessage = errorData.detail || errorMessage;
              } catch {
                errorMessage = 'Erro no servidor';
              }
            };
            reader.readAsText(error.response.data);
          }
        }
        setState({
          isUploading: false,
          isProcessing: false,
          uploadProgress: 0,
          error: errorMessage,
          result: null,
        });
      }
    }
  }, []);

  const downloadResult = useCallback(() => {
    if (!state.result) return;

    const url = window.URL.createObjectURL(state.result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = state.result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, [state.result]);

  return {
    ...state,
    processVideo,
    downloadResult,
    reset,
  };
};
