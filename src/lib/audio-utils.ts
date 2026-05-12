/**
 * Utility functions for frequency to note conversion and pitch detection math.
 */

export const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export interface NoteInfo {
  note: string;
  octave: number;
  frequency: number;
  cents: number;
}

export const getNoteFromFrequency = (frequency: number): NoteInfo => {
  const n = 12 * (Math.log2(frequency / 440)) + 69;
  const roundedN = Math.round(n);
  const cents = (n - roundedN) * 100;
  
  const noteIndex = roundedN % 12;
  const octave = Math.floor(roundedN / 12) - 1;
  const noteName = NOTES[noteIndex >= 0 ? noteIndex : noteIndex + 12];
  
  return {
    note: noteName,
    octave,
    frequency,
    cents
  };
};

export const GUITAR_STRINGS = [
  { note: "E", octave: 4, freq: 329.63 },
  { note: "B", octave: 3, freq: 246.94 },
  { note: "G", octave: 3, freq: 196.00 },
  { note: "D", octave: 3, freq: 146.83 },
  { note: "A", octave: 2, freq: 110.00 },
  { note: "E", octave: 2, freq: 82.41 },
];
