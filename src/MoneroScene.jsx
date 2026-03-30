import { useEffect, useRef } from "react";
import * as THREE from "three";
import { T } from "./tokens.jsx";

/* ═══════════════════════════════════════════════════════════════
   MoneroScene — High-fidelity 3D network visualization
   Particle nodes orbiting a glowing Monero core
   Connections pulse between nodes = block propagation
   Camera auto-orbits, responds to mouse
═══════════════════════════════════════════════════════════════ */

export default function MoneroScene({ height = 320, hashrate = 0, difficulty = 0 }) {
  const mount = useRef(null);
  const frameId = useRef(null);

  useEffect(() => {
    if (!mount.current) return;
    const container = mount.current;
    const W = container.clientWidth;
    const H = height;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0E0F18, 0.0015);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000);
    camera.position.set(0, 30, 120);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Core sphere (Monero logo representation)
    const coreGeo = new THREE.IcosahedronGeometry(8, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xFF6600,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Inner glow sphere
    const glowGeo = new THREE.SphereGeometry(6, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xFF6600,
      transparent: true,
      opacity: 0.08,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glow);

    // Ring signature visualization (3 torus rings)
    const ringColors = [0xFF6600, 0x00D395, 0x4A9EFF];
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(14 + i * 6, 0.15, 8, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColors[i],
        transparent: true,
        opacity: 0.15 - i * 0.03,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2 + (i - 1) * 0.3;
      ring.rotation.y = i * 0.5;
      scene.add(ring);
      rings.push(ring);
    }

    // Miner nodes (particles)
    const NODE_COUNT = 80;
    const nodePositions = new Float32Array(NODE_COUNT * 3);
    const nodeSpeeds = [];
    const nodeRadii = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      const radius = 30 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;

      nodePositions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      nodePositions[i * 3 + 1] = radius * Math.sin(phi) * 0.6;
      nodePositions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      nodeSpeeds.push(0.0003 + Math.random() * 0.001);
      nodeRadii.push(radius);
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));

    const nodeMat = new THREE.PointsMaterial({
      color: 0xFF8840,
      size: 1.8,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });
    const nodes = new THREE.Points(nodeGeo, nodeMat);
    scene.add(nodes);

    // Connection lines (block propagation visualization)
    const CONNECTION_COUNT = 30;
    const connGeo = new THREE.BufferGeometry();
    const connPositions = new Float32Array(CONNECTION_COUNT * 6); // 2 pts per line
    connGeo.setAttribute("position", new THREE.BufferAttribute(connPositions, 3));
    const connMat = new THREE.LineBasicMaterial({
      color: 0xFF6600,
      transparent: true,
      opacity: 0.08,
    });
    const connections = new THREE.LineSegments(connGeo, connMat);
    scene.add(connections);

    // Background dust particles
    const dustCount = 200;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 300;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 200;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 300;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x4A9EFF,
      size: 0.4,
      transparent: true,
      opacity: 0.25,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // Mouse tracking
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / W - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / H - 0.5) * 2;
    };
    container.addEventListener("mousemove", onMouseMove);

    // Animation loop
    let time = 0;
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      time += 0.008;

      // Core rotation + pulse
      core.rotation.x = time * 0.15;
      core.rotation.y = time * 0.2;
      const pulse = 1 + Math.sin(time * 2) * 0.05;
      core.scale.setScalar(pulse);
      glow.scale.setScalar(pulse * 1.1);
      glowMat.opacity = 0.06 + Math.sin(time * 1.5) * 0.03;

      // Ring rotation
      rings.forEach((r, i) => {
        r.rotation.x += 0.001 * (i + 1);
        r.rotation.z += 0.0005 * (3 - i);
      });

      // Orbit nodes
      const pos = nodeGeo.attributes.position.array;
      for (let i = 0; i < NODE_COUNT; i++) {
        const angle = time * nodeSpeeds[i] * 60;
        const r = nodeRadii[i];
        const baseY = pos[i * 3 + 1];
        pos[i * 3] = r * Math.cos(angle + i);
        pos[i * 3 + 2] = r * Math.sin(angle + i);
        pos[i * 3 + 1] = baseY + Math.sin(time + i) * 2;
      }
      nodeGeo.attributes.position.needsUpdate = true;

      // Update connections
      const cp = connGeo.attributes.position.array;
      for (let c = 0; c < CONNECTION_COUNT; c++) {
        const i = Math.floor(Math.abs(Math.sin(time * 0.3 + c * 7)) * NODE_COUNT);
        const j = Math.floor(Math.abs(Math.cos(time * 0.2 + c * 13)) * NODE_COUNT);
        cp[c * 6] = pos[i * 3];
        cp[c * 6 + 1] = pos[i * 3 + 1];
        cp[c * 6 + 2] = pos[i * 3 + 2];
        cp[c * 6 + 3] = pos[j * 3];
        cp[c * 6 + 4] = pos[j * 3 + 1];
        cp[c * 6 + 5] = pos[j * 3 + 2];
      }
      connGeo.attributes.position.needsUpdate = true;
      connMat.opacity = 0.05 + Math.sin(time) * 0.03;

      // Dust rotation
      dust.rotation.y = time * 0.02;

      // Camera orbit + mouse influence
      const camAngle = time * 0.1;
      camera.position.x = Math.sin(camAngle) * 100 + mouseX * 20;
      camera.position.z = Math.cos(camAngle) * 100;
      camera.position.y = 25 + mouseY * -15 + Math.sin(time * 0.3) * 5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const w = container.clientWidth;
      camera.aspect = w / H;
      camera.updateProjectionMatrix();
      renderer.setSize(w, H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId.current);
      container.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose(); coreMat.dispose();
      glowGeo.dispose(); glowMat.dispose();
      nodeGeo.dispose(); nodeMat.dispose();
      connGeo.dispose(); connMat.dispose();
      dustGeo.dispose(); dustMat.dispose();
      rings.forEach(r => { r.geometry.dispose(); r.material.dispose(); });
    };
  }, [height]);

  return (
    <div
      ref={mount}
      style={{
        width: "100%",
        height,
        borderRadius: T.r.lg,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Overlay labels */}
      <div style={{
        position: "absolute", bottom: 12, left: 16, zIndex: 2,
        fontFamily: T.mono, fontSize: 9, color: T.t4, letterSpacing: 1.5,
        textTransform: "uppercase", pointerEvents: "none",
      }}>
        Monero network / ring signature topology
      </div>
      <div style={{
        position: "absolute", bottom: 12, right: 16, zIndex: 2,
        fontFamily: T.mono, fontSize: 9, color: T.t4, pointerEvents: "none",
      }}>
        {hashrate > 0 ? fmt.hash(hashrate) + " global" : "Loading..."}
      </div>
    </div>
  );
}
