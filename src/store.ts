/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';

export type InterviewStatus = 'idle' | 'intro' | 'questioning' | 'answering' | 'evaluating' | 'completed';

export interface Question {
  id: string;
  text: string;
  expectedKeywords: string[];
}

export interface Answer {
  questionId: string;
  text: string;
  feedback: string;
  score: number;
}

interface InterviewState {
  status: InterviewStatus;
  currentQuestionIndex: number;
  questions: Question[];
  answers: Answer[];
  isListening: boolean;
  transcript: string;
  micError: string | null;
  volumeLevel: number;
  isMicActive: boolean;
  micDiagnostic: string;
  
  // Actions
  setStatus: (status: InterviewStatus) => void;
  startInterview: () => void;
  nextQuestion: () => void;
  addAnswer: (answer: Answer) => void;
  setTranscript: (text: string) => void;
  setIsListening: (is: boolean) => void;
  setIsMicActive: (is: boolean) => void;
  setMicError: (error: string | null) => void;
  setMicDiagnostic: (msg: string) => void;
  setVolumeLevel: (level: number) => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  status: 'idle',
  currentQuestionIndex: -1,
  questions: [
    { id: '1', text: "Tell me about yourself and your background.", expectedKeywords: ['experience', 'education', 'skills', 'goals'] },
    { id: '2', text: "Why should we hire you for this position?", expectedKeywords: ['strength', 'value', 'contribution', 'fit'] },
    { id: '3', text: "Describe a challenge you faced and how you handled it.", expectedKeywords: ['problem', 'solution', 'leadership', 'result'] },
    { id: '4', text: "What is your greatest strength and weakness?", expectedKeywords: ['growth', 'learning', 'performance', 'honesty'] },
  ],
  answers: [],
  isListening: false,
  isMicActive: false,
  transcript: '',
  micError: null,
  volumeLevel: 0,
  micDiagnostic: 'INIT_SYSTEM',

  setStatus: (status) => set({ status }),
  
  startInterview: () => set({ 
    status: 'intro', 
    currentQuestionIndex: 0,
    answers: [],
    transcript: '',
    micError: null,
    volumeLevel: 0
  }),

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ 
        currentQuestionIndex: currentQuestionIndex + 1,
        status: 'questioning',
        transcript: '',
        micError: null,
        volumeLevel: 0
      });
    } else {
      set({ status: 'completed' });
    }
  },

  addAnswer: (answer) => set((state) => ({ 
    answers: [...state.answers, answer] 
  })),

  setTranscript: (transcript) => set({ transcript }),
  
  setIsListening: (isListening) => set({ isListening }),

  setIsMicActive: (isMicActive) => set({ isMicActive }),

  setMicError: (micError) => set({ micError }),

  setMicDiagnostic: (micDiagnostic) => set({ micDiagnostic }),

  setVolumeLevel: (volumeLevel) => set({ volumeLevel }),

  reset: () => set({
    status: 'idle',
    currentQuestionIndex: -1,
    answers: [],
    transcript: '',
    micError: null,
    volumeLevel: 0,
    isMicActive: false,
    micDiagnostic: 'SYSTEM_RESET'
  })
}));
