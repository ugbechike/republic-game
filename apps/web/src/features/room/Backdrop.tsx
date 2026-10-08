import { Compass } from 'lucide-react';
export function Backdrop({ summit = false }: { summit?: boolean }) {
  return (
    <div className={`cinematic-backdrop ${summit ? 'summit-backdrop' : ''}`} aria-hidden="true">
      <div className="cinematic-art" />
      <div className="cinematic-shade" />
      <div className="atmosphere" />
      <div className="map-grid" />
    </div>
  );
}
export function GameBrand({ small = false }: { small?: boolean }) {
  return (
    <div className={`republic-brand ${small ? 'brand-small' : ''}`}>
      <span>
        <Compass strokeWidth={1.2} />
      </span>
      <div>
        REPUBLIC<small>NATIONS RISE ON BOLDER MINDS</small>
      </div>
    </div>
  );
}
