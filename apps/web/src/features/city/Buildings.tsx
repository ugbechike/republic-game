import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { Plot } from '@republic/contracts';
type Vec = [number, number, number];
export function Block({
  at,
  size,
  color,
  ...rest
}: {
  at: Vec;
  size: Vec;
  color: string;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  return (
    <mesh position={at} {...rest}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}
function Tower({ height, variant }: { height: number; variant: number }) {
  return (
    <>
      <Block
        at={[0, height / 2, 0]}
        size={[0.65, height, 0.62]}
        color={variant % 2 ? '#9caeab' : '#76918d'}
        castShadow
      />
      <Block at={[0, height + 0.04, 0]} size={[0.7, 0.08, 0.67]} color="#c7c9b2" />
      {Array.from({ length: Math.floor(height * 5) }, (_, i) => (
        <group key={i}>
          <Block
            at={[0.329, 0.16 + i * 0.2, 0]}
            size={[0.015, 0.08, 0.48]}
            color={i % 3 === 0 ? '#e9d292' : '#324f54'}
          />
          <Block
            at={[0, 0.16 + i * 0.2, 0.319]}
            size={[0.5, 0.08, 0.015]}
            color={i % 4 === 0 ? '#e9d292' : '#324f54'}
          />
        </group>
      ))}
      <Block at={[0, height + 0.13, 0]} size={[0.3, 0.18, 0.25]} color="#486062" />
    </>
  );
}
function Home({ variant }: { variant: number }) {
  return (
    <>
      <Block at={[0, 0.24, 0]} size={[0.66, 0.48, 0.6]} color={variant % 3 ? '#c5c3a5' : '#ded3b1'} castShadow />
      <mesh position={[0, 0.55, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.56, 0.27, 4]} />
        <meshStandardMaterial color={variant % 2 ? '#ac7252' : '#637c79'} />
      </mesh>
      <Block at={[0.16, 0.24, 0.306]} size={[0.14, 0.18, 0.015]} color="#e5c978" />
      <Block at={[-0.14, 0.18, 0.306]} size={[0.12, 0.35, 0.018]} color="#4b635d" />
    </>
  );
}
function Factory() {
  return (
    <>
      <Block at={[0, 0.28, 0]} size={[0.85, 0.56, 0.62]} color="#a5a48b" castShadow />
      <Block at={[0, 0.59, 0]} size={[0.9, 0.07, 0.7]} color="#6f8179" />
      <Block at={[0.25, 0.95, -0.15]} size={[0.12, 1.3, 0.12]} color="#ad947d" />
      <Block at={[-0.26, 0.84, -0.15]} size={[0.12, 1, 0.12]} color="#bca78e" />
      <Block at={[0, 0.27, 0.32]} size={[0.63, 0.17, 0.02]} color="#4c6467" />
    </>
  );
}
function Civic() {
  return (
    <>
      <Block at={[0, 0.16, 0]} size={[1.05, 0.32, 0.8]} color="#ddd4ac" castShadow />
      <Block at={[0, 0.38, 0]} size={[0.8, 0.18, 0.7]} color="#eee2bb" />
      {[-0.3, -0.1, 0.1, 0.3].map((x) => (
        <Block key={x} at={[x, 0.28, 0.42]} size={[0.05, 0.35, 0.05]} color="#f3e8c9" />
      ))}
      <mesh position={[0, 0.56, 0]}>
        <sphereGeometry args={[0.25, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#88b0a1" />
      </mesh>
      <Block at={[0, 0.98, 0]} size={[0.025, 0.6, 0.025]} color="#ebd8a5" />
      <Block at={[0.11, 1.16, 0]} size={[0.22, 0.14, 0.02]} color="#dec58b" />
    </>
  );
}
function Farm() {
  return (
    <>
      <Block at={[0, 0.02, 0]} size={[0.96, 0.04, 0.9]} color="#7b8660" />
      {[-0.32, -0.16, 0, 0.16, 0.32].map((z) => (
        <Block key={z} at={[0, 0.08, z]} size={[0.9, 0.12, 0.045]} color="#b6b774" />
      ))}
      <Block at={[0.25, 0.26, -0.25]} size={[0.27, 0.45, 0.3]} color="#ba9b6d" />
    </>
  );
}
export function Building({ plot }: { plot: Plot }) {
  const group = useRef<Group>(null);
  useFrame((_state, dt) => {
    if (group.current) group.current.scale.y += (1 - group.current.scale.y) * Math.min(1, dt * 2);
  });
  return (
    <group position={[plot.x * 1.4, 0.18, plot.z * 1.4]}>
      <Block at={[0, -0.03, 0]} size={[1.12, 0.06, 1.12]} color="#88967b" receiveShadow />
      {plot.stage === 0 ? (
        <Block at={[0, 0.02, 0]} size={[0.65, 0.04, 0.6]} color="#877d62" />
      ) : plot.stage < 4 ? (
        <group>
          <Block at={[0, plot.stage * 0.16, 0]} size={[0.65, plot.stage * 0.32, 0.6]} color="#a99b7e" />
          {[-0.3, 0.3].map((x) => (
            <Block key={x} at={[x, 0.6, 0.3]} size={[0.04, 1.2, 0.04]} color="#d1b784" />
          ))}
          <Block at={[0.48, 1, 0]} size={[0.035, 2, 0.035]} color="#dfb964" />
          <Block at={[0.1, 1.9, 0]} size={[1.1, 0.05, 0.05]} color="#dfb964" />
        </group>
      ) : (
        <group ref={group} scale={[1, 0.98, 1]}>
          {plot.kind === 'tower' ? (
            <Tower height={plot.height} variant={plot.id} />
          ) : plot.kind === 'factory' ? (
            <Factory />
          ) : plot.kind === 'civic' ? (
            <Civic />
          ) : plot.kind === 'farm' ? (
            <Farm />
          ) : (
            <Home variant={plot.id} />
          )}
        </group>
      )}
    </group>
  );
}
