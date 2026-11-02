import { motion, AnimatePresence } from 'framer-motion';
import { PseudoCode, InfoPanel, VarsPanel, StepLog } from './SidePanels';
import { PlayerBar } from './Overlays';

export function WorkspaceHeader({ icon: Icon, title, tagline, dtype, center, actions }) {
  return (
    <header className="ws-header">
      <div className="ws-title">
        <div className="ws-icon">
          <Icon size={20} />
        </div>
        <div className="ws-title-text">
          <h1>
            {title}
            {dtype && <span className={`dtype-chip ${dtype}`}>{dtype === 'int' ? 'int' : 'string'}</span>}
          </h1>
          <span>{tagline}</span>
        </div>
      </div>
      {center && <div className="ws-center">{center}</div>}
      <div className="top-actions">{actions}</div>
    </header>
  );
}

export function AlgoSidebar({ algoKey, pseudo, info, player }) {
  const code = pseudo[algoKey];
  return (
    <aside className="sidebar">
      <PseudoCode code={code} activeLine={player.step?.line} />
      <InfoPanel info={info[algoKey]} title={code?.title} idle={!player.anim} />
      <VarsPanel vars={player.step?.vars} />
      <StepLog steps={player.anim?.steps ?? []} index={player.index} onJump={player.seek} />
    </aside>
  );
}

export function Player({ player }) {
  return (
    <PlayerBar
      total={player.anim?.steps.length ?? 0}
      index={player.index}
      playing={player.playing}
      speed={player.speed}
      onPlay={player.togglePlay}
      onStep={player.stepBy}
      onSeek={player.seek}
      onSpeed={player.setSpeed}
    />
  );
}

// Müqayisə / düstur balonu (məs. "h(cat) = 312 mod 7 = 4" və ya "15 < 40").
export function Badge({ badge }) {
  return (
    <div className="badge-wrap">
      <AnimatePresence mode="wait">
        {badge && (
          <motion.div
            key={badge.text}
            className={`calc-badge tone-${badge.tone || 'cmp'}`}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
          >
            {badge.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Legend({ items, prefix = 'st-' }) {
  return (
    <div className="legend">
      {items.map(([k, label]) => (
        <span key={k} className="legend-item">
          <i className={`legend-dot ${prefix}${k}`} />
          {label}
        </span>
      ))}
    </div>
  );
}
