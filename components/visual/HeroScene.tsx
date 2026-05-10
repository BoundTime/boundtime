"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useRef, useMemo, useEffect, Suspense } from "react";
import * as THREE from "three";

/**
 * Cuckold-konnotierte, FSK-freie Hero-3D-Komposition:
 *
 *  - Hauptmotiv: schwebende Spielkarte "Queen of Spades" (Q\u2660) \u2013 das klassische
 *    Hotwife-/Cuckold-Codesymbol. Elegant, jugendfrei (ist eine Spielkarte),
 *    f\u00fcr Insider sofort eindeutig.
 *  - Sekund\u00e4rmotiv: aufsteigende kleine 3D-Pik-Symbole als atmosph\u00e4rische
 *    Particles in Bronze, Burgund, Wachsrot, Schwarz und Gold.
 *
 * Performant durch InstancedMesh + Canvas-Texturen (kein Asset-Download).
 * ACES Filmic Tone Mapping + Lightformer-Environment f\u00fcr cineastischen Look.
 */

// =============================================================
// SPADE SHAPE (geteilt zwischen Karten-Texturen + Particle-Mesh)
// =============================================================

function createSpadeShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 1);
  s.bezierCurveTo(0.45, 0.7, 1.0, 0.3, 1.0, -0.15);
  s.bezierCurveTo(1.0, -0.55, 0.55, -0.65, 0.06, -0.4);
  s.lineTo(0.4, -0.95);
  s.lineTo(-0.4, -0.95);
  s.lineTo(-0.06, -0.4);
  s.bezierCurveTo(-0.55, -0.65, -1.0, -0.55, -1.0, -0.15);
  s.bezierCurveTo(-1.0, 0.3, -0.45, 0.7, 0, 1);
  return s;
}

function drawSpade(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fill: string,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(size / 100, -size / 100);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(0, 100);
  ctx.bezierCurveTo(45, 70, 100, 30, 100, -15);
  ctx.bezierCurveTo(100, -55, 55, -65, 6, -40);
  ctx.lineTo(40, -95);
  ctx.lineTo(-40, -95);
  ctx.lineTo(-6, -40);
  ctx.bezierCurveTo(-55, -65, -100, -55, -100, -15);
  ctx.bezierCurveTo(-100, 30, -45, 70, 0, 100);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// =============================================================
// CARD TEXTURES (Canvas \u2013 keine externen Assets)
// =============================================================

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.stroke();
}

