import { motion } from 'framer-motion';
import { Boxes, PanelLeftClose, PanelLeftOpen, Keyboard } from 'lucide-react';
import { DTYPES } from '../lib/values';

export default function NavRail({ items, active, onSelect, dtype, onDtype, collapsed, onCollapse }) {
  return (
    <nav className={`rail ${collapsed ? 'collapsed' : ''}`}>
      <div className="rail-brand">
        <div className="brand-logo">
          <Boxes size={20} />
        </div>
        <div className="rail-text">
          <h1>DSVis</h1>
          <span>Data Structures Visualizer</span>
        </div>
        <button className="icon-btn ghost rail-collapse" onClick={onCollapse} title={collapsed ? 'Paneli aç' : 'Paneli yığ'}>
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      <div className="rail-section">
        <span className="rail-label">Data strukturları</span>
        <div className="rail-items">
          {items.map((s) => {
            const Icon = s.icon;
            const on = s.id === active;
            return (
              <button key={s.id} className={`rail-item ${on ? 'on' : ''}`} onClick={() => onSelect(s.id)} title={s.label}>
                {on && <motion.span layoutId="rail-active" className="rail-active" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <span className="rail-icon">
                  <Icon size={18} />
                </span>
                <span className="rail-text">
                  <b>{s.label}</b>
                  <small>{s.short}</small>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rail-section rail-dtype">
        <span className="rail-label">Data tipi</span>
        <div className="dtype-switch">
          {DTYPES.map((t) => (
            <button key={t.id} className={dtype === t.id ? 'on' : ''} onClick={() => onDtype(t.id)} title={t.hint}>
              <span className="dtype-badge">{t.badge}</span>
              <span className="rail-text">{t.label}</span>
            </button>
          ))}
        </div>
        <p className="rail-hint rail-text">{DTYPES.find((t) => t.id === dtype).hint}</p>
      </div>

      <div className="rail-foot rail-text">
        <Keyboard size={14} />
        <span>
          <kbd>Space</kbd> oynat · <kbd>←</kbd>
          <kbd>→</kbd> addım
        </span>
      </div>
    </nav>
  );
}
