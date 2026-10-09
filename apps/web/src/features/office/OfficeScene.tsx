import { BookOpen, ChartNoAxesCombined, Globe2, Phone, Shield, ArrowUpRight, MapPin } from 'lucide-react';
import type { RoomView } from '@republic/contracts';
import { FlagBanner } from '../../components/FlagBanner';
import { date } from '../game/format';
export type OfficeArea = 'inbox' | 'economy' | 'security' | 'cabinet' | 'foreign';
export function OfficeScene({
  w,
  open,
  world,
  republic,
  urgent,
  meetingCount = 0,
}: {
  w: RoomView;
  open: (area: OfficeArea) => void;
  world: () => void;
  republic: () => void;
  urgent: number;
  meetingCount?: number;
}) {
  return (
    <section className="office-environment" aria-label="President's Office">
      <div className="office-art" />
      <div className="office-sunlight" />
      <div className="office-dust" />
      <div className="office-shade" />
      <div className="office-day">
        <span className="kicker">THE EXECUTIVE RESIDENCE</span>
        <h1>
          Good morning,
          <br />
          President {w.me.leader}.
        </h1>
        <p>
          {date(w.month)} <i /> A nation awaits your decisions.
        </p>
      </div>
      <button className="office-object wall-map" onClick={world}>
        <Globe2 />
        <span>
          WORLD MAP<small>Rivals, partners, possibilities</small>
        </span>
        <ArrowUpRight size={15} />
      </button>
      <button className="office-object capital-window" onClick={republic}>
        <MapPin />
        <span>
          YOUR REPUBLIC<small>Look beyond the window</small>
        </span>
        <ArrowUpRight size={15} />
      </button>
      <button
        className={`office-object desk-correspondence ${urgent ? 'attention' : ''}`}
        onClick={() => open('inbox')}
      >
        <BookOpen />
        <span>
          CORRESPONDENCE
          <small>
            {urgent ? `${urgent} ${urgent === 1 ? 'matter' : 'matters'} on your desk` : 'Your presidential inbox'}
          </small>
        </span>
        {urgent > 0 && <b>{urgent}</b>}
      </button>
      <button className="office-object desk-economy" onClick={() => open('economy')}>
        <ChartNoAxesCombined />
        <span>
          ECONOMIC BRIEF<small>What is moving the nation</small>
        </span>
      </button>
      <button
        className={`office-object secure-phone ${meetingCount ? 'attention' : ''}`}
        onClick={() => open('foreign')}
      >
        <Phone />
        <span>
          SECURE LINE
          <small>{meetingCount ? `${meetingCount} President waiting` : 'Speak with another President'}</small>
        </span>
      </button>
      <button className="office-object cabinet-books" onClick={() => open('cabinet')}>
        <Shield />
        <span>
          CABINET<small>Policy & national security</small>
        </span>
      </button>
      <div className="office-nameplate">
        <FlagBanner flag={w.me.flag} />
        <span>
          {w.me.name}
          <small>OFFICE OF THE PRESIDENT</small>
        </span>
      </div>
    </section>
  );
}
