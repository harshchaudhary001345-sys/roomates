import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------------------------------------------ *
 *  Floating nested icosahedra — dashboard header accent
 * ------------------------------------------------------------------ */
function NestedIcosa({ rot, color }: { rot: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * rot * 0.25;
      ref.current.rotation.y = clock.getElapsedTime() * rot * 0.32;
      ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.45) * 0.16;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.7}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.1, 2]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.14}
          roughness={0.28}
          transparent
          opacity={0.38}
          wireframe
          envMapIntensity={0.5}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
        />
      </mesh>
    </Float>
  );
}

function SolidIcosa({ rot, color }: { rot: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * rot * 0.2;
      ref.current.rotation.x = clock.getElapsedTime() * rot * 0.15;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.22} floatIntensity={0.45}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.68, 4]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.55}
          roughness={0.08}
          transparent
          opacity={0.72}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={0.8}
        />
      </mesh>
    </Float>
  );
}

function Ring({
  radius,
  color,
  speed,
}: {
  radius: number;
  color: string;
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.getElapsedTime() * speed;
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.12;
    }
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.018, 24, 120]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.55}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function OrbCluster() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    if (group.current) {
      group.current.rotation.y = clock.getElapsedTime() * 0.08 + pointer.x * 0.8;
      group.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.08 + pointer.y * 0.4;
    }
  });

  return (
    <group ref={group}>
      <SolidIcosa rot={0.6} color="#7c3aed" />
      <NestedIcosa rot={0.7} color="#7dd3fc" />
      <Ring radius={1.08} color="#a78bfa" speed={0.22} />
      <Ring radius={1.28} color="#22d3ee" speed={-0.18} />
      <Ring radius={1.46} color="#c4b5fd" speed={0.14} />

      {/* ambient beacon */}
      <pointLight position={[0, 0, 0]} color="#8b5cf6" intensity={6} distance={4} />
      <pointLight position={[1.5, 0, 0]} color="#22d3ee" intensity={3} distance={3} />
      <pointLight position={[-1.5, 0, 0]} color="#c4b5fd" intensity={3} distance={3} />
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["transparent"]} />
      <ambientLight intensity={0.35} />
      <OrbCluster />
    </>
  );
}

export default function DashboardOrb({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[0.8, 1.4]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        camera={{ position: [0, 0, 5.2], fov: 38 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}
        onError={() => setFailed(true)}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Export a broader ambient particle field — reusable
 * ------------------------------------------------------------------ */
function ParticleFieldInner({ count = 180, spread = 6 }: { count?: number; spread?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions } = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * spread * 2;
      arr[i * 3 + 1] = (Math.random() - 0.5) * spread;
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    return { positions: arr };
  }, [count, spread]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.025;
      ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.35) * 0.2;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#a5b4fc"
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function ParticleField({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[0.6, 1]}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        camera={{ position: [0, 0, 5], fov: 50 }}
        onError={() => setFailed(true)}
      >
        <ambientLight intensity={0.2} />
        <ParticleFieldInner />
      </Canvas>
    </div>
  );
}
