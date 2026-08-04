import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField = () => {
  const ref = useRef();
  const { mouse } = useThree();
  
  // Generate random points in a sphere around the camera
  const sphere = useMemo(() => {
    // Increased particle count for WOW effect
    const count = 5000;
    const points = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 1.0 + Math.random() * 4.0; // wider spread
      
      points[i * 3] = r * Math.sin(phi) * Math.cos(theta);     // x
      points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); // y
      points[i * 3 + 2] = r * Math.cos(phi);                   // z
    }
    return points;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      // Gentle, slow auto-rotation
      ref.current.rotation.x -= delta / 20;
      ref.current.rotation.y -= delta / 25;
      
      // Mouse Parallax effect! Makes the background feel genuinely 3D.
      // Lerp the rotation towards the mouse position for smooth trailing effect.
      const targetX = (mouse.y * Math.PI) / 4;
      const targetY = (mouse.x * Math.PI) / 4;
      
      ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetX, 0.05);
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetY, 0.05);

      // Floating wave effect
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial 
          transparent 
          color="#A855F7" // Purple neon
          size={0.015} // slightly larger
          sizeAttenuation={true} 
          depthWrite={false} 
          opacity={0.9}
        />
      </Points>
    </group>
  );
};

const CyberpunkParticles = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[-1]"
      style={{
        background: 'radial-gradient(circle at center, #0F172A 0%, #020617 100%)' // Deep space gradient
      }}
    >
      <Canvas camera={{ position: [0, 0, 1] }} gl={{ alpha: false, antialias: true }}>
        <ParticleField />
      </Canvas>
    </div>
  );
};

export default CyberpunkParticles;
