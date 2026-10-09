import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';
import { Block } from './Buildings';
export function Tree({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return (
    <group position={[x, 0.2, z]} scale={scale}>
      <Block at={[0, 0.2, 0]} size={[0.07, 0.4, 0.07]} color="#695f42" />
      <mesh position={[0, 0.5, 0]} castShadow>
        <icosahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#527b5d" />
      </mesh>
      <mesh position={[0, 0.74, 0]}>
        <icosahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#749565" />
      </mesh>
    </group>
  );
}
function Car({ index, activity }: { index: number; activity: number }) {
  const car = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!car.current) return;
    const t = ((clock.elapsedTime * (0.24 + activity / 400) + index * 2.1) % 18) - 9;
    car.current.position.x = index % 2 ? t : -t;
  });
  return (
    <group ref={car} position={[0, 0.23, ((index % 7) - 3) * 1.4 + 0.65]}>
      <Block at={[0, 0, 0]} size={[0.18, 0.09, 0.08]} color={['#e7d5ae', '#ab6652', '#638785'][index % 3]} />
      <Block at={[0.02, 0.065, 0]} size={[0.08, 0.04, 0.075]} color="#bdd1c0" />
    </group>
  );
}
function Windmill({ x, z, reducedMotion }: { x: number; z: number; reducedMotion: boolean }) {
  const rotor = useRef<Group>(null);
  useFrame((_s, dt) => {
    if (rotor.current && !reducedMotion) rotor.current.rotation.z += dt * 0.6;
  });
  return (
    <group position={[x, 0, z]}>
      <Block at={[0, 0.75, 0]} size={[0.06, 1.5, 0.06]} color="#d0d9c2" />
      <group position={[0, 1.5, 0.07]} ref={rotor}>
        {[0, 1, 2].map((i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
            <Block at={[0, 0.26, 0]} size={[0.055, 0.52, 0.03]} color="#e5e8d1" />
          </group>
        ))}
      </group>
    </group>
  );
}
function Water({ reducedMotion }: { reducedMotion: boolean }) {
  const water = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (water.current && !reducedMotion) water.current.position.y = -0.16 + Math.sin(clock.elapsedTime * 0.5) * 0.015;
  });
  return (
    <mesh ref={water} position={[0, -0.16, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#426f77" roughness={0.35} metalness={0.22} />
    </mesh>
  );
}
export function Landscape({
  capital,
  infrastructure,
  energy,
  activity,
  reducedMotion,
}: {
  capital: boolean;
  infrastructure: number;
  energy: number;
  activity: number;
  reducedMotion: boolean;
}) {
  const width = capital ? 11 : 8;
  return (
    <>
      <Water reducedMotion={reducedMotion} />
      <Block at={[0, -0.15, 0]} size={[width, 0.6, width]} color="#667e67" receiveShadow />
      <Block at={[0, 0.16, 0]} size={[width - 0.12, 0.025, width - 0.12]} color="#344b49" receiveShadow />
      {Array.from({ length: capital ? 8 : 6 }, (_, i) => {
        const p = (i - (capital ? 3.5 : 2.5)) * 1.4;
        return (
          <group key={i}>
            <Block
              at={[p, 0.182, 0]}
              size={[0.27, 0.018, width - 0.1]}
              color={infrastructure > 45 ? '#576b64' : '#776e59'}
            />
            <Block
              at={[0, 0.183, p]}
              size={[width - 0.1, 0.018, 0.27]}
              color={infrastructure > 45 ? '#576b64' : '#776e59'}
            />
            {Array.from({ length: 12 }, (_, k) => (
              <Block key={k} at={[(k - 5.5) * 0.8, 0.196, p]} size={[0.16, 0.006, 0.013]} color="#a1ac8d" />
            ))}
          </group>
        );
      })}
      {Array.from({ length: capital ? 24 : 16 }, (_, i) => {
        const edge = width / 2 - 0.24,
          x = i % 2 ? edge : -edge,
          z = (i / 2 - (capital ? 6 : 4)) * 0.8;
        return <Tree key={i} x={x} z={z} scale={0.75 + (i % 3) * 0.12} />;
      })}
      <Block at={[width / 2 + 0.6, -0.06, 0.8]} size={[1.3, 0.2, 3.2]} color="#b6af8c" />
      <Block at={[width / 2 + 1.3, -0.1, 1.5]} size={[1, 0.15, 0.2]} color="#a7a88b" />
      <Block at={[-width / 2 - 1.4, 0.05, -1.4]} size={[3, 0.12, 0.5]} color="#a5ad91" />
      {[-1, 1].map((z) => (
        <Block key={z} at={[-width / 2 - 1.3, -0.2, -1.4 + z * 0.19]} size={[0.13, 0.5, 0.1]} color="#768575" />
      ))}
      {energy > 35 && <Windmill reducedMotion={reducedMotion} x={width / 2 - 0.5} z={-width / 2 + 0.5} />}
      {capital && (
        <>
          <mesh position={[-8, -0.15, -7]}>
            <coneGeometry args={[4, 3.5, 5]} />
            <meshStandardMaterial color="#647e6b" />
          </mesh>
          <mesh position={[-5, -0.3, -10]}>
            <coneGeometry args={[5, 4, 5]} />
            <meshStandardMaterial color="#839380" />
          </mesh>
        </>
      )}
      {!reducedMotion &&
        Array.from({ length: Math.max(3, Math.floor(activity / 7)) }, (_, i) => (
          <Car key={i} index={i} activity={activity} />
        ))}
    </>
  );
}
