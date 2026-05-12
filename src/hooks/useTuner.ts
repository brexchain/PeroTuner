import { useState, useEffect, useRef } from 'react';
import { PitchDetector } from 'pitchy';
import { getNoteFromFrequency, NoteInfo } from '../lib/audio-utils';

export const useTuner = () => {
  const [isActive, setIsActive] = useState(false);
  const [noteInfo, setNoteInfo] = useState<NoteInfo | null>(null);
  const [clarity, setClarity] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startTuner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      } });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const detector = PitchDetector.forFloat32Array(analyser.fftSize);
      const input = new Float32Array(analyser.fftSize);

      const update = () => {
        analyser.getFloatTimeDomainData(input);
        const [pitch, clarityValue] = detector.findPitch(input, audioContext.sampleRate);

        setClarity(clarityValue);
        
        // Clarity threshold adjustment: guitar notes usually have high clarity
        if (clarityValue > 0.8 && pitch > 50 && pitch < 1000) {
          setNoteInfo(getNoteFromFrequency(pitch));
        }

        animationFrameRef.current = requestAnimationFrame(update);
      };

      update();
      setIsActive(true);
      setError(null);
    } catch (err) {
      console.error('Error starting tuner:', err);
      setError(err instanceof Error ? err.message : 'Could not access microphone');
    }
  };

  const stopTuner = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsActive(false);
    setNoteInfo(null);
  };

  useEffect(() => {
    return () => stopTuner();
  }, []);

  return { isActive, noteInfo, clarity, error, startTuner, stopTuner };
};
