import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';
import type { Region } from '@republic/contracts';
import { Block } from './Buildings';
function EmergencyLight({ reducedMotion }: { reducedMotion: boolean }) {
  const light = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (light.current && !reducedMotion) light.current.visible = Math.sin(clock.elapsedTime * 5) > 0;
  });
  return (
    <mesh ref={light} position={[-2.1, 0.5, 2.7]}>
      <boxGeometry args={[0.14, 0.08, 0.08]} />
      <meshBasicMaterial color="#efac68" />
    </mesh>
  );
}
export function CityConsequences({
  region,
  energy,
  approval,
  reducedMotion,
}: {
  region: Region;
  energy: number;
  approval: number;
  reducedMotion: boolean;
}) {
  return (
    <group>
      {region.flood && (
        <group>
          <mesh position={[-2, 0.22 + region.flood.severity * 0.05, 2.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[5, 2.5]} />
            <meshStandardMaterial
              color="#3d95b2"
              transparent
              opacity={0.45 + region.flood.severity * 0.3}
              roughness={0.15}
              metalness={0.4}
            />
          </mesh>
          <group rotation={[0, 0, 0.12]}>
            <Block at={[-3.5, 0.31, 2.5]} size={[1.3, 0.14, 0.45]} color="#67564a" />
          </group>
          <Block at={[-2.1, 0.32, 2.7]} size={[0.5, 0.25, 0.24]} color="#e4d9bd" />
          <EmergencyLight reducedMotion={reducedMotion} />
          {[-3, -2.5, -2].map((x) => (
            <Block key={x} at={[x, 0.25, 3.2]} size={[0.32, 0.15, 0.18]} color="#c7ae70" />
          ))}
        </group>
      )}
      {approval < 35 &&
        Array.from({ length: 14 }, (_, i) => (
          <group key={i} position={[(i % 7) * 0.18 - 0.5, 0.2, Math.floor(i / 7) * 0.21 + 0.7]}>
            <Block at={[0, 0.12, 0]} size={[0.07, 0.23, 0.06]} color={i % 2 ? '#765249' : '#374c59'} />
            <mesh position={[0, 0.27, 0]}>
              <sphereGeometry args={[0.05, 5, 4]} />
              <meshStandardMaterial color="#c4a885" />
            </mesh>
            {i % 3 === 0 && (
              <>
                <Block at={[0.07, 0.32, 0]} size={[0.015, 0.4, 0.015]} color="#8e7960" />
                <Block at={[0.07, 0.5, 0]} size={[0.21, 0.14, 0.03]} color="#e2d6b6" />
              </>
            )}
          </group>
        ))}
      {energy >= 45 &&
        region.plots
          .filter((p) => p.kind === 'factory' && p.stage === 4)
          .slice(0, 4)
          .map((p) => (
            <group key={p.id} position={[p.x * 1.4 + 0.25, 1.8, p.z * 1.4 - 0.15]}>
              {[0, 1, 2].map((i) => (
                <mesh key={i} position={[i * 0.08, i * 0.18, 0]}>
                  <sphereGeometry args={[0.1 + i * 0.04, 5, 4]} />
                  <meshStandardMaterial color="#b9c5bb" transparent opacity={0.32 - i * 0.07} />
                </mesh>
              ))}
            </group>
          ))}
    </group>
  );
}
