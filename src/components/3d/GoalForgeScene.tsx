"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface GoalForgeSceneProps {
  interactive?: boolean;
}

export function GoalForgeScene({ interactive = true }: GoalForgeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState<"forge" | "velocity" | "recovery">("forge");
  const [isHovered, setIsHovered] = useState(false);

  // References to communicate state into the animation loop
  const modeRef = useRef(activeMode);
  modeRef.current = activeMode;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070a12, 0.04);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Group for the entire 3D forge assembly
    const forgeGroup = new THREE.Group();
    scene.add(forgeGroup);

    // 1. Inner Core (Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(1.3, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    forgeGroup.add(coreMesh);

    // 1b. Inner Glow Sphere
    const glowGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.6,
      wireframe: false,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    forgeGroup.add(glowMesh);

    // 2. Outer Faceted Cage (Octahedron)
    const cageGeo = new THREE.OctahedronGeometry(2.1, 0);
    const cageMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    forgeGroup.add(cageMesh);

    // 3. Orbital Ring 1 (Torus)
    const ring1Geo = new THREE.TorusGeometry(2.4, 0.02, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.7,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    forgeGroup.add(ring1);

    // 4. Orbital Ring 2 (Torus)
    const ring2Geo = new THREE.TorusGeometry(2.8, 0.025, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.6,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 4;
    forgeGroup.add(ring2);

    // 5. Orbiting Milestone Nodes (Satellites)
    const satellites: Array<{ mesh: THREE.Mesh; orbitRadius: number; speed: number; angle: number; yOffset: number }> = [];
    const colors = [0x10b981, 0x6366f1, 0xf59e0b, 0x38bdf8];

    for (let i = 0; i < 4; i++) {
      const satGeo = new THREE.DodecahedronGeometry(0.18, 0);
      const satMat = new THREE.MeshStandardMaterial({
        color: colors[i],
        emissive: colors[i],
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.7,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      forgeGroup.add(satMesh);
      satellites.push({
        mesh: satMesh,
        orbitRadius: 2.1 + i * 0.45,
        speed: 0.6 + i * 0.25,
        angle: (i * Math.PI) / 2,
        yOffset: Math.sin(i) * 0.5,
      });
    }

    // 6. Particle Field (Stars / Velocity Points)
    const particleCount = 700;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x6366f1);
    const c2 = new THREE.Color(0x10b981);
    const c3 = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 18;
      positions[i + 1] = (Math.random() - 0.5) * 14;
      positions[i + 2] = (Math.random() - 0.5) * 14;

      const mixed = Math.random() < 0.4 ? c1 : Math.random() < 0.7 ? c2 : c3;
      particleColors[i] = mixed.r;
      particleColors[i + 1] = mixed.g;
      particleColors[i + 2] = mixed.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 3, 20);
    pointLight1.position.set(4, 4, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x10b981, 2.5, 20);
    pointLight2.position.set(-4, -3, 3);
    scene.add(pointLight2);

    // Mouse & Touch Tracking
    let targetRotX = 0;
    let targetRotY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x * 0.8;
      mouseY = y * 0.8;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousPointerX = e.touches[0].clientX;
        previousPointerY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousPointerX;
      const deltaY = e.touches[0].clientY - previousPointerY;
      previousPointerX = e.touches[0].clientX;
      previousPointerY = e.touches[0].clientY;

      targetRotY += deltaX * 0.008;
      targetRotX += deltaY * 0.008;
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    if (interactive) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("touchstart", handleTouchStart, { passive: true });
      container.addEventListener("touchmove", handleTouchMove, { passive: true });
      container.addEventListener("touchend", handleTouchEnd);
    }

    // Resize Observer
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      // Adjust camera distance for mobile screens
      if (container.clientWidth < 640) {
        camera.position.z = 8.5;
      } else if (container.clientWidth < 1024) {
        camera.position.z = 7.5;
      } else {
        camera.position.z = 6.8;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Adjust colors & speed based on mode
      const currentMode = modeRef.current;
      let speedMultiplier = 1;

      if (currentMode === "velocity") {
        speedMultiplier = 2.2;
        glowMat.color.setHex(0x10b981);
        coreMat.color.setHex(0x10b981);
        ring2Mat.opacity = 0.9;
      } else if (currentMode === "recovery") {
        speedMultiplier = 0.6;
        glowMat.color.setHex(0xf59e0b);
        coreMat.color.setHex(0xf59e0b);
        ring1Mat.color.setHex(0xf59e0b);
      } else {
        speedMultiplier = 1;
        glowMat.color.setHex(0x10b981);
        coreMat.color.setHex(0x6366f1);
        ring1Mat.color.setHex(0x6366f1);
      }

      // Rotation of Core & Rings
      coreMesh.rotation.x += 0.005 * speedMultiplier;
      coreMesh.rotation.y += 0.008 * speedMultiplier;

      cageMesh.rotation.x -= 0.003 * speedMultiplier;
      cageMesh.rotation.y += 0.005 * speedMultiplier;

      ring1.rotation.z += 0.012 * speedMultiplier;
      ring2.rotation.z -= 0.009 * speedMultiplier;

      // Glow Pulse
      const pulse = 0.85 + Math.sin(elapsedTime * 2.5 * speedMultiplier) * 0.15;
      glowMesh.scale.set(pulse, pulse, pulse);

      // Orbit Satellites
      satellites.forEach((sat) => {
        sat.angle += 0.02 * sat.speed * speedMultiplier;
        sat.mesh.position.x = Math.cos(sat.angle) * sat.orbitRadius;
        sat.mesh.position.z = Math.sin(sat.angle) * sat.orbitRadius;
        sat.mesh.position.y = Math.sin(elapsedTime * 1.5 + sat.orbitRadius) * 0.6;
        sat.mesh.rotation.x += 0.02;
        sat.mesh.rotation.y += 0.03;
      });

      // Particle Drift
      particlePoints.rotation.y = elapsedTime * 0.02 * speedMultiplier;
      particlePoints.rotation.x = Math.sin(elapsedTime * 0.015) * 0.05;

      // Smooth Mouse / Touch Interpolation
      if (!isDragging) {
        targetRotY += (mouseX - targetRotY) * 0.05;
        targetRotX += (mouseY - targetRotX) * 0.05;
      }

      forgeGroup.rotation.y += (targetRotY - forgeGroup.rotation.y) * 0.08;
      forgeGroup.rotation.x += (targetRotX - forgeGroup.rotation.x) * 0.08;

      // Subtle breathing float
      forgeGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handleTouchEnd);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div
      ref={mountRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-full min-h-[380px] sm:min-h-[500px] lg:min-h-[620px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
    >
      {/* 3D Mode Selector Pills embedded at the base of the canvas */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 shadow-xl">
        <button
          type="button"
          onClick={() => setActiveMode("forge")}
          className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-all ${
            activeMode === "forge"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          🌀 Forge Core
        </button>
        <button
          type="button"
          onClick={() => setActiveMode("velocity")}
          className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-all ${
            activeMode === "velocity"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          ⚡ Velocity Stream
        </button>
        <button
          type="button"
          onClick={() => setActiveMode("recovery")}
          className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-all ${
            activeMode === "recovery"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          🛡️ Recovery Shield
        </button>
      </div>

      {/* Floating 3D HUD Micro-Indicators */}
      <div className="absolute top-6 left-6 pointer-events-none hidden sm:flex flex-col gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-950/60 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-white font-semibold">3D ENGINE ACTIVE</span>
        </div>
        <span>Mode: <strong className="text-indigo-400 uppercase">{activeMode}</strong></span>
        <span>Drag to rotate • 60 FPS WebGL</span>
      </div>
    </div>
  );
}
