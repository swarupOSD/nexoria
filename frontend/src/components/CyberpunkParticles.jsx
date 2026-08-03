import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

const ParticleField = () => {
  const ref = useRef();
  
  // Generate random points in a sphere around the camera
  const sphere = useMemo(() => {
    // 3000 particles is a good balance of density and performance
    const count = 3000;
    const points = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 1.0 + Math.random() * 2.0; // random radius
      
      points[i * 3] = r * Math.sin(phi) * Math.cos(theta);     // x
      points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); // y
      points[i * 3 + 2] = r * Math.cos(phi);                   // z
    }
    return points;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      // Gentle, slow rotation
      ref.current.rotation.x -= delta / 20;
      ref.current.rotation.y -= delta / 25;
      
      // Floating wave effect
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial 
          transparent 
          color="#a855f7" // Purple tint matching Nexoria brand
          size={0.012} 
          sizeAttenuation={true} 
          depthWrite={false} 
          opacity={0.8}
        />
      </Points>
    </group>
  );
};

const CyberpunkParticles = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // On mobile, we avoid WebGL to save battery, but we can fallback to CSS later if needed.
  if (isMobile) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[-1] hidden md:block"
      style={{
        background: 'radial-gradient(circle at center, #0F172A 0%, #020617 100%)' // Deep space gradient
      }}
    >
      <Canvas camera={{ position: [0, 0, 1] }}>
        <ParticleField />
      </Canvas>
    </div>
  );
};

export default CyberpunkParticles;