function makeCardFrontTexture(): THREE.Texture {
  const W = 512;
  const H = 768;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#fdf6ea");
  bg.addColorStop(0.5, "#f4e3bf");
  bg.addColorStop(1, "#e9d29a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const grain = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 600);
  grain.addColorStop(0, "rgba(255,255,255,0)");
  grain.addColorStop(1, "rgba(60,30,8,0.18)");
  ctx.fillStyle = grain;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "#7a1f2b";
  ctx.lineWidth = 14;
  strokeRoundedRect(ctx, 22, 22, W - 44, H - 44, 32);

  ctx.strokeStyle = "rgba(194,134,46,0.85)";
  ctx.lineWidth = 2;
  strokeRoundedRect(ctx, 50, 50, W - 100, H - 100, 22);

  ctx.fillStyle = "#1a0a0e";
  ctx.font = "bold 96px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Q", 76, 70);
  drawSpade(ctx, 116, 218, 28, "#1a0a0e");

  ctx.save();
  ctx.translate(W - 76, H - 70);
  ctx.rotate(Math.PI);
  ctx.fillStyle = "#1a0a0e";
  ctx.font = "bold 96px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Q", 0, 0);
  drawSpade(ctx, 40, 148, 28, "#1a0a0e");
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "rgba(127,31,43,0.45)";
  ctx.shadowBlur = 24;
  drawSpade(ctx, W / 2, H / 2 + 14, 200, "#1a0a0e");
  ctx.restore();

  ctx.fillStyle = "rgba(194,134,46,0.6)";
  ctx.font = "italic 22px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("BOUNDTIME", W / 2, H - 86);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function makeCardBackTexture(): THREE.Texture {
  const W = 512;
  const H = 768;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#3a0f15");
  bg.addColorStop(0.5, "#7a1f2b");
  bg.addColorStop(1, "#3a0f15");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.beginPath();
  ctx.rect(40, 40, W - 80, H - 80);
  ctx.clip();
  ctx.strokeStyle = "rgba(194,134,46,0.5)";
  ctx.lineWidth = 1.4;
  const step = 34;
  for (let x = -H; x < W + H; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + H, H);
    ctx.stroke();
  }
  for (let x = -H; x < W + H; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x + H, 0);
    ctx.stroke();
  }
  ctx.restore();

  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.lineWidth = 18;
  strokeRoundedRect(ctx, 30, 30, W - 60, H - 60, 28);
  ctx.strokeStyle = "#c2862e";
  ctx.lineWidth = 6;
  strokeRoundedRect(ctx, 30, 30, W - 60, H - 60, 28);

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.beginPath();
  ctx.ellipse(W / 2, H / 2, 132, 182, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c2862e";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(W / 2, H / 2, 132, 182, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(W / 2, H / 2, 118, 168, 0, 0, Math.PI * 2);
  ctx.stroke();

  drawSpade(ctx, W / 2, H / 2 - 14, 92, "#c2862e");

  ctx.fillStyle = "#c2862e";
  ctx.font = "bold 22px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const text = "BOUND  ·  TIME";
  ctx.fillText(text, W / 2, H / 2 + 122);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// =============================================================
// CARD MESH \u2013 Box mit 6 Materials, beidseitig texturiert
// =============================================================

function Card() {
  const groupRef = useRef<THREE.Group>(null);

  const { frontTex, backTex } = useMemo(
    () => ({
      frontTex: makeCardFrontTexture(),
      backTex: makeCardBackTexture(),
    }),
    [],
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.18 + state.pointer.x * 0.22;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      Math.sin(t * 0.3) * 0.04 + state.pointer.y * 0.06,
      0.05,
    );
    groupRef.current.rotation.z = Math.sin(t * 0.42) * 0.03;
    groupRef.current.position.y = Math.sin(t * 0.55) * 0.09;
  });

  return (
    <group ref={groupRef} position={[0, 0.05, 0]}>
      <mesh>
        <boxGeometry args={[1.55, 2.32, 0.04]} />
        <meshStandardMaterial
          attach="material-0"
          color="#fdf6ea"
          roughness={0.6}
          metalness={0.05}
        />
        <meshStandardMaterial
          attach="material-1"
          color="#fdf6ea"
          roughness={0.6}
          metalness={0.05}
        />
        <meshStandardMaterial
          attach="material-2"
          color="#fdf6ea"
          roughness={0.6}
          metalness={0.05}
        />
        <meshStandardMaterial
          attach="material-3"
          color="#fdf6ea"
          roughness={0.6}
          metalness={0.05}
        />
        <meshStandardMaterial
          attach="material-4"
          map={frontTex}
          roughness={0.5}
          metalness={0.05}
          emissive="#3a0f15"
          emissiveIntensity={0.06}
          envMapIntensity={1.0}
        />
        <meshStandardMaterial
          attach="material-5"
          map={backTex}
          roughness={0.45}
          metalness={0.18}
          emissive="#3a0f15"
          emissiveIntensity={0.12}
          envMapIntensity={1.4}
        />
      </mesh>
    </group>
  );
}

// =============================================================
// FLOATING SPADES \u2013 atmosph\u00e4rische Particles
// =============================================================

const SPADE_GEOMETRY = (() => {
  const geo = new THREE.ExtrudeGeometry(createSpadeShape(), {
    depth: 0.3,
    bevelEnabled: true,
    bevelSegments: 6,
    steps: 1,
    bevelSize: 0.1,
    bevelThickness: 0.1,
    curveSegments: 22,
  });
  geo.translate(0, 0, -0.15);
  geo.scale(0.13, 0.13, 0.13);
  return geo;
})();

const SPADE_PALETTE = [
  new THREE.Color("#c2862e"),
  new THREE.Color("#7a1f2b"),
  new THREE.Color("#a83a4a"),
  new THREE.Color("#1a0707"),
  new THREE.Color("#d9a352"),
];

type SpadeInstance = {
  basePos: THREE.Vector3;
  speed: number;
  drift: number;
  baseSize: number;
  spinSpeed: number;
  driftAmplitude: number;
  pulsePhase: number;
  colorIndex: number;
};

