import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';
import { Block } from './Buildings';
export function Tree({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return <group position={[x, .2, z]} scale={scale}><Block at={[0, .2, 0]} size={[.07, .4, .07]} color="#695f42" /><mesh position={[0, .5, 0]} castShadow><icosahedronGeometry args={[.28, 0]} /><meshStandardMaterial color="#527b5d" /></mesh><mesh position={[0, .74, 0]}><icosahedronGeometry args={[.2, 0]} /><meshStandardMaterial color="#749565" /></mesh></group>;
}
function Car({ index, activity }: { index: number; activity: number }) {
  const car = useRef<Group>(null);
  useFrame(({ clock }) => { if (!car.current) return; const t = ((clock.elapsedTime * (.24 + activity / 400) + index * 2.1) % 18) - 9; car.current.position.x = index % 2 ? t : -t; });
  return <group ref={car} position={[0, .23, (index % 7 - 3) * 1.4 + .65]}><Block at={[0, 0, 0]} size={[.18, .09, .08]} color={['#e7d5ae', '#ab6652', '#638785'][index % 3]} /><Block at={[.02, .065, 0]} size={[.08, .04, .075]} color="#bdd1c0" /></group>;
}
function Windmill({ x, z }: { x: number; z: number }) {
  const rotor = useRef<Group>(null);
  useFrame((_s, dt) => { if (rotor.current) rotor.current.rotation.z += dt * .6; });
  return <group position={[x, 0, z]}><Block at={[0, .75, 0]} size={[.06, 1.5, .06]} color="#d0d9c2" /><group position={[0, 1.5, .07]} ref={rotor}>{[0, 1, 2].map(i => <group key={i} rotation={[0, 0, i * Math.PI * 2 / 3]}><Block at={[0, .26, 0]} size={[.055, .52, .03]} color="#e5e8d1" /></group>)}</group></group>;
}
function Water() {
  const water = useRef<Mesh>(null);
  useFrame(({ clock }) => { if (water.current) water.current.position.y = -.16 + Math.sin(clock.elapsedTime * .5) * .015; });
  return <mesh ref={water} position={[0, -.16, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[100, 100]} /><meshStandardMaterial color="#426f77" roughness={.35} metalness={.22} /></mesh>;
}
export function Landscape({ capital, infrastructure, energy, activity, reducedMotion }: { capital: boolean; infrastructure: number; energy: number; activity: number; reducedMotion: boolean }) {
  const width = capital ? 11 : 8;
  return <><Water /><Block at={[0, -.15, 0]} size={[width, .6, width]} color="#667e67" receiveShadow /><Block at={[0, .16, 0]} size={[width - .12, .025, width - .12]} color="#344b49" receiveShadow />
    {Array.from({ length: capital ? 8 : 6 }, (_, i) => { const p = (i - (capital ? 3.5 : 2.5)) * 1.4; return <group key={i}><Block at={[p, .182, 0]} size={[.27, .018, width - .1]} color={infrastructure > 45 ? '#576b64' : '#776e59'} /><Block at={[0, .183, p]} size={[width - .1, .018, .27]} color={infrastructure > 45 ? '#576b64' : '#776e59'} />{Array.from({ length: 12 }, (_, k) => <Block key={k} at={[(k - 5.5) * .8, .196, p]} size={[.16, .006, .013]} color="#a1ac8d" />)}</group>; })}
    {Array.from({ length: capital ? 24 : 16 }, (_, i) => { const edge = width / 2 - .24, x = i % 2 ? edge : -edge, z = (i / 2 - (capital ? 6 : 4)) * .8; return <Tree key={i} x={x} z={z} scale={.75 + i % 3 * .12} />; })}
    <Block at={[width / 2 + .6, -.06, .8]} size={[1.3, .2, 3.2]} color="#b6af8c" /><Block at={[width / 2 + 1.3, -.1, 1.5]} size={[1, .15, .2]} color="#a7a88b" />
    <Block at={[-width / 2 - 1.4, .05, -1.4]} size={[3, .12, .5]} color="#a5ad91" />
    {[-1, 1].map(z => <Block key={z} at={[-width / 2 - 1.3, -.2, -1.4 + z * .19]} size={[.13, .5, .1]} color="#768575" />)}
    {energy > 35 && <Windmill x={width / 2 - .5} z={-width / 2 + .5} />}
    {capital && <><mesh position={[-8, -.15, -7]}><coneGeometry args={[4, 3.5, 5]} /><meshStandardMaterial color="#647e6b" /></mesh><mesh position={[-5, -.3, -10]}><coneGeometry args={[5, 4, 5]} /><meshStandardMaterial color="#839380" /></mesh></>}
    {!reducedMotion && Array.from({ length: Math.max(3, Math.floor(activity / 7)) }, (_, i) => <Car key={i} index={i} activity={activity} />)}
  </>;
}
