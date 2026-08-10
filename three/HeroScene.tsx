import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------------------------------------------ *
 *  Utility: rounded-rect shape geometry (for glass listing cards)
 * ------------------------------------------------------------------ */
function roundedShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/* ------------------------------------------------------------------ *
 *  The apartment tower — stacked slabs with emissive window grids
 * ------------------------------------------------------------------ */
function WindowGrid({
  w,
  h,
  z,
  rows,
  cols,
  color,
}: {
  w: number;
  h: number;
  z: number;
  rows: number;
  cols: number;
  color: string;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = rows * cols;

  const seeds = useMemo(
    () => new Array(count).fill(0).map(() => Math.random()),
    [count],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * (w / cols) * 1.05;
        const y = (r - (rows - 1) / 2) * (h / rows) * 1.15;
        dummy.position.set(x, y, z);
        dummy.scale.set((w / cols) * 0.52, (h / rows) * 0.42, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        const flick = 0.45 + 0.55 * Math.abs(Math.sin(t * 0.6 + seeds[i] * 20));
        col.set(color).multiplyScalar(seeds[i] > 0.24 ? flick : 0.06);
        mesh.setColorAt(i, col);
        i++;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={0.95} />
    </instancedMesh>
  );
}

function Slab({
  y,
  w,
  h,
  d,
  rot = 0,
  accent,
}: {
  y: number;
  w: number;
  h: number;
  d: number;
  rot?: number;
  accent: string;
}) {
  return (
    <group position={[0, y, 0]} rotation={[0, rot, 0]}>
      <RoundedBox args={[w, h, d]} radius={0.06} smoothness={3}>
        <meshStandardMaterial
          color="#0a0d1a"
          metalness={0.92}
          roughness={0.22}
          envMapIntensity={0.5}
        />
      </RoundedBox>
      {/* window faces */}
      <WindowGrid w={w * 0.82} h={h * 0.72} z={d / 2 + 0.012} rows={Math.max(2, Math.round(h * 3))} cols={5} color={accent} />
      <group rotation={[0, Math.PI, 0]}>
        <WindowGrid w={w * 0.82} h={h * 0.72} z={d / 2 + 0.012} rows={Math.max(2, Math.round(h * 3))} cols={5} color={accent} />
      </group>
      <group rotation={[0, Math.PI / 2, 0]}>
        <WindowGrid w={d * 0.8} h={h * 0.72} z={w / 2 + 0.012} rows={Math.max(2, Math.round(h * 3))} cols={4} color={accent} />
      </group>
      <group rotation={[0, -Math.PI / 2, 0]}>
        <WindowGrid w={d * 0.8} h={h * 0.72} z={w / 2 + 0.012} rows={Math.max(2, Math.round(h * 3))} cols={4} color={accent} />
      </group>
      {/* balcony light strip */}
      <mesh position={[0, -h / 2 - 0.015, 0]}>
        <boxGeometry args={[w * 1.05, 0.022, d * 1.05]} />
        <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function Tower() {
  const g = useRef<THREE.Group>(null);
  const scan = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (g.current) {
      g.current.rotation.y = t * 0.11;
      g.current.position.y = Math.sin(t * 0.55) * 0.13;
    }
    if (scan.current) {
      const p = ((t * 0.42) % 1.6) - 0.35;
      scan.current.position.y = -1.5 + p * 2.6;
      const m = scan.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.45 * Math.sin(Math.min(Math.max(p / 1.25, 0), 1) * Math.PI);
    }
  });

  return (
    <group ref={g} position={[0, 0.05, 0]} scale={1.12}>
      <Slab y={-1.15} w={2.05} h={0.62} d={1.75} accent="#7dd3fc" />
      <Slab y={-0.4} w={1.78} h={0.78} d={1.5} rot={0.16} accent="#a78bfa" />
      <Slab y={0.45} w={1.95} h={0.72} d={1.62} rot={-0.12} accent="#818cf8" />
      <Slab y={1.2} w={1.5} h={0.62} d={1.3} rot={0.3} accent="#67e8f9" />
      <Slab y={1.82} w={1.06} h={0.42} d={0.96} rot={-0.2} accent="#c4b5fd" />

      {/* rooftop antenna + beacon */}
      <mesh position={[0, 2.32, 0]}>
        <cylinderGeometry args={[0.012, 0.02, 0.62, 8]} />
        <meshBasicMaterial color="#c4b5fd" toneMapped={false} />
      </mesh>
      <mesh position={[0, 2.66, 0]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color="#22d3ee" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 2.66, 0]} color="#22d3ee" intensity={5} distance={4} />

      {/* verification scan plane */}
      <mesh ref={scan} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 1.85, 64]} />
        <meshBasicMaterial
          color="#34e2b0"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  Glowing location pins on the map plane
 * ------------------------------------------------------------------ */
function Pin({
  position,
  color,
  delay,
}: {
  position: [number, number, number];
  color: string;
  delay: number;
}) {
  const ring = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + delay;
    const pulse = (t * 0.55) % 1;
    if (ring.current) {
      const s = 0.25 + pulse * 1.25;
      ring.current.scale.set(s, s, s);
      (ring.current.material as THREE.MeshBasicMaterial).opacity =
        0.55 * (1 - pulse);
    }
    const pulse2 = ((t * 0.55 + 0.5) % 1);
    if (ring2.current) {
      const s = 0.25 + pulse2 * 1.25;
      ring2.current.scale.set(s, s, s);
      (ring2.current.material as THREE.MeshBasicMaterial).opacity =
        0.35 * (1 - pulse2);
    }
    if (head.current) {
      head.current.position.y = 0.42 + Math.sin(t * 1.4) * 0.055;
    }
  });

  return (
    <group position={position}>
      {[ring, ring2].map((r, i) => (
        <mesh key={i} ref={r} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.66, 48]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
      <group ref={head} position={[0, 0.42, 0]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.115, 0.26, 6]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.6}
            metalness={0.6}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.115, 20, 20]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.9}
            metalness={0.4}
            roughness={0.2}
          />
        </mesh>
      </group>
      {/* beam */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.024, 0.075, 1.1, 10, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  Floating glassmorphic listing cards
 * ------------------------------------------------------------------ */
function ListingCard({
  position,
  rotation,
  accent,
  verified = true,
  scale = 1,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  accent: string;
  verified?: boolean;
  scale?: number;
}) {
  const geo = useMemo(
    () => new THREE.ShapeGeometry(roundedShape(1.45, 1.0, 0.12), 12),
    [],
  );
  const photoGeo = useMemo(
    () => new THREE.ShapeGeometry(roundedShape(1.27, 0.5, 0.08), 12),
    [],
  );

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* glow halo */}
      <mesh position={[0, 0, -0.03]} scale={1.14}>
        <primitive object={geo.clone()} attach="geometry" />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.13}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* card body */}
      <mesh>
        <primitive object={geo} attach="geometry" />
        <meshPhysicalMaterial
          color="#0b0e1c"
          transparent
          opacity={0.88}
          metalness={0.35}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* photo area */}
      <mesh position={[0, 0.21, 0.006]}>
        <primitive object={photoGeo} attach="geometry" />
        <meshBasicMaterial color={accent} transparent opacity={0.34} toneMapped={false} />
      </mesh>
      {/* play badge (video-verified) */}
      <mesh position={[0, 0.21, 0.012]}>
        <circleGeometry args={[0.088, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.92} toneMapped={false} />
      </mesh>
      <mesh position={[0.012, 0.21, 0.016]} rotation={[0, 0, -Math.PI / 2]}>
        <circleGeometry args={[0.042, 3]} />
        <meshBasicMaterial color="#0b0e1c" toneMapped={false} />
      </mesh>
      {/* text bars */}
      <mesh position={[-0.28, -0.13, 0.008]}>
        <planeGeometry args={[0.62, 0.075]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.78} toneMapped={false} />
      </mesh>
      <mesh position={[-0.38, -0.26, 0.008]}>
        <planeGeometry args={[0.42, 0.05]} />
        <meshBasicMaterial color="#94a3b8" transparent opacity={0.55} toneMapped={false} />
      </mesh>
      {/* price pill */}
      <mesh position={[0.44, -0.34, 0.008]}>
        <planeGeometry args={[0.44, 0.13]} />
        <meshBasicMaterial color={accent} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      {/* verified dot */}
      {verified && (
        <mesh position={[-0.56, -0.36, 0.008]}>
          <circleGeometry args={[0.055, 20]} />
          <meshBasicMaterial color="#34e2b0" toneMapped={false} />
        </mesh>
      )}
      {/* "0%" broker strike marker */}
      <mesh position={[0.52, 0.44, 0.01]}>
        <circleGeometry args={[0.075, 24]} />
        <meshBasicMaterial color="#34e2b0" transparent opacity={0.9} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  Map grid plane + connection arcs
 * ------------------------------------------------------------------ */
function MapPlane() {
  const arcs = useMemo(() => {
    const pts: THREE.Vector3[][] = [];
    const from = new THREE.Vector3(0, 0.1, 0);
    const targets: [number, number][] = [
      [-3.1, -1.4],
      [3.0, -1.0],
      [-2.4, 1.5],
      [2.6, 1.7],
      [0.4, -2.6],
    ];
    targets.forEach(([x, z]) => {
      const to = new THREE.Vector3(x, 0.1, z);
      const mid = from
        .clone()
        .add(to)
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(0, 1.15, 0));
      const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
      pts.push(curve.getPoints(40));
    });
    return pts;
  }, []);

  return (
    <group position={[0, -1.85, 0]}>
      {/* base disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6.4, 72]} />
        <meshBasicMaterial color="#070a16" transparent opacity={0.85} />
      </mesh>
      {/* concentric radar rings */}
      {[1.6, 2.8, 4.0, 5.2].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
          <ringGeometry args={[r, r + 0.008, 96]} />
          <meshBasicMaterial
            color="#6366f1"
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* grid lines */}
      {new Array(13).fill(0).map((_, i) => {
        const p = -6 + i;
        return (
          <group key={i}>
            <mesh position={[p, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.006, 12]} />
              <meshBasicMaterial color="#8b5cf6" transparent opacity={0.13} />
            </mesh>
            <mesh position={[0, 0.003, p]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[12, 0.006]} />
              <meshBasicMaterial color="#3b82f6" transparent opacity={0.13} />
            </mesh>
          </group>
        );
      })}
      {/* commute arcs */}
      {arcs.map((p, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(p.flatMap((v) => [v.x, v.y, v.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={i % 2 ? "#22d3ee" : "#a78bfa"}
            transparent
            opacity={0.42}
            toneMapped={false}
          />
        </line>
      ))}
      <Pin position={[-3.1, 0, -1.4]} color="#a78bfa" delay={0} />
      <Pin position={[3.0, 0, -1.0]} color="#22d3ee" delay={0.9} />
      <Pin position={[-2.4, 0, 1.5]} color="#60a5fa" delay={1.7} />
      <Pin position={[2.6, 0, 1.7]} color="#34e2b0" delay={0.45} />
      <Pin position={[0.4, 0, -2.6]} color="#c4b5fd" delay={1.25} />
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  Ambient dust particles
 * ------------------------------------------------------------------ */
function Dust() {
  const ref = useRef<THREE.Points>(null);
  const { positions } = useMemo(() => {
    const n = 420;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 11;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return { positions: arr };
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.018;
      ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.25;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#a5b4fc"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ *
 *  Mouse-parallax rig
 * ------------------------------------------------------------------ */
function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!group.current) return;
    const k = 1 - Math.pow(0.0015, delta);
    group.current.rotation.y +=
      (pointer.x * 0.34 - group.current.rotation.y) * k;
    group.current.rotation.x +=
      (-pointer.y * 0.16 - group.current.rotation.x) * k;
    group.current.position.x +=
      (pointer.x * 0.32 - group.current.position.x) * k;
  });

  return <group ref={group}>{children}</group>;
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#04050a"]} />
      <fog attach="fog" args={["#04050a", 9, 26]} />

      <ambientLight intensity={0.42} />
      <directionalLight position={[5, 8, 5]} intensity={1.15} color="#c7d2fe" />
      <pointLight position={[-5, 2, 3]} intensity={38} color="#8b5cf6" distance={18} />
      <pointLight position={[5, -1, 2]} intensity={30} color="#22d3ee" distance={18} />
      <pointLight position={[0, 4, -4]} intensity={22} color="#3b82f6" distance={18} />

      <Rig>
        <Tower />
        <MapPlane />
        <Dust />

        <Float speed={1.35} rotationIntensity={0.32} floatIntensity={0.85}>
          <ListingCard
            position={[-3.35, 1.15, 0.6]}
            rotation={[0.06, 0.44, -0.06]}
            accent="#a78bfa"
          />
        </Float>
        <Float speed={1.1} rotationIntensity={0.28} floatIntensity={1.05}>
          <ListingCard
            position={[3.35, 0.62, 0.35]}
            rotation={[-0.04, -0.42, 0.07]}
            accent="#22d3ee"
          />
        </Float>
        <Float speed={1.55} rotationIntensity={0.3} floatIntensity={0.75}>
          <ListingCard
            position={[-2.75, -0.85, 1.85]}
            rotation={[0.09, 0.34, 0.05]}
            accent="#60a5fa"
            scale={0.78}
          />
        </Float>
        <Float speed={1.25} rotationIntensity={0.26} floatIntensity={0.9}>
          <ListingCard
            position={[2.85, 1.85, -0.9]}
            rotation={[-0.08, -0.3, -0.05]}
            accent="#34e2b0"
            scale={0.7}
          />
        </Float>
      </Rig>
    </>
  );
}

export default function HeroScene() {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 1.55, 9.6], fov: 44 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.18;
      }}
      onError={() => setFailed(true)}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
