import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { ShieldCheck } from 'lucide-react';

const NexoriaHero = () => {
  const containerRef = useRef(null);
  const shaderCanvasRef = useRef(null);
  const threeContainerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  // Animation control refs
  const shaderLoopRef = useRef(null);
  const threeLoopRef = useRef(null);
  const isVisibleRef = useRef(true);

  // Intersection Observer to track visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Shader Animation Logic (Init once)
  useEffect(() => {
    const canvas = shaderCanvasRef.current;
    if (!canvas) return;

    let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    let animationFrameId;

    const syncSize = () => {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 mouse = u_mouse / u_resolution;
    
    // Create a flowing, deep digital nebula
    float n = snoise(uv * 3.0 + u_time * 0.1);
    n += 0.5 * snoise(uv * 6.0 - u_time * 0.15);
    
    // Core colors: Deep Violet, Electric Blue, Subtle Cyan
    vec3 color1 = vec3(0.05, 0.02, 0.1); // Deep Shadow
    vec3 color2 = vec3(0.2, 0.1, 0.4);  // Violet
    vec3 color3 = vec3(0.0, 0.3, 0.6);  // Blue
    
    vec3 color = mix(color1, color2, n * 0.5 + 0.5);
    color = mix(color, color3, pow(max(0.0, 1.0 - length(uv - 0.5 - (mouse - 0.5) * 0.2)), 3.0) * 0.3);
    
    // Add subtle 'data' glints
    float glint = step(0.995, fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453 + u_time * 0.5));
    color += glint * 0.1 * vec3(0.7, 0.8, 1.0);
    
    gl_FragColor = vec4(color, 1.0);
}
`;

    function cs(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    
    // Throttled mouse move
    let lastMouseMove = 0;
    const handleMouseMove = (event) => {
      const now = Date.now();
      if (now - lastMouseMove < 16) return; // ~60fps throttle
      lastMouseMove = now;
      
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const startTime = Date.now();
    let isRendering = false;

    const render = () => {
      if (!isRendering) return;
      if (typeof ResizeObserver === 'undefined') syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      const t = Date.now() - startTime;
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    shaderLoopRef.current = {
      start: () => {
        if (!isRendering) {
          isRendering = true;
          render();
        }
      },
      stop: () => {
        isRendering = false;
        cancelAnimationFrame(animationFrameId);
      }
    };

    // Initial start if visible
    if (isVisibleRef.current) {
      shaderLoopRef.current.start();
    }

    return () => {
      shaderLoopRef.current.stop();
      window.removeEventListener('mousemove', handleMouseMove);
      if (resizeObserver) resizeObserver.disconnect();
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    };
  }, []); // Run only once

  // Three.js Animation Logic (Init once)
  useEffect(() => {
    const container = threeContainerRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    
    const isMobile = window.innerWidth <= 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2); // Limit pixel ratio for performance

    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x8B5CF6, 2);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const sphereGeom = new THREE.SphereGeometry(isMobile ? 1.5 : 2, isMobile ? 32 : 64, isMobile ? 32 : 64);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });
    const coreSphere = new THREE.Mesh(sphereGeom, sphereMat);
    coreGroup.add(coreSphere);

    const ringGeom = new THREE.TorusGeometry(isMobile ? 2.2 : 3, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x06B6D4, transparent: true, opacity: 0.5 });
    const ring1 = new THREE.Mesh(ringGeom, ringMat);
    coreGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeom, ringMat);
    ring2.rotation.x = Math.PI / 2;
    coreGroup.add(ring2);

    let particleMesh = null;
    if (!prefersReducedMotion) {
      const particlesGeom = new THREE.BufferGeometry();
      const particlesCount = isMobile ? 100 : 300; // Reduced for performance
      const posArray = new Float32Array(particlesCount * 3);
      for(let i=0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15;
      }
      particlesGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const particlesMat = new THREE.PointsMaterial({ size: 0.02, color: 0xffffff, transparent: true, opacity: 0.8 });
      particleMesh = new THREE.Points(particlesGeom, particlesMat);
      scene.add(particleMesh);
    }

    camera.position.z = 8;
    const mouse = new THREE.Vector2();

    // Throttled mouse move for Three.js
    let lastMouseMove = 0;
    const handleMouseMove = (event) => {
      const now = Date.now();
      if (now - lastMouseMove < 16) return;
      lastMouseMove = now;
      
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    if (!prefersReducedMotion && !isMobile) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    let animationFrameId;
    let isRendering = false;

    const animate = () => {
      if (!isRendering) return;
      animationFrameId = requestAnimationFrame(animate);
      
      if (!prefersReducedMotion) {
        coreGroup.rotation.y += 0.005;
        coreGroup.rotation.x += 0.002;
        ring1.rotation.z += 0.01;
        ring2.rotation.y += 0.01;
        
        if (particleMesh) {
          particleMesh.rotation.y += 0.001;
        }
        
        if (!isMobile) {
          coreGroup.position.x += (mouse.x * 0.5 - coreGroup.position.x) * 0.05;
          coreGroup.position.y += (mouse.y * 0.5 - coreGroup.position.y) * 0.05;
        }
      }
      renderer.render(scene, camera);
    };

    threeLoopRef.current = {
      start: () => {
        if (!isRendering) {
          isRendering = true;
          animate();
        }
      },
      stop: () => {
        isRendering = false;
        cancelAnimationFrame(animationFrameId);
      }
    };

    // Initial start if visible
    if (isVisibleRef.current) {
      threeLoopRef.current.start();
    }

    return () => {
      threeLoopRef.current.stop();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      // Proper disposal
      renderer.dispose();
      sphereGeom.dispose();
      sphereMat.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      if (particleMesh) {
        particleMesh.geometry.dispose();
        particleMesh.material.dispose();
      }
    };
  }, []); // Run only once

  // React to visibility changes
  useEffect(() => {
    if (isVisible) {
      shaderLoopRef.current?.start();
      threeLoopRef.current?.start();
    } else {
      shaderLoopRef.current?.stop();
      threeLoopRef.current?.stop();
    }
  }, [isVisible]);

  const handleScrollToGrid = () => {
    const el = document.getElementById('nexus-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header ref={containerRef} className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Shader Background */}
      <div className="absolute inset-0 w-full h-full opacity-60 pointer-events-none">
        <canvas ref={shaderCanvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center justify-center h-full pt-20">
        {/* ThreeJS Holographic Core */}
        <div className="absolute w-full h-[300px] md:w-[600px] md:h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-80 pointer-events-none overflow-hidden">
          <div ref={threeContainerRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>

        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-6 font-bold tracking-tighter">
          YOUR DIGITAL WORLD.<br />ONE NEXUS.
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-10">
          Games. Music. Movies. Apps. Community. One intelligent digital universe.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link to="/apps" className="px-8 py-4 rounded-full font-label-caps text-label-caps tracking-widest text-white shadow-[0_0_20px_rgba(160,120,255,0.3)] hover:brightness-110 transition-all flex justify-center w-full sm:w-auto" style={{ background: 'linear-gradient(135deg, #a078ff 0%, #6d3bd7 100%)' }}>
            ENTER NEXORIA
          </Link>
          <button onClick={handleScrollToGrid} className="px-8 py-4 rounded-full font-label-caps text-label-caps tracking-widest text-on-surface hover:bg-white/10 transition-all border border-white/5 border-t-white/10 border-l-white/10 backdrop-blur-2xl bg-surface/40 flex justify-center w-full sm:w-auto">
            EXPLORE THE NEXUS
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer" onClick={handleScrollToGrid}>
        <span className="material-symbols-outlined text-on-surface-variant opacity-50">expand_more</span>
      </div>
    </header>
  );
};

export default NexoriaHero;
