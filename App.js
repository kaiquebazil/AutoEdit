import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';

// CONFIGURE O IP DO SEU COMPUTADOR AQUI
// No Windows, descubra com: ipconfig
// Exemplo: const API_URL = 'http://192.168.1.100:8000';
const API_URL = 'http://SEU_IP_AQUI:8000';

export default function App() {
  const [videoUri, setVideoUri] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, completed, error
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState('');

  // Settings
  const [threshold, setThreshold] = useState(-40);
  const [padding, setPadding] = useState(0.2);
  const [minSilence, setMinSilence] = useState(0.3);

  // Solicitar permissões
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria para selecionar vídeos.');
        }
      }
    })();
  }, []);

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setVideoUri(result.assets[0].uri);
        setStatus('idle');
        setProgress(0);
        setStats(null);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar o vídeo');
    }
  };

  const uploadVideo = async () => {
    if (!videoUri) return;

    setStatus('uploading');
    setProgress(10);

    try {
      const formData = new FormData();
      const filename = videoUri.split('/').pop();

      formData.append('file', {
        uri: videoUri,
        name: filename,
        type: 'video/mp4',
      });

      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      setJobId(response.data.job_id);
      setProgress(100);
      setStatus('uploaded');

      Alert.alert('Sucesso!', 'Vídeo enviado. Agora configure e processe.');
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('error');
      Alert.alert(
        'Erro no upload',
        `Verifique:\n1. Se o backend está rodando (run_api.bat)\n2. Se o IP em API_URL está correto\n3. Se o celular está na mesma rede WiFi\n\nErro: ${error.message}`
      );
    }
  };

  const startProcessing = async () => {
    if (!jobId) return;

    setStatus('processing');
    setProgress(0);
    setMessage('Iniciando...');

    try {
      await axios.post(`${API_URL}/process/${jobId}`, null, {
        params: {
          threshold,
          padding,
          min_silence_duration: minSilence,
        },
      });

      // Polling de status
      const pollInterval = setInterval(async () => {
        try {
          const response = await axios.get(`${API_URL}/status/${jobId}`);
          const data = response.data;

          setProgress(Math.round(data.progress * 100));

          if (data.status === 'completed') {
            clearInterval(pollInterval);
            setStatus('completed');
            setStats(data.stats);
            setProgress(100);
            Alert.alert('Pronto!', 'Vídeo processado com sucesso!');
          } else if (data.status === 'failed') {
            clearInterval(pollInterval);
            setStatus('error');
            setMessage(data.message || 'Falha no processamento');
            Alert.alert('Erro', data.message || 'Falha no processamento');
          } else {
            if (data.progress < 0.5) {
              setMessage('Detectando silêncios...');
            } else if (data.progress < 0.95) {
              setMessage('Editando vídeo...');
            } else {
              setMessage('Exportando...');
            }
          }
        } catch (err) {
          clearInterval(pollInterval);
          setStatus('error');
          Alert.alert('Erro', 'Falha ao verificar status');
        }
      }, 1000);
    } catch (error) {
      setStatus('error');
      Alert.alert('Erro', 'Falha ao iniciar processamento');
    }
  };

  const downloadVideo = async () => {
    if (!jobId) return;

    try {
      const downloadUrl = `${API_URL}/download/${jobId}`;

      // Para mobile, vamos compartilhar o link
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadUrl, {
          dialogTitle: 'Baixar vídeo processado',
        });
      } else {
        Alert.alert('Download', `Acesse:\n${downloadUrl}`);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível baixar o vídeo');
    }
  };

  const reset = () => {
    setVideoUri(null);
    setJobId(null);
    setStatus('idle');
    setProgress(0);
    setStats(null);
    setMessage('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.toString().padStart(4, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎬 Kaisui AutoEdit</Text>
        <Text style={styles.headerSubtitle}>Editor de Vídeo Mobile</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Video Selection */}
        {!videoUri ? (
          <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
            <Text style={styles.uploadButtonText}>📁 Selecionar Vídeo</Text>
            <Text style={styles.uploadHint}>Toque para escolher da galeria</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: videoUri }}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
              isLooping
            />
            <TouchableOpacity style={styles.changeButton} onPress={pickVideo}>
              <Text style={styles.changeButtonText}>Trocar vídeo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upload Button */}
        {videoUri && status === 'idle' && (
          <TouchableOpacity style={styles.primaryButton} onPress={uploadVideo}>
            <Text style={styles.primaryButtonText}>🚀 Enviar Vídeo</Text>
          </TouchableOpacity>
        )}

        {/* Uploading */}
        {status === 'uploading' && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.progressText}>Enviando...</Text>
          </View>
        )}

        {/* Settings */}
        {status === 'uploaded' && (
          <View style={styles.settingsContainer}>
            <Text style={styles.settingsTitle}>⚙️ Configurações</Text>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Limiar de Silêncio: {threshold} dB</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.smallButton} onPress={() => setThreshold(t => t - 5)}>
                  <Text>-5</Text>
                </TouchableOpacity>
                <Text style={styles.sliderValue}>{threshold} dB</Text>
                <TouchableOpacity style={styles.smallButton} onPress={() => setThreshold(t => t + 5)}>
                  <Text>+5</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Padding: {padding}s</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.smallButton} onPress={() => setPadding(p => Math.max(0, p - 0.1))}>
                  <Text>-0.1</Text>
                </TouchableOpacity>
                <Text style={styles.sliderValue}>{padding.toFixed(1)}s</Text>
                <TouchableOpacity style={styles.smallButton} onPress={() => setPadding(p => Math.min(1, p + 0.1))}>
                  <Text>+0.1</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Duração Mínima: {minSilence}s</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.smallButton} onPress={() => setMinSilence(m => Math.max(0.1, m - 0.1))}>
                  <Text>-0.1</Text>
                </TouchableOpacity>
                <Text style={styles.sliderValue}>{minSilence.toFixed(1)}s</Text>
                <TouchableOpacity style={styles.smallButton} onPress={() => setMinSilence(m => Math.min(2, m + 0.1))}>
                  <Text>+0.1</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.processButton} onPress={startProcessing}>
              <Text style={styles.processButtonText}>✂️ Processar Vídeo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Processing */}
        {status === 'processing' && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressPercent}>{progress}%</Text>
            <Text style={styles.processingText}>{message}</Text>
          </View>
        )}

        {/* Results */}
        {status === 'completed' && stats && (
          <View style={styles.resultsContainer}>
            <Text style={styles.successText}>✅ Processado com sucesso!</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Original</Text>
                <Text style={styles.statValue}>{formatTime(stats.original_duration)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Final</Text>
                <Text style={styles.statValue}>{formatTime(stats.final_duration)}</Text>
              </View>
              <View style={[styles.statItem, styles.highlightStat]}>
                <Text style={styles.statLabel}>Economia</Text>
                <Text style={styles.statValue}>{formatTime(stats.time_saved)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Cortes</Text>
                <Text style={styles.statValue}>{stats.silence_segments}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.downloadButton} onPress={downloadVideo}>
              <Text style={styles.downloadButtonText}>⬇️ Baixar Vídeo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={reset}>
              <Text style={styles.resetButtonText}>🔄 Processar Outro</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error */}
        {status === 'error' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ Erro no processamento</Text>
            <Text style={styles.errorMessage}>{message}</Text>
            <TouchableOpacity style={styles.resetButton} onPress={reset}>
              <Text style={styles.resetButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* IP Config Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>📱 Como Usar</Text>
          <Text style={styles.instructionsText}>
            1. Descubra o IP do PC: Abra o CMD e digite ipconfig{'\n'}
            2. Edite App.js e mude API_URL para o seu IP{'\n'}
            3. Inicie o backend: run_api.bat{'\n'}
            4. Conecte o celular no mesmo WiFi{'\n'}
            5. Execute o app com npx expo start
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  uploadButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    fontSize: 18,
    color: '#667eea',
    fontWeight: '600',
  },
  uploadHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
  },
  videoContainer: {
    backgroundColor: 'black',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  video: {
    width: '100%',
    height: 200,
  },
  changeButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    alignItems: 'center',
  },
  changeButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'center',
    padding: 40,
  },
  progressText: {
    marginTop: 15,
    fontSize: 16,
    color: '#667eea',
  },
  settingsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallButton: {
    backgroundColor: '#f0f2f6',
    padding: 10,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  processButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  processButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  processingContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 5,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginTop: 10,
  },
  processingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  highlightStat: {
    backgroundColor: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  downloadButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#f0f2f6',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#333',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  instructionsText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});
