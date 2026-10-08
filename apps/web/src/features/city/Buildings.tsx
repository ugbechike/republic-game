import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { Plot } from '@republic/contracts';
type Vec = [number, number, number];
export function Block({ at, size, color, ...rest }: { at: Vec; size: Vec; color: string; castShadow?: boolean; receiveShadow?: boolean }) {
  return <mesh position={at} {...rest}><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={.8} /></mesh>;
}
function Tower({ height, variant }: { height: number; variant: number }) {
  return <><Block at={[0, height / 2, 0]} size={[.65, height, .62]} color={variant % 2 ? '#9caeab' : '#76918d'} castShadow />
    <Block at={[0, height + .04, 0]} size={[.7, .08, .67]} color="#c7c9b2" />
    {Array.from({ length: Math.floor(height * 5) }, (_, i) => <group key={i}><Block at={[.329, .16 + i * .2, 0]} size={[.015, .08, .48]} color={i % 3 === 0 ? '#e9d292' : '#324f54'} /><Block at={[0, .16 + i * .2, .319]} size={[.5, .08, .015]} color={i % 4 === 0 ? '#e9d292' : '#324f54'} /></group>)}
    <Block at={[0, height + .13, 0]} size={[.3, .18, .25]} color="#486062" /></>;
}
function Home({ variant }: { variant: number }) {
  return <><Block at={[0, .24, 0]} size={[.66, .48, .6]} color={variant % 3 ? '#c5c3a5' : '#ded3b1'} castShadow /><mesh position={[0, .55, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[.56, .27, 4]} /><meshStandardMaterial color={variant % 2 ? '#ac7252' : '#637c79'} /></mesh><Block at={[.16, .24, .306]} size={[.14, .18, .015]} color="#e5c978" /><Block at={[-.14, .18, .306]} size={[.12, .35, .018]} color="#4b635d" /></>;
}
function Factory() {
  return <><Block at={[0, .28, 0]} size={[.85, .56, .62]} color="#a5a48b" castShadow /><Block at={[0, .59, 0]} size={[.9, .07, .7]} color="#6f8179" /><Block at={[.25, .95, -.15]} size={[.12, 1.3, .12]} color="#ad947d" /><Block at={[-.26, .84, -.15]} size={[.12, 1, .12]} color="#bca78e" /><Block at={[0, .27, .32]} size={[.63, .17, .02]} color="#4c6467" /></>;
}
function Civic() {
  return <><Block at={[0, .16, 0]} size={[1.05, .32, .8]} color="#ddd4ac" castShadow /><Block at={[0, .38, 0]} size={[.8, .18, .7]} color="#eee2bb" />{[-.3, -.1, .1, .3].map(x => <Block key={x} at={[x, .28, .42]} size={[.05, .35, .05]} color="#f3e8c9" />)}<mesh position={[0, .56, 0]}><sphereGeometry args={[.25, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#88b0a1" /></mesh><Block at={[0, .98, 0]} size={[.025, .6, .025]} color="#ebd8a5" /><Block at={[.11, 1.16, 0]} size={[.22, .14, .02]} color="#dec58b" /></>;
}
function Farm() { return <><Block at={[0, .02, 0]} size={[.96, .04, .9]} color="#7b8660" />{[-.32, -.16, 0, .16, .32].map(z => <Block key={z} at={[0, .08, z]} size={[.9, .12, .045]} color="#b6b774" />)}<Block at={[.25, .26, -.25]} size={[.27, .45, .3]} color="#ba9b6d" /></>; }
export function Building({ plot }: { plot: Plot }) {
  const group = useRef<Group>(null);
  useFrame((_state, dt) => { if (group.current) group.current.scale.y += (1 - group.current.scale.y) * Math.min(1, dt * 2); });
  return <group position={[plot.x * 1.4, .18, plot.z * 1.4]}>
    <Block at={[0, -.03, 0]} size={[1.12, .06, 1.12]} color="#88967b" receiveShadow />
    {plot.stage === 0 ? <Block at={[0, .02, 0]} size={[.65, .04, .6]} color="#877d62" /> : plot.stage < 4 ? <group><Block at={[0, plot.stage * .16, 0]} size={[.65, plot.stage * .32, .6]} color="#a99b7e" />{[-.3, .3].map(x => <Block key={x} at={[x, .6, .3]} size={[.04, 1.2, .04]} color="#d1b784" />)}<Block at={[.48, 1, 0]} size={[.035, 2, .035]} color="#dfb964" /><Block at={[.1, 1.9, 0]} size={[1.1, .05, .05]} color="#dfb964" /></group> : <group ref={group} scale={[1, .98, 1]}>{plot.kind === 'tower' ? <Tower height={plot.height} variant={plot.id} /> : plot.kind === 'factory' ? <Factory /> : plot.kind === 'civic' ? <Civic /> : plot.kind === 'farm' ? <Farm /> : <Home variant={plot.id} />}</group>}
  </group>;
}
