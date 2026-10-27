import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Gauge, Check, X } from 'lucide-react';

export function PlayerBar({ total, index, playing, speed, onPlay, onStep, onSeek, onSpeed }) {
  const disabled = total === 0;
  const pct = total > 1 ? (index / (total - 1)) * 100 : total ? 100 : 0;
  return (
    <div className="card player">
      <div className="player-btns">
        <button className="icon-btn" onClick={() => onSeek(0)} disabled={disabled} title="Əvvələ">
          <SkipBack size={16} />
        </button>
        <button className="icon-btn" onClick={() => onStep(-1)} disabled={disabled || index === 0} title="Əvvəlki addım (←)">
          <ChevronLeft size={18} />
        </button>
        <button className="play-btn" onClick={onPlay} disabled={disabled} title="Oynat / Dayandır (Space)">
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button className="icon-btn" onClick={() => onStep(1)} disabled={disabled || index >= total - 1} title="Növbəti addım (→)">
          <ChevronRight size={18} />
        </button>
        <button className="icon-btn" onClick={() => onSeek(total - 1)} disabled={disabled} title="Sona">
          <SkipForward size={16} />
        </button>
      </div>

      <div className="progress">
        <input
          type="range"
          min={0}
          max={Math.max(total - 1, 0)}
          value={index}
          disabled={disabled}
          onChange={(e) => onSeek(+e.target.value)}
          style={{ '--pct': `${pct}%` }}
        />
        <span className="progress-label">{total ? `${index + 1} / ${total}` : '— / —'}</span>
      </div>

      <div className="speed">
        <Gauge size={16} />
        <input
          type="range"
          min={0.25}
          max={4}
          step={0.25}
          value={speed}
          onChange={(e) => onSpeed(+e.target.value)}
          style={{ '--pct': `${((speed - 0.25) / 3.75) * 100}%` }}
        />
        <span className="speed-label">{speed.toFixed(2).replace(/\.?0+$/, '')}×</span>
      </div>
    </div>
  );
}

export function ArrayStrip({ meta }) {
  if (!meta) return null;
  const { array, ai, done, skipped, range } = meta;
  return (
    <motion.div className="array-strip" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <span className="strip-label">A[ ]</span>
      {range && (
        <span className="strip-range">
          lo={range[0]} hi={range[1]}
        </span>
      )}
      <div className="array-cells">
        {array.map((v, i) => {
          const out = range && (i < range[0] || i > range[1]);
          const cls = i === ai ? 'cur' : done.includes(i) ? 'done' : skipped.includes(i) ? 'skip' : '';
          return (
            <motion.div
              key={i}
              className={`array-cell ${cls} ${out ? 'out' : ''} ${range && !out ? 'in-range' : ''}`}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ y: i === ai ? -6 : 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <span className="cell-v">{v}</span>
              <span className="cell-i">{i}</span>
              {done.includes(i) && i !== ai && (
                <span className="cell-badge ok">
                  <Check size={9} strokeWidth={3} />
                </span>
              )}
              {skipped.includes(i) && i !== ai && (
                <span className="cell-badge bad">
                  <X size={9} strokeWidth={3} />
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function VisitStrip({ visited }) {
  if (!visited?.length) return null;
  return (
    <div className="visit-strip">
      <span className="strip-label">Ziyarət ardıcıllığı</span>
      <div className="visit-items">
        <AnimatePresence initial={false}>
          {visited.map((v, i) => (
            <motion.span
              key={i}
              className="visit-chip"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              {i > 0 && <span className="visit-arrow">→</span>}
              {v}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function StatusMessage({ step }) {
  return (
    <div className="status-wrap">
      <AnimatePresence mode="wait">
        {step && (
          <motion.div
            key={step.msg + step.line}
            className={`status kind-${step.kind}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {step.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const LEGEND = [
  ['path', 'Yol'],
  ['compare', 'Müqayisə'],
  ['queued', 'Növbədə'],
  ['visited', 'Ziyarət edilib'],
  ['found', 'Tapıldı'],
  ['new', 'Yeni'],
  ['target', 'Hədəf'],
  ['succ', 'Varis'],
  ['removing', 'Silinir'],
];

export function Legend() {
  return (
    <div className="legend">
      {LEGEND.map(([k, label]) => (
        <span key={k} className="legend-item">
          <i className={`legend-dot node-${k}`} />
          {label}
        </span>
      ))}
    </div>
  );
}

export function Toast({ toast }) {
  return (
    <div className="toast-wrap">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
