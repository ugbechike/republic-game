import type { Resource } from '@republic/contracts';
import { Block } from './Buildings';
import { Tree } from './Landscape';
export function ResourceLandmarks({ resources, capital }: { resources: Resource[]; capital: boolean }) {
  const edge = capital ? 6 : 4.5;
  return (
    <>
      {resources.map((resource, i) => (
        <group key={resource} position={[-edge + (i % 3) * 2.8, 0, edge + 1 + Math.floor(i / 3) * 2.5]}>
          <Block at={[0, -0.12, 0]} size={[2.5, 0.45, 2.2]} color={resource === 'coastline' ? '#b2aa7f' : '#6e8259'} />
          {resource === 'timber' ? (
            <>
              {[0, 1, 2, 3, 4].map((n) => (
                <Tree key={n} x={(n % 3) * 0.6 - 0.6} z={Math.floor(n / 3) * 0.7 - 0.4} />
              ))}
            </>
          ) : resource === 'agriculture' ? (
            <>
              {[0, 1, 2, 3, 4].map((n) => (
                <Block
                  key={n}
                  at={[0, 0.15, n * 0.35 - 0.7]}
                  size={[2, 0.12, 0.16]}
                  color={n % 2 ? '#c3ad62' : '#83a45e'}
                />
              ))}
            </>
          ) : resource === 'rivers' ? (
            <>
              <Block at={[0, 0.12, 0]} size={[2.4, 0.04, 0.7]} color="#619ba6" />
              <Block at={[0, 0.3, 0]} size={[0.3, 0.5, 1.1]} color="#a8b3a1" />
            </>
          ) : resource === 'coastline' ? (
            <>
              <Block at={[0, 0.16, 0]} size={[2, 0.15, 0.35]} color="#c2b798" />
              <Block at={[0.6, 0.65, 0]} size={[0.08, 1, 0.08]} color="#d5b774" />
              <Block at={[0.25, 1.1, 0]} size={[0.8, 0.07, 0.07]} color="#d5b774" />
            </>
          ) : resource === 'uranium' || resource === 'gas' ? (
            <>
              {[-0.5, 0.5].map((x) => (
                <mesh key={x} position={[x, 0.65, 0]} castShadow>
                  <cylinderGeometry args={[resource === 'uranium' ? 0.35 : 0.16, 0.38, 1.1, 12]} />
                  <meshStandardMaterial color={resource === 'uranium' ? '#c8c9b4' : '#91a7a5'} />
                </mesh>
              ))}
            </>
          ) : resource === 'oil' ? (
            <>
              <Block at={[0, 0.7, 0]} size={[0.15, 1.3, 0.15]} color="#314448" />
              <group rotation={[0, 0, 0.25]} position={[0, 1.35, 0]}>
                <Block at={[0, 0, 0]} size={[1.6, 0.15, 0.15]} color="#d2ad68" />
              </group>
              <Block at={[-0.6, 0.6, 0]} size={[0.07, 1.1, 0.07]} color="#4c5350" />
            </>
          ) : (
            <mesh position={[0, 0.3, 0]}>
              <coneGeometry args={[0.9, 0.8, 5]} />
              <meshStandardMaterial
                color={resource === 'gold' ? '#c3a04d' : resource === 'iron' ? '#956957' : '#67858d'}
              />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}
