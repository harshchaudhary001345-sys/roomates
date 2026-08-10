import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

const badgeGeo = (() => {
  const s = new THREE.Shape();
  // simple shield silhouette
  s.moveTo(0, 0.68);
  s.bezierCurveTo(-0.62, 0.68, -0.72, 0.22, -0.72, 0.0);
  s.bezierCurveTo(-0.72, -0.46, -0.36, -0.68, 0, -0.82);
  s.bezierCurveTo(0.36, -0.68, 0.72, -0.46, 0.72, 0.0);
  s.bezierCurveTo(0.72, 0.22, 0.62, 0.68, 0, 0.68);
  return new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 4 });
})();

function BadgeMesh() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.6;
      ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.7) * 0.14;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group rotation={[0.15, 0, 0]}>
        <mesh ref={ref} geometry={badgeGeo} scale={1.25}>
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.4}
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={0.7}
          />
        </mesh>

        {/* inner checkmark plane */}
        <mesh position={[0, 0.04, 0.095]} scale={0.48}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#34e2b0" toneMapped={false} transparent opacity={0.75} />
        </mesh>

        {/* emissive ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.04, 0.14]}>
          <ringGeometry args={[0.7, 0.82, 64]} />
          <meshBasicMaterial
            color="#34e2b0"
            toneMapped={false}
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["transparent"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 4]} intensity={1.6} />
      <pointLight position={[0, 2, 3]} color="#34e2b0" intensity={8} distance={8} />
      <pointLight position={[-2, -1, 2]} color="#8b5cf6" intensity={4} distance={7} />
      <BadgeMesh />
    </>
  );
}

export default function VerifiedBadge3D({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[0.7, 1.3]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        camera={{ position: [0, 0, 3.6], fov: 36 }}
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
