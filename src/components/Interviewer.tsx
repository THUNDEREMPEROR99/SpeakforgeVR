/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Float } from '@react-three/drei';
import { useInterviewStore } from '../store';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export default function Interviewer() {
  const { status } = useInterviewStore();
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Smooth idle breathing/sway
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 0.4) * 0.05;
      headRef.current.rotation.z = Math.cos(t * 0.3) * 0.03;
      
      // Reactive lip sync simulation when speaking
      if (status === 'questioning') {
         headRef.current.position.y = 1.8 + Math.sin(t * 12) * 0.005;
      }
    }

    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.position.y = 1.3 + Math.sin(t * 0.5) * 0.01;
      rightArmRef.current.position.y = 1.3 + Math.sin(t * 0.5) * 0.01;
    }
  });

  return (
    <group position={[0, -0.4, -2.5]}>
      {/* Lower Body (sitting) */}
      <group position={[0, 0.4, 0.4]}>
        <mesh position={[0.2, 0, 0.2]} rotation={[Math.PI / 2.5, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.5, 4, 16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[-0.2, 0, 0.2]} rotation={[Math.PI / 2.5, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.5, 4, 16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Torso */}
      <group position={[0, 1.1, 0]}>
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.22, 0.6, 4, 16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        
        {/* Shirt / Tie Detail */}
        <mesh position={[0, 0.2, 0.15]}>
           <planeGeometry args={[0.12, 0.25]} />
           <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.15, 0.16]}>
           <boxGeometry args={[0.03, 0.18, 0.01]} />
           <meshStandardMaterial color="#991b1b" />
        </mesh>
      </group>
      
      {/* Head with Smooth Features */}
      <group ref={headRef} position={[0, 1.8, 0]}>
        <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.05}>
          <group>
            <mesh>
              <sphereGeometry args={[0.16, 64, 64]} />
              <meshStandardMaterial color="#fbbf24" roughness={0.6} />
            </mesh>
            
            {/* Eyes */}
            <group position={[0, 0.02, 0.12]}>
              <mesh position={[0.06, 0.02, 0.03]}>
                <sphereGeometry args={[0.02, 16, 16]} />
                <meshStandardMaterial color="#020617" />
              </mesh>
              <mesh position={[-0.06, 0.02, 0.03]}>
                <sphereGeometry args={[0.02, 16, 16]} />
                <meshStandardMaterial color="#020617" />
              </mesh>
            </group>

            {/* Hair */}
            <mesh position={[0, 0.08, -0.05]}>
               <sphereGeometry args={[0.17, 32, 32]} />
               <meshStandardMaterial color="#451a03" />
            </mesh>
          </group>
        </Float>
      </group>

      {/* Arms resting on desk */}
      <group ref={leftArmRef} position={[-0.3, 1.3, 0.1]}>
        <mesh rotation={[Math.PI / 1.5, 0, 0.2]}>
           <capsuleGeometry args={[0.06, 0.4, 4, 12]} />
           <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.3, 1.3, 0.1]}>
        <mesh rotation={[Math.PI / 1.5, 0, -0.2]}>
           <capsuleGeometry args={[0.06, 0.4, 4, 12]} />
           <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    </group>
  );
}

