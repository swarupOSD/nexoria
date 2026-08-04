import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles, OrbitControls } from '@react-three/drei';

const AbstractShape = () => {
  const coreRef = useRef();
  const wireframeRef = useRef();
  
  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.2;
      coreRef.current.rotation.y += delta * 0.3;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.x -= delta * 0.1;
      wireframeRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={1.5} floatIntensity={3}>
      {/* Inner Core */}
      <mesh ref={coreRef} scale={2.8}>
        <icosahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color="#7C3AED"
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.9}
          roughness={0.1}
          distort={0.4}
          speed={3}
          emissive="#7C3AED"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Outer wireframe for cyberpunk feel */}
      <mesh ref={wireframeRef} scale={3.4}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#38BDF8"
          wireframe
          transparent
          opacity={0.5}
          emissive="#38BDF8"
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
};

const Hero3DObject = () => {
  return (
    <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[800px] h-[800px] z-10 opacity-90 cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#F43F5E" />
        <directionalLight position={[-10, -10, -5]} intensity={2} color="#38BDF8" />
        
        <AbstractShape />
        
        <Sparkles count={150} scale={12} size={3} speed={0.4} opacity={0.6} color="#A78BFA" />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default Hero3DObject;