function FloatingSpades({ count = 30 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const instances = useMemo<SpadeInstance[]>(() => {
    const arr: SpadeInstance[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        basePos: new THREE.Vector3(
          (Math.random() - 0.5) * 9.0,
          -5.0 + Math.random() * 10,
          -1.2 + (Math.random() - 0.5) * 4.0,
        ),
        speed: 0.12 + Math.random() * 0.32,
        drift: Math.random() * Math.PI * 2,
        baseSize: 0.45 + Math.random() * 0.85,
        spinSpeed: 0.22 + Math.random() * 0.5,
        driftAmplitude: 0.18 + Math.random() * 0.35,
        pulsePhase: Math.random() * Math.PI * 2,
        colorIndex: Math.floor(Math.random() * SPADE_PALETTE.length),
      });
    }
    return arr;
  }, [count]);

  useEffect(() => {
    if (!meshRef.current) return;
    const colorRef = new THREE.Color();
    for (let i = 0; i < count; i++) {
      colorRef.copy(SPADE_PALETTE[instances[i].colorIndex]);
      meshRef.current.setColorAt(i, colorRef);
    }
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [count, instances]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const inst = instances[i];

      inst.basePos.y += inst.speed * delta;
      if (inst.basePos.y > 5.2) {
        inst.basePos.y = -5.2;
        inst.basePos.x = (Math.random() - 0.5) * 9.0;
        inst.basePos.z = -1.2 + (Math.random() - 0.5) * 4.0;
      }

      const driftX = Math.sin(t * 0.4 + inst.drift) * inst.driftAmplitude * 0.4;
      const driftZ = Math.cos(t * 0.3 + inst.drift) * inst.driftAmplitude * 0.25;

      dummy.position.set(
        inst.basePos.x + driftX,
        inst.basePos.y,
        inst.basePos.z + driftZ,
      );

      const pulse = 1 + Math.sin(t * 1.2 + inst.pulsePhase) * 0.12;
      dummy.scale.setScalar(inst.baseSize * pulse);

      dummy.rotation.y = t * inst.spinSpeed + inst.drift;
      dummy.rotation.z = Math.sin(t * 0.32 + inst.drift) * 0.18;
      dummy.rotation.x = Math.sin(t * 0.18 + inst.drift) * 0.08;

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[SPADE_GEOMETRY, undefined, count]}
      frustumCulled={false}
    >
      <meshStandardMaterial
        metalness={0.85}
        roughness={0.25}
        envMapIntensity={1.6}
        emissive="#1a0707"
        emissiveIntensity={0.28}
      />
    </instancedMesh>
  );
}

// =============================================================
// SCENE \u2013 Lights + Environment + Composition
// =============================================================

function Scene() {
  return (
    <>
      <fog attach="fog" args={["#0a0507", 8, 18]} />

      <ambientLight intensity={0.32} color="#3a1014" />

      <spotLight
        position={[3.6, 3.4, 3.6]}
        angle={0.6}
        penumbra={0.85}
        intensity={50}
        color="#ffd29a"
        distance={14}
        decay={1.5}
      />
      <pointLight
        position={[-3.4, -1.2, 3.0]}
        intensity={2.4}
        color="#a83a4a"
        distance={11}
        decay={1.7}
      />
      <pointLight
        position={[0, 1.5, -3]}
        intensity={2.0}
        color="#f4b35a"
        distance={9}
        decay={1.6}
      />
      <pointLight
        position={[0, -3.5, 1.5]}
        intensity={1.0}
        color="#c2541a"
        distance={6}
        decay={1.8}
      />

      <Suspense fallback={null}>
        <Environment background={false} resolution={128}>
          <Lightformer
            form="rect"
            intensity={3.2}
            position={[3.0, 2.5, 2.5]}
            scale={[3.5, 5, 1]}
            color="#ffb070"
          />
          <Lightformer
            form="rect"
            intensity={2.0}
            position={[-3.4, -1.0, 2.4]}
            scale={[3.0, 4.4, 1]}
            color="#a83a4a"
          />
          <Lightformer
            form="ring"
            intensity={1.4}
            position={[0, 0, -3]}
            scale={4.5}
            color="#7a1f2b"
          />
          <Lightformer
            form="rect"
            intensity={1.0}
            position={[0, 3.5, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[6, 2, 1]}
            color="#3a1014"
          />
        </Environment>
      </Suspense>

      <Card />
      <FloatingSpades count={30} />
    </>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 5.4], fov: 38 }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
