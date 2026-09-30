/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Antarctic Voice Input Engine (Web Speech API + Heavy Glove Operation)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity008
 */

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  label?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, label = 'VOICE INPUT' }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setRecognitionSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognitionInstance(recognition);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionSupported) {
      // Offline fallback: prompt quick speech simulation
      const fallbackPhrases = [
        'Generator 2 oil pressure nominal',
        'Priyadarshini water trace heating verified',
        'Katabatic wind gust exceeded 85 km/h',
        'PistenBully fuel level 82 percent',
        'Returning to Main Habitat vestibule'
      ];
      const randomPhrase = fallbackPhrases[Math.floor(Math.random() * fallbackPhrases.length)];
      onTranscript(randomPhrase);
      return;
    }

    if (isListening) {
      recognitionInstance?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionInstance?.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`antarctic-button w-full flex items-center justify-center gap-4 ${
        isListening ? 'antarctic-button-active' : ''
      }`}
      style={{
        backgroundColor: isListening ? '#FFD700' : '#000000',
        color: isListening ? '#000000' : '#FFFFFF',
        borderColor: isListening ? '#FFD700' : '#FFFFFF'
      }}
    >
      {isListening ? (
        <>
          <Mic className="w-8 h-8 animate-pulse text-[#000000]" />
          <span>LISTENING... TAP TO STOP</span>
        </>
      ) : (
        <>
          <Mic className="w-8 h-8 text-[#00FFFF]" />
          <span>{label} (TAP TO SPEAK)</span>
        </>
      )}
    </button>
  );
};
