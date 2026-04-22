/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canvas } from '@react-three/fiber';
import { XR, createXRStore, XROrigin } from '@react-three/xr';
import * as THREE from 'three';
import { useState, Suspense } from 'react';
import Environment from './components/Environment';
import Interviewer from './components/Interviewer';
import VRUI from './components/VRUI';
import { Loader, OrbitControls } from '@react-three/drei';

const store = createXRStore({
  hand: true,
  controller: true,
});

export default function App() {
  const [simulationMode, setSimulationMode] = useState<'vr' | 'desktop' | 'none'>('none');
  const [xrEnabled, setXrEnabled] = useState(false);
  const [error, setError] = useState<{ message: string; action?: string } | null>(null);

  const handleEnterVR = async () => {
    try {
      setError(null);
      if (!navigator.xr) {
        throw new Error("WebXR API not found in this browser.");
      }
      
      const isVRSupported = await navigator.xr.isSessionSupported('immersive-vr');
      if (!isVRSupported) {
        setError({
          message: "VR session not supported in this window.",
          action: "Open in New Tab"
        });
        return;
      }

      await store.enterVR();
      setSimulationMode('vr');
    } catch (e) {
      console.error("XR Error:", e);
      setError({ message: "Failed to connect to VR hardware. Check your link/AirLink status." });
    }
  };

  const startDesktopSim = () => {
    setError(null);
    setSimulationMode('desktop');
  };

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const exitSimulation = () => {
    setSimulationMode('none');
  };

  return (
    <div className="w-full h-screen bg-immersive-bg immersive-bg overflow-hidden flex flex-col items-center justify-center relative font-sans">
      {/* Enhanced Error / Notice Toast */}
      {error && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 glass-panel px-8 py-4 rounded-2xl border-cyan-400/30 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <p className="text-cyan-100 text-sm font-medium tracking-wide text-center">
            {error.message}
          </p>
          {error.action && (
            <button 
              onClick={openInNewTab}
              className="px-4 py-2 bg-cyan-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-white transition-colors"
            >
              {error.action}
            </button>
          )}
        </div>
      )}

      {/* 3D Canvas - Always rendered in the background */}
      <div className="absolute inset-0 z-0">
        <Canvas 
          shadows={{ type: THREE.PCFShadowMap }}
          camera={{ position: [0, 1.4, 0.5], fov: 65 }}
          onPointerDown={(e) => {
            if (simulationMode === 'desktop') e.stopPropagation();
          }}
        >
          <Suspense fallback={null}>
            {simulationMode === 'vr' ? (
              <XR store={store}>
                <XROrigin position={[0, 0, 0]} />
                <SceneContent onExit={exitSimulation} />
              </XR>
            ) : (
              <>
                {simulationMode === 'desktop' && (
                  <OrbitControls 
                    target={[0, 1.2, -1.5]} 
                    enablePan={false} 
                    maxDistance={2.5} 
                    minDistance={0.5} 
                    maxPolarAngle={Math.PI / 1.5}
                    minPolarAngle={Math.PI / 3}
                  />
                )}
                <SceneContent onExit={exitSimulation} />
              </>
            )}
          </Suspense>
        </Canvas>
      </div>

      {/* Immersive Reticle */}
      {(simulationMode === 'none' || simulationMode === 'desktop') && (
        <div className="reticle pointer-events-none w-6 h-6 border-2 border-white/20 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-0.5 h-0.5 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      )}

      {/* 2D Overlay / Main Menu */}
      {simulationMode === 'none' && (
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-8 md:p-12">
          <header className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="text-[10px] uppercase tracking-widest-extra text-cyan-400 font-bold mb-1">SpeakForgeVR Engine</div>
              <h1 className="text-3xl font-light tracking-tight text-white uppercase">
                SPEAKFORGE <span className="font-bold">VR</span>
              </h1>
            </div>
            <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <span className="text-xs font-mono uppercase tracking-widest text-slate-300">CORE_SYSTEM: STABLE</span>
            </div>
          </header>

          <main className="flex-grow flex items-center justify-center">
            <div className="max-w-xl text-center space-y-8">
              <div className="glass-panel p-10 rounded-[32px] border-t-2 border-t-cyan-500/50 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-400/60 mb-6 font-semibold">Simulation Module: HR SIM</div>
                <h2 className="text-5xl font-medium text-white glow-text mb-6">Forge Your Future</h2>
                <p className="text-slate-400 text-lg font-light leading-relaxed mb-8">
                  Step into an AI-driven interview environment. 
                  Practice with high-fidelity characters and receive real-time neural feedback.
                </p>
                <div className="flex flex-col items-center gap-4 relative z-10">
                  <button
                    onClick={handleEnterVR}
                    className="w-full px-10 py-5 bg-white text-black font-bold text-sm uppercase tracking-[0.2em] rounded-xl hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95 shadow-xl cursor-all-scroll"
                  >
                    Initiate VR Link
                  </button>
                  <button
                    onClick={startDesktopSim}
                    className="w-full px-10 py-4 glass-panel text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 transition-all border border-white/10"
                  >
                    Desktop Simulation Mode
                  </button>

                  <div className="w-full h-px bg-white/5 my-2"></div>

                  <button
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="w-full px-10 py-3 bg-cyan-950/30 text-cyan-400 font-bold text-[9px] uppercase tracking-[0.2em] rounded-xl border border-cyan-500/30 hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    Bypass Sandbox (Fix Microphone)
                  </button>
                </div>
              </div>
            </div>
          </main>

          <footer className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
             <div className="glass-panel p-5 rounded-2xl hidden md:block">
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 font-semibold text-left">Hardware detected</div>
              <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-sm bg-cyan-400/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                 </div>
                 <span className="text-xs text-slate-300 uppercase font-mono">Meta Quest 3 / Vision Pro Support</span>
              </div>
            </div>
          </footer>
        </div>
      )}
      <Loader />
    </div>
  );
}

function SceneContent({ onExit }: { onExit: () => void }) {
  return (
    <>
      <Environment />
      <Interviewer />
      <VRUI onExit={onExit} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      <pointLight position={[-2, 2, -1]} intensity={0.5} color="#22d3ee" />
    </>
  );
}

