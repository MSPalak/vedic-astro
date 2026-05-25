"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type PlanetDef = {
  radius: number;
  size: number;
  color: string;
  speed: number;
  tilt: number;
  ring?: boolean;
};

const PLANETS: PlanetDef[] = [
  { radius: 2.4, size: 0.16, color: "#c98a5e", speed: 0.55, tilt: 0.05 },
  { radius: 3.3, size: 0.27, color: "#f0c060", speed: 0.42, tilt: 0.02 },
  { radius: 4.5, size: 0.3, color: "#4f9dde", speed: 0.34, tilt: 0.08 },
  { radius: 5.7, size: 0.23, color: "#e2674a", speed: 0.27, tilt: 0.04 },
  { radius: 7.6, size: 0.58, color: "#e0b15a", speed: 0.18, tilt: 0.06 },
  {
    radius: 9.4,
    size: 0.48,
    color: "#d8b66a",
    speed: 0.13,
    tilt: 0.1,
    ring: true,
  },
];

function OrbitRing({ radius }: { radius: number }) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);
  return (
    // @ts-ignore r3f intrinsic
    <line geometry={geo}>
      <lineBasicMaterial color="#cdbfe8" transparent opacity={0.5} />
    </line>
  );
}

function Planet({ def, offset }: { def: PlanetDef; offset: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime * def.speed + offset;
    if (ref.current) {
      ref.current.position.set(
        Math.cos(t) * def.radius,
        Math.sin(t * 1.3) * def.radius * def.tilt,
        Math.sin(t) * def.radius,
      );
      ref.current.rotation.y += 0.012;
    }
  });
  return (
    <group ref={ref}>
      <mesh castShadow>
        <sphereGeometry args={[def.size, 48, 48]} />
        <meshStandardMaterial
          color={def.color}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>
      {/* soft atmosphere */}
      <mesh scale={1.22}>
        <sphereGeometry args={[def.size, 24, 24]} />
        <meshBasicMaterial color={def.color} transparent opacity={0.12} />
      </mesh>
      {def.ring && (
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <ringGeometry args={[def.size * 1.5, def.size * 2.3, 64]} />
          <meshBasicMaterial
            color="#e6d2a8"
            side={THREE.DoubleSide}
            transparent
            opacity={0.45}
          />
        </mesh>
      )}
    </group>
  );
}

function Sun() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.y += 0.004;
      const k = 1 + Math.sin(s.clock.elapsedTime * 1.6) * 0.015;
      ref.current.scale.setScalar(k);
    }
  });
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[0.98, 64, 64]} />
        <meshStandardMaterial
          color="#ffa630"
          emissive="#ff7a00"
          emissiveIntensity={1.6}
          roughness={0.25}
        />
      </mesh>
      {[1.4, 1.9, 2.6].map((sc, i) => (
        <mesh key={i} scale={sc}>
          <sphereGeometry args={[0.98, 32, 32]} />
          <meshBasicMaterial
            color="#ffd591"
            transparent
            opacity={0.16 - i * 0.045}
          />
        </mesh>
      ))}
      <pointLight intensity={2.6} distance={48} color="#fff1da" />
    </group>
  );
}

function Dust() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 280;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 12 + Math.random() * 20;
      const a = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0004;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#c9b8e8" size={0.05} transparent opacity={0.6} />
    </points>
  );
}

function System() {
  const grp = useRef<THREE.Group>(null);
  const { camera } = useThree();
  useFrame((s) => {
    if (grp.current) grp.current.rotation.y += 0.0007;
    const e = s.clock.elapsedTime;
    camera.position.x = Math.sin(e * 0.07) * 1.6;
    camera.position.y = 6.3 + Math.sin(e * 0.05) * 0.6;
    camera.lookAt(0, 0, 0);
  });
  return (
    <group ref={grp} rotation={[0.42, 0, 0]}>
      <Sun />
      <Dust />
      {PLANETS.map((p, i) => (
        <group key={i}>
          <OrbitRing radius={p.radius} />
          <Planet def={p} offset={i * 1.7} />
        </group>
      ))}
    </group>
  );
}

export default function CosmicScene() {
  return (
    <Canvas
      camera={{ position: [0, 6.3, 13], fov: 50 }}
      dpr={[1, 1.5]}
      performance={{ min: 0.4 }}
      gl={{ antialias: true, alpha: true, powerPreference: "default" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[8, 10, 6]} intensity={0.5} />
      <System />
    </Canvas>
  );
}
