import { useState, useEffect, useRef } from 'react';
import { PitchDetector } from 'pitchy';
import { getNoteFromFrequency, NoteInfo } from '../lib/audio-utils';

export const useTuner = () => {
  const [isActive, setIsActive] = useState(false);
  const [noteInfo, setNoteInfo] = useState<NoteInfo | null>(null);
  const [clarity, setClarity] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [directionHint, setDirectionHint] = useState<'up' | 'down' | 'perfect' | null>(null);
  const [isWrongDirection, setIsWrongDirection] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const centsHistoryRef = useRef<number[]>([]);
  const wrongDirectionStartTimeRef = useRef<number | null>(null);

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
      analyser.fftSize = 4096; // Increased from 2048 for better low-frequency resolution (E2 string)
      source.connect(analyser);
      analyserRef.current = analyser;

      const detector = PitchDetector.forFloat32Array(analyser.fftSize);
      const input = new Float32Array(analyser.fftSize);
      let lastPitches: number[] = [];

      const update = () => {
        analyser.getFloatTimeDomainData(input);
        const [pitch, clarityValue] = detector.findPitch(input, audioContext.sampleRate);

        setClarity(clarityValue);
        
        // Advanced smoothing logic for pro-level stability
        if (clarityValue > 0.82 && pitch > 60 && pitch < 1000) {
          lastPitches.push(pitch);
          if (lastPitches.length > 3) lastPitches.shift();
          
          const averagePitch = lastPitches.reduce((a, b) => a + b, 0) / lastPitches.length;
          const info = getNoteFromFrequency(averagePitch);
          setNoteInfo(info);

          // Update history for trend detection
          centsHistoryRef.current = [...centsHistoryRef.current.slice(-10), info.cents];

          // Determine direction hint
          const closeThreshold = 5.0; // cents
          let currentlyWrong = false;

          if (Math.abs(info.cents) < closeThreshold) {
            setDirectionHint('perfect');
            currentlyWrong = false;
          } else if (info.cents > 0) {
            setDirectionHint('down');
            // If sharp and cents are getting higher, it's potentially wrong direction
            currentlyWrong = centsHistoryRef.current.length > 5 && 
               centsHistoryRef.current[centsHistoryRef.current.length - 1] > centsHistoryRef.current[0] + 1.5;
          } else {
            setDirectionHint('up');
            // If flat and cents are getting lower (more negative), it's potentially wrong direction
            currentlyWrong = centsHistoryRef.current.length > 5 && 
               centsHistoryRef.current[centsHistoryRef.current.length - 1] < centsHistoryRef.current[0] - 1.5;
          }

          // Handle wrong direction timer (3 second threshold)
          if (currentlyWrong) {
            if (wrongDirectionStartTimeRef.current === null) {
              wrongDirectionStartTimeRef.current = Date.now();
            } else if (Date.now() - wrongDirectionStartTimeRef.current > 3000) {
              setIsWrongDirection(true);
            }
          } else {
            wrongDirectionStartTimeRef.current = null;
            setIsWrongDirection(false);
          }
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
    setDirectionHint(null);
    setIsWrongDirection(false);
    centsHistoryRef.current = [];
    wrongDirectionStartTimeRef.current = null;
  };

  useEffect(() => {
    return () => stopTuner();
  }, []);

  return { isActive, noteInfo, clarity, error, directionHint, isWrongDirection, startTuner, stopTuner };
};
