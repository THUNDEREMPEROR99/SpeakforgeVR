/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Text, Float, RoundedBox } from '@react-three/drei';
import { useInterviewStore } from '../store';
import { useSpeechRecognition } from '../useSpeechRecognition';
import { evaluateAnswer } from '../services/gemini';
import { useState, useEffect, useCallback } from 'react';

export default function VRUI({ onExit }: { onExit: () => void }) {
  const { 
    status, 
    currentQuestionIndex, 
    questions, 
    transcript, 
    isListening, 
    setStatus,
    addAnswer,
    startInterview,
    nextQuestion,
    reset,
    answers,
    micError,
    volumeLevel,
    isMicActive,
    micDiagnostic,
    setTranscript
  } = useInterviewStore();

  const { startListening, stopListening } = useSpeechRecognition();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const currentQuestion = questions[currentQuestionIndex];
  const lastAnswer = answers[answers.length - 1];

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    if (status === 'intro') {
      const timer = setTimeout(() => {
        setStatus('questioning');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, setStatus]);

  useEffect(() => {
    if (status === 'questioning' && currentQuestion) {
      speak(currentQuestion.text);
    }
  }, [status, currentQuestionIndex, currentQuestion, speak]);

  const handleExit = () => {
    reset();
    onExit();
  };

  const handleFinishAnswering = async (finalText?: string) => {
    const textToEvaluate = finalText || transcript || manualInput;
    
    stopListening();
    setStatus('evaluating');
    setIsEvaluating(true);
    
    const evaluation = await evaluateAnswer(currentQuestion.text, textToEvaluate);
    
    addAnswer({
      questionId: currentQuestion.id,
      text: textToEvaluate,
      feedback: evaluation.feedback,
      score: evaluation.score
    });
    
    setIsEvaluating(false);
    setShowKeyboard(false);
    setManualInput('');
    setStatus('completed');
  };

  const handleNext = () => {
    nextQuestion();
  };

  return (
    <group position={[0, 1.6, -1.8]}>
      {/* Background Panel - Glass Effect */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[1.5, 0.9]} />
        <meshStandardMaterial 
          color="#0f172a" 
          transparent 
          opacity={0.7} 
          roughness={0} 
          metalness={0.5} 
        />
      </mesh>
      {/* Border top accent */}
      <mesh position={[0, 0.44, 0]}>
         <boxGeometry args={[1.5, 0.01, 0.01]} />
         <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
      </mesh>

      {/* Header labels */}
      <Text
        position={[-0.7, 0.4, 0.01]}
        fontSize={0.02}
        color="#22d3ee"
        anchorX="left"
      >
        SPEAKFORGE VR // INTERFACE_ACTIVE
      </Text>

      {/* Mic Status & Diagnostic Info */}
      <Text
        position={[0.7, 0.4, 0.01]}
        fontSize={0.012}
        color={micError ? "#f87171" : (isMicActive ? "#22d3ee" : "#64748b")}
        anchorX="right"
      >
        {micError ? `FAIL: ${micError}` : (isMicActive ? `HW_LINK: ACTIVE\nLOG: ${micDiagnostic}` : `HW_IDLE\nLOG: ${micDiagnostic}`)}
      </Text>

      {/* Main Content Area */}
      {status === 'idle' && (
        <InteractiveButton 
          position={[0, 0, 0]} 
          text="INITIATE SYSTEM" 
          onClick={startInterview} 
        />
      )}

      {status === 'intro' && (
        <group>
          <Text
            position={[0, 0.1, 0]}
            fontSize={0.03}
            color="#64748b"
          >
            AWAITING BIO-SYNC...
          </Text>
          <Text
            position={[0, 0, 0]}
            fontSize={0.05}
            color="white"
            maxWidth={1.2}
            textAlign="center"
          >
            Welcome Speaker. Calibrating environment.
          </Text>
        </group>
      )}

      {(status === 'questioning' || status === 'answering' || status === 'evaluating') && currentQuestion && (
        <group>
          <Text
            position={[0, 0.25, 0.01]}
            fontSize={0.025}
            color="#94a3b8"
            anchorX="center"
          >
            {`TRANSCRIPT_INDEX: 00${currentQuestionIndex + 1}`}
          </Text>
          <Text
            position={[0, 0.12, 0.01]}
            fontSize={0.055}
            color="white"
            maxWidth={1.3}
            textAlign="center"
          >
            {`"${currentQuestion.text}"`}
          </Text>

          {status === 'questioning' && (
            <group>
               <Text
                position={[0, -0.05, 0.01]}
                fontSize={0.02}
                color="#22d3ee"
              >
                INTERVIEWER_VOICE: ACTIVE
              </Text>
              <group position={[0, -0.2, 0]}>
                <InteractiveButton 
                  position={[-0.32, 0, 0]} 
                  width={0.6}
                  text="START VOICE INPUT" 
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    setStatus('answering');
                    startListening();
                  }} 
                />
                <InteractiveButton 
                  position={[0.32, 0, 0]} 
                  width={0.6}
                  text="BYPASS (TEXT INPUT)" 
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    setStatus('answering');
                    setShowKeyboard(true);
                  }} 
                />
              </group>
            </group>
          )}

          {status === 'answering' && (
            <group>
               {!showKeyboard ? (
                 <group>
                   <Text
                    position={[0, -0.05, 0.01]}
                    fontSize={0.025}
                    color="#22d3ee"
                  >
                    {isListening ? "SIGNAL_PROCESSING: ACTIVE" : "SIGNAL_ANALYSIS: WAITING"}
                  </Text>
                  
                  {/* Visualizer - Reactive to real volumeLevel */}
                  <group position={[0, -0.18, 0]}>
                    {[-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3].map((x, i) => {
                      // Ultra-high sensitivity visualizer with auto-gain
                      const sensitivityScale = volumeLevel > 0 ? 3.0 : 0;
                      const h = 0.03 + (volumeLevel * sensitivityScale * (0.4 + (i % 3) * 0.1));
                      
                      // Standby = Neutral Blue, Active = Bright Cyan, Error = Deep Red
                      const isLinked = isMicActive;
                      const hasSignal = volumeLevel > 0.01;
                      
                      let barColor = "#1e293b"; // Idle
                      if (isLinked) barColor = "#0e7490"; // Hardware Linked (Standby Blue)
                      if (hasSignal) barColor = "#22d3ee"; // Active Signal (Cyan)
                      if (micError) barColor = "#f87171"; // Actual Error (Red)

                      return (
                        <mesh key={i} position={[x, (h/2) - 0.02, 0]}>
                          <boxGeometry args={[0.04, h, 0.01]} />
                          <meshStandardMaterial 
                            color={barColor} 
                            emissive={barColor} 
                            emissiveIntensity={hasSignal ? volumeLevel * 25 : 0.5} 
                          />
                        </mesh>
                      );
                    })}
                  </group>

                  <Text
                    position={[0, -0.35, 0.01]}
                    fontSize={0.03}
                    color="white"
                    maxWidth={1.2}
                    textAlign="center"
                  >
                    {transcript ? `"${transcript}"` : (volumeLevel > 0.02 ? "Signal detected, processing..." : (isMicActive ? "HW Linked: Speak now (or check mic mute)" : "AWAITING_INPUT..."))}
                  </Text>
                  <group position={[0, -0.42, 0]}>
                    <InteractiveButton 
                      position={[-0.32, 0, 0]} 
                      width={0.6}
                      text="FORCE_CALIB" 
                      onClick={() => startListening()} 
                    />
                    <InteractiveButton 
                      position={[0.32, 0, 0]} 
                      width={0.6}
                      text="COMMIT_ANSWER" 
                      onClick={() => handleFinishAnswering()} 
                    />
                  </group>
                 </group>
               ) : (
                 <group>
                    <Text position={[0, -0.05, 0.01]} fontSize={0.03} color="#22d3ee">SYSTEM_BYPASS: MANUAL_ENTRY</Text>
                    
                    {/* Simple virtual text area representation */}
                    <mesh position={[0, -0.2, 0]}>
                      <planeGeometry args={[1.2, 0.15]} />
                      <meshStandardMaterial color="#1e293b" />
                    </mesh>
                    <Text
                      position={[0, -0.2, 0.01]}
                      fontSize={0.03}
                      color="white"
                      maxWidth={1.1}
                      textAlign="center"
                    >
                      {manualInput || "Enter text via keyboard and press SUBMIT"}
                    </Text>

                    <group position={[0, -0.35, 0]}>
                      <InteractiveButton 
                        position={[-0.3, 0, 0]} 
                        width={0.4}
                        text="USE_SAMPLE_RESP" 
                        onClick={() => setManualInput("I have extensive experience in full-stack development and VR integration.")} 
                      />
                      <InteractiveButton 
                        position={[0.3, 0, 0]} 
                        width={0.4}
                        text="SUBMIT_RESPONSE" 
                        onClick={() => handleFinishAnswering()} 
                      />
                    </group>
                 </group>
               )}
            </group>
          )}

          {status === 'evaluating' && (
             <Text
              position={[0, -0.15, 0.01]}
              fontSize={0.04}
              color="#22d3ee"
            >
              Analyzing linguistic patterns...
            </Text>
          )}
        </group>
      )}

      {status === 'completed' && (
        <group>
          {lastAnswer ? (
            <group>
               <Text
                position={[0, 0.2, 0.01]}
                fontSize={0.03}
                color="#22d3ee"
              >
                 NEURAL_EVALUATION_REPORT
              </Text>
              <mesh position={[0, 0.05, 0]}>
                <circleGeometry args={[0.15, 32]} />
                <meshStandardMaterial color="#0f172a" transparent opacity={0.5} />
              </mesh>
              <Text
                position={[0, 0.05, 0.02]}
                fontSize={0.1}
                color="white"
              >
                {String(lastAnswer.score)}
              </Text>
              <Text
                position={[0, -0.05, 0.01]}
                fontSize={0.025}
                color="#22d3ee"
              >
                SCORE_OUT_OF_10
              </Text>
              <Text
                position={[0, -0.18, 0.01]}
                fontSize={0.03}
                color="#d1d5db"
                maxWidth={1.3}
                textAlign="center"
                fontStyle="italic"
              >
                {lastAnswer.feedback}
              </Text>
              
              <group position={[0, -0.35, 0]}>
                {currentQuestionIndex < questions.length - 1 ? (
                  <InteractiveButton 
                    position={[0, 0, 0]} 
                    width={0.6}
                    text="CONTINUE_SIMULATION" 
                    onClick={handleNext} 
                  />
                ) : (
                  <group>
                    <InteractiveButton 
                      position={[-0.32, 0, 0]} 
                      width={0.6}
                      text="RETRY_SIMULATION" 
                      onClick={() => {
                        reset();
                        startInterview();
                      }} 
                    />
                    <InteractiveButton 
                      position={[0.32, 0, 0]} 
                      width={0.6}
                      text="EXIT_TO_MENU" 
                      onClick={handleExit} 
                    />
                  </group>
                )}
              </group>
            </group>
          ) : (
            <InteractiveButton position={[0, 0, 0]} text="RETURN_MENU" onClick={handleExit} />
          )}
        </group>
      )}
    </group>
  );
}

function InteractiveButton({ position, text, onClick, width = 0.5 }: { position: [number, number, number], text: string, onClick: () => void, width?: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <RoundedBox args={[width, 0.12, 0.03]} radius={0.03} smoothness={4}>
        <meshStandardMaterial 
          color={hovered ? "#22d3ee" : "#0f172a"} 
          transparent={!hovered}
          opacity={hovered ? 0.9 : 0.6}
          roughness={0}
          metalness={1}
          emissive={hovered ? "#22d3ee" : "#000000"}
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </RoundedBox>
      <Text
        position={[0, 0, 0.02]}
        fontSize={0.03}
        color={hovered ? "#000" : "white"}
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </group>
  );
}

