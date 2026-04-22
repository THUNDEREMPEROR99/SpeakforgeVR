/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useRef } from 'react';
import { useInterviewStore } from './store';

export function useSpeechRecognition() {
  const { 
    setTranscript, 
    setIsListening, 
    setIsMicActive, 
    setMicError, 
    setVolumeLevel, 
    setMicDiagnostic 
  } = useInterviewStore();
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    setVolumeLevel(0);
    setIsMicActive(false);
  }, [setVolumeLevel, setIsMicActive]);

  const startListening = useCallback(async () => {
    // 1. Initialize AudioContext IMMEDIATELY on user gesture
    // This is critical. Some browsers discard the gesture after an await (like getUserMedia)
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    let audioCtx: AudioContext | null = null;
    
    try {
      audioCtx = new AudioCtx();
    } catch (e) {
      console.error("AudioContext creation failed", e);
    }

    // Check compatibility
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setMicError("Speech Recognition not supported in this browser.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    cleanupAudio();

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      setTranscript('');
      setMicError(null);
      setMicDiagnostic('TRANSCRIPTION_LISTENING');
    };

    recognition.onresult = (event: any) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript;
      }
      setTranscript(fullTranscript);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      setMicDiagnostic('TRANSCRIPTION_ENDED');
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event.error);
      setMicDiagnostic(`RECOG_ERROR: ${event.error}`);
      
      switch(event.error) {
        case 'not-allowed':
          setMicError("Hardware access restricted by browser. Please use 'Open in New Tab'.");
          break;
        case 'no-speech':
          return;
        case 'network':
          setMicError("Internet connection required for transcription.");
          break;
        default:
          setMicError(`Recognition error: ${event.error}`);
          break;
      }
      setIsListening(false);
    };

    try {
      setMicDiagnostic('REQUESTING_HARDWARE...');
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsMicActive(true);
      setMicDiagnostic('HARDWARE_GRANTED');
      
      // Setup Volume Analyzer using the pre-created context
      if (audioCtx) {
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
        
        const source = audioCtx.createMediaStreamSource(stream);
        const analyzer = audioCtx.createAnalyser();
        analyzer.fftSize = 256;
        source.connect(analyzer);

        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        audioContextRef.current = audioCtx;
        analyzerRef.current = analyzer;

        const updateVolume = () => {
          if (!analyzerRef.current) return;
          analyzerRef.current.getByteFrequencyData(dataArray);
          
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;

          // LOGGING for debugging silence
          if (average > 0) {
            setMicDiagnostic('SIGNAL_FLYING');
          } else if (isMicActive) {
            // Periodic keep-alive for suspended contexts
            if (audioCtx && Math.random() > 0.98) {
               audioCtx.resume().catch(() => {});
            }
          }

          // Ultra-Aggressive sensitivity mapping
          // (average * 5) ensures even tiny room noises create visual movement
          setVolumeLevel(Math.min(1.0, (average * 5) / 128)); 
          
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();
      }
      
      setMicDiagnostic('STARTING_RECOGNITION...');
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e: any) {
      console.error("Hardware access failed:", e);
      setMicDiagnostic(`CRITICAL_FAIL: ${e.name}`);
      if (e.name === 'NotAllowedError' || e.name === 'SecurityError') {
        setMicError("Hardware blocked by browser. You MUST use 'Open in New Tab' to speak.");
      } else {
        setMicError(`Hardware error: ${e.message}`);
      }
      setIsListening(false);
      cleanupAudio();
    }
  }, [setIsListening, setIsMicActive, setTranscript, setMicError, setVolumeLevel, setMicDiagnostic, cleanupAudio]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    cleanupAudio();
  }, [cleanupAudio]);

  return { startListening, stopListening };
}
