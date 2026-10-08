'use client';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Component, useEffect, useState, type ReactNode } from 'react';
import type { OrthographicCamera } from 'three';
import type { Region, Republic } from '@republic/contracts';
import { Building } from './Buildings';
import { Landscape } from './Landscape';
import { ResourceLandmarks } from './ResourceLandmarks';
class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function Fallback({ region }: { region: Region }) {
  return (
    <div className="city-fallback">
      <div className="fallback-plots">
        {region.plots.map((p) => (
          <i key={p.id} style={{ height: 15 + p.height * 25, opacity: p.stage / 5 + 0.2 }} />
        ))}
      </div>
      <p>{region.name} · persistent 2D city map</p>
    </div>
  );
}
function FitCamera({ capital }: { capital: boolean }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const orthographic = camera as OrthographicCamera;
    orthographic.zoom = Math.min(size.width / (capital ? 26 : 21), size.height / (capital ? 17 : 14));
    orthographic.updateProjectionMatrix();
  }, [camera, size.width, size.height, capital]);
  return null;
}
export default function CityCanvas({ region, republic }: { region: Region; republic: Republic }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  const capital = region.id.endsWith('-0');
  const fallback = <Fallback region={region} />;
  return (
    <SceneBoundary fallback={fallback}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        orthographic
        camera={{ position: [13, 12, 15], zoom: capital ? 36 : 45, near: 0.1, far: 100 }}
        fallback={fallback}
        gl={{ antialias: true, alpha: false }}
      >
        <FitCamera capital={capital} />
        <color attach="background" args={['#6c8d8c']} />
        <fog attach="fog" args={['#6c8d8c', 27, 65]} />
        <ambientLight intensity={1.4} />
        <hemisphereLight args={['#e0e7d4', '#355559', 1.5]} />
        <directionalLight
          position={[-7, 15, 8]}
          intensity={3}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          shadow-bias={-0.001}
        />
        <Landscape
          capital={capital}
          infrastructure={region.infrastructure}
          energy={republic.metrics.energy}
          activity={region.development}
          reducedMotion={reducedMotion}
        />
        <ResourceLandmarks resources={republic.resources} capital={capital} />
        {region.plots.map((plot) => (
          <Building key={`${region.id}-${plot.id}-${plot.stage}`} plot={plot} />
        ))}
        <OrbitControls
          makeDefault
          enablePan={false}
          minZoom={12}
          maxZoom={65}
          minPolarAngle={0.35}
          maxPolarAngle={1.25}
          target={[0, 0.2, 0]}
        />
      </Canvas>
    </SceneBoundary>
  );
}
