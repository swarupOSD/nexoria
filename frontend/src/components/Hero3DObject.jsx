import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, Sparkles } from '@react-three/drei';

const AbstractShape = () => {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={1.5} floatIntensity={3}>
      <mesh ref={meshRef} scale={1.8}>
        <icosahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color="#7C3AED"
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.8}
          roughness={0.2}
          distort={0.4}
          speed={3}
        />
      </mesh>
      {/* Outer wireframe for cyberpunk feel */}
      <mesh ref={meshRef} scale={2.2}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#A78BFA"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </Float>
  );
};

const Hero3DObject = () => {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none z-10 opacity-70">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#F43F5E" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#38BDF8" />
        
        <AbstractShape />
        
        <Sparkles count={100} scale={8} size={2} speed={0.4} opacity={0.5} color="#A78BFA" />
      </Canvas>
    </div>
  );
};

export default Hero3DObject;
