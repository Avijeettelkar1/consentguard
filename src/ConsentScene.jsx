import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ConsentScene({ tone = "ready", loading = false }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.25, 9.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const colorMap = {
      ready: 0x2f80ed,
      good: 0x10b981,
      warn: 0xf59e0b,
      bad: 0xef4444,
    };
    const accent = colorMap[tone] || colorMap.ready;

    const group = new THREE.Group();
    group.scale.setScalar(0.72);
    group.position.set(0, 0.28, 0);
    scene.add(group);

    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: accent,
      metalness: 0.16,
      roughness: 0.28,
      transmission: 0.08,
      thickness: 0.8,
      clearcoat: 0.65,
      clearcoatRoughness: 0.2,
      emissive: accent,
      emissiveIntensity: 0.18,
    });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.12, 1), coreMaterial);
    group.add(core);

    const inner = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.48, 0),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.05,
        roughness: 0.18,
        transparent: true,
        opacity: 0.85,
      }),
    );
    group.add(inner);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xdbeafe,
      transparent: true,
      opacity: 0.55,
    });

    const rings = [1.55, 2.05, 2.55].map((radius, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.012, 12, 132), ringMaterial.clone());
      ring.rotation.x = Math.PI / 2.4 + index * 0.32;
      ring.rotation.y = index * 0.55;
      ring.material.opacity = 0.5 - index * 0.08;
      group.add(ring);
      return ring;
    });

    const particleCount = 120;
    const positions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 1.9 + Math.random() * 1.35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.62;
      positions[index * 3 + 2] = radius * Math.cos(phi);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0xbfd7ff,
        size: 0.035,
        transparent: true,
        opacity: 0.78,
      }),
    );
    group.add(particles);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(1.55, 48, 48),
      new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.12,
      }),
    );
    group.add(glow);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
    keyLight.position.set(4, 4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(accent, 14, 10);
    rimLight.position.set(-3, -2, 4);
    scene.add(rimLight);

    let frameId = 0;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const clock = new THREE.Clock();

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const speed = loading ? 1.25 : 0.65;
      if (!reducedMotion) {
        group.rotation.y = elapsed * 0.18 * speed;
        core.rotation.x = elapsed * 0.23 * speed;
        core.rotation.y = elapsed * 0.34 * speed;
        inner.rotation.y = -elapsed * 0.68 * speed;
        glow.scale.setScalar(1 + Math.sin(elapsed * 1.8) * 0.04);
        particles.rotation.y = elapsed * 0.07 * speed;
        rings.forEach((ring, index) => {
          ring.rotation.z = elapsed * (0.13 + index * 0.04) * speed;
          ring.rotation.x += 0.0015 * (index + 1);
        });
      }
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      mount.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
          else object.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [tone, loading]);

  return (
    <div className="three-card">
      <div className="three-canvas" ref={mountRef} />
      <div className="scene-badge top">Consent signal</div>
      <div className="scene-badge right">Browser sandbox</div>
      <div className="scene-caption">
        <strong>3D scan graph</strong>
        <span>Daytona opens an isolated browser and maps consent evidence into this live graph.</span>
      </div>
    </div>
  );
}
