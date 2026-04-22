/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

export default function Environment() {
  const spotTarget = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(0, 0.75, -1);
    return obj;
  }, []);

  return (
    <group>
      <primitive object={spotTarget} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      <spotLight 
        position={[0, 4, -1]} 
        angle={0.4} 
        penumbra={1} 
        intensity={3} 
        castShadow 
        target={spotTarget}
      />

      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2.5, -5]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[5, 2.5, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[-5, 2.5, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation-x={Math.PI / 2} position={[0, 5, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#020617" />
      </mesh>

      {/* Table */}
      <group position={[0, 0.75, -1]}>
        <RoundedBox args={[1.6, 0.05, 0.9]} radius={0.02} smoothness={4} castShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.8} />
        </RoundedBox>
        
        {/* Desk items */}
        <mesh position={[0.4, 0.03, 0.1]} rotation-y={-0.2}>
           <boxGeometry args={[0.3, 0.01, 0.2]} />
           <meshStandardMaterial color="#64748b" />
           <mesh position={[0, 0.1, -0.1]} rotation-x={1.1}>
              <boxGeometry args={[0.3, 0.01, 0.2]} />
              <meshStandardMaterial color="#1e293b" />
           </mesh>
        </mesh>

        <mesh position={[-0.4, 0.05, 0.2]}>
           <cylinderGeometry args={[0.04, 0.04, 0.1]} />
           <meshStandardMaterial color="#f8fafc" />
        </mesh>

        <mesh position={[0, 0.03, 0.2]} rotation-z={0.1}>
           <boxGeometry args={[0.15, 0.005, 0.2]} />
           <meshStandardMaterial color="#fffbeb" />
        </mesh>

        {/* Legs */}
        {[ [0.7, 0.35], [-0.7, 0.35], [0.7, -0.35], [-0.7, -0.35] ].map((pos, i) => (
          <mesh key={i} position={[pos[0], -0.375, pos[1]]}>
            <cylinderGeometry args={[0.03, 0.03, 0.75]} />
            <meshStandardMaterial color="#000" />
          </mesh>
        ))}
      </group>

      {/* Chairs */}
      <Chair position={[0, 0.45, -1.7]} rotation={[0, 0, 0]} color="#020617" />
      <Chair position={[0, 0.45, 0.6]} rotation={[0, Math.PI, 0]} color="#020617" />

      {/* Accents */}
      <mesh position={[-4.9, 3, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[4, 2]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

function Chair({ position, rotation, color }: { position: [number, number, number], rotation: [number, number, number], color: string }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[0.5, 0.1, 0.5]} radius={0.05}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      <RoundedBox args={[0.5, 0.6, 0.1]} position={[0, 0.35, -0.2]} radius={0.05}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      <mesh position={[0, -0.225, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.45]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}
