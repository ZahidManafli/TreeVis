import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch } from 'lucide-react';
import { layout, edgesOf } from '../lib/tree';

const R = 22;
const H_GAP = 58;
const V_GAP = 84;
const MIN_W = 640;
const MIN_H = 380;
const PAD_X = 60;
const PAD_TOP = 80;
const PAD_BOTTOM = 70;

const spring = { type: 'spring', stiffness: 160, damping: 22 };

function slotPos(pos, slot) {
  const p = pos[slot.parent];
  if (!p) return null;
  return { x: p.x + (slot.side === 'left' ? -1 : 1) * H_GAP * 0.62, y: p.y + V_GAP * 0.82 };
}

export default function TreeCanvas({ tree, step }) {
  const pos = useMemo(() => layout(tree, H_GAP, V_GAP), [tree]);
  const edges = useMemo(() => edgesOf(tree), [tree]);
  const ids = Object.keys(pos);

  const states = step?.states ?? {};
  const order = step?.order ?? {};
  const trail = useMemo(() => new Set(step?.trail ?? []), [step]);
  const current = step?.current != null && pos[step.current] ? step.current : null;
  const slot = step?.slot ? slotPos(pos, step.slot) : null;
  const ghost = step?.ghost && current ? step.ghost : null;

  // Görünüş sahəsini ağaca uyğunlaşdırırıq (kiçik ağac nəhəng görünməsin deyə minimum ölçü ilə).
  const viewBox = useMemo(() => {
    const pts = Object.values(pos);
    if (slot) pts.push(slot);
    if (!pts.length) return `0 0 ${MIN_W} ${MIN_H}`;
    const minX = Math.min(...pts.map((p) => p.x));
    const maxX = Math.max(...pts.map((p) => p.x));
    const maxY = Math.max(...pts.map((p) => p.y));
    let w = maxX - minX + PAD_X * 2;
    let h = maxY + PAD_TOP + PAD_BOTTOM;
    let x = minX - PAD_X;
    let y = -PAD_TOP;
    if (w < MIN_W) {
      x -= (MIN_W - w) / 2;
      w = MIN_W;
    }
    if (h < MIN_H) {
      y -= (MIN_H - h) / 2;
      h = MIN_H;
    }
    return `${x} ${y} ${w} ${h}`;
  }, [pos, slot]);

  if (!ids.length && !slot) {
    return (
      <div className="canvas-empty">
        <div className="empty-icon">
          <GitBranch size={28} />
        </div>
        <h3>Ağac boşdur</h3>
        <p>Dəyər daxil edib <b>Insert</b> edin və ya <b>BST qur</b> ilə massivdən ağac yaradın.</p>
      </div>
    );
  }

  const cur = current ? pos[current] : null;

  return (
    <motion.svg className="tree-svg" initial={false} animate={{ viewBox }} transition={{ duration: 0.55, ease: 'easeInOut' }}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="nodeShine" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Kənarlar */}
      <g>
        <AnimatePresence>
          {edges.map(({ parent, child }) => {
            const a = pos[parent];
            const b = pos[child];
            const active = trail.has(parent) && trail.has(child);
            return (
              <motion.line
                key={child}
                className={`edge ${active ? 'edge-active' : ''}`}
                initial={{ x1: a.x, y1: a.y, x2: a.x, y2: a.y, opacity: 0 }}
                animate={{ x1: a.x, y1: a.y, x2: b.x, y2: b.y, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={spring}
              />
            );
          })}
        </AnimatePresence>
      </g>

      {/* Boş (null) yer göstəricisi */}
      <AnimatePresence>
        {slot && (
          <motion.g
            key={`${step.slot.parent}-${step.slot.side}`}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <line
              className="slot-edge"
              x1={pos[step.slot.parent].x}
              y1={pos[step.slot.parent].y}
              x2={slot.x}
              y2={slot.y}
            />
            <circle className="slot" cx={slot.x} cy={slot.y} r={R - 5} />
            <text className="slot-label" x={slot.x} y={slot.y} dy=".35em">
              null
            </text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* Düyünlər */}
      <AnimatePresence>
        {ids.map((id) => {
          const n = tree.nodes[id];
          const p = pos[id];
          const s = states[id] || 'idle';
          const label = String(n.value);
          return (
            <motion.g
              key={id}
              initial={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
              animate={{ x: p.x, y: p.y, scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.35 } }}
              transition={spring}
            >
              {(s === 'found' || s === 'new') && <circle className={`pulse pulse-${s}`} r={R} />}
              <circle className={`node node-${s}`} r={R} filter={['found', 'new', 'target', 'removing'].includes(s) ? 'url(#glow)' : undefined} />
              <circle r={R - 2} fill="url(#nodeShine)" pointerEvents="none" />
              <AnimatePresence mode="popLayout">
                <motion.text
                  key={label}
                  className="node-label"
                  style={{ fontSize: label.length > 3 ? 12 : label.length > 2 ? 14 : 16 }}
                  dy=".35em"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3 }}
                >
                  {label}
                </motion.text>
              </AnimatePresence>
              {order[id] && (
                <g transform={`translate(${R * 0.78}, ${-R * 0.78})`}>
                  <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <circle className="order-badge" r={9.5} />
                    <text className="order-text" dy=".35em">
                      {order[id]}
                    </text>
                  </motion.g>
                </g>
              )}
            </motion.g>
          );
        })}
      </AnimatePresence>

      {/* Kursor: düyündən düyünə hərəkət edən halqa */}
      {cur && (
        <motion.circle
          className="cursor"
          r={R + 7}
          initial={false}
          animate={{ cx: cur.x, cy: cur.y }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
      )}

      {/* Müqayisə balonu */}
      <AnimatePresence>
        {ghost && cur && (
          <motion.g
            key="ghost"
            initial={{ opacity: 0, x: cur.x, y: cur.y - R - 30 }}
            animate={{ opacity: 1, x: cur.x, y: cur.y - R - 30 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          >
            <Ghost ghost={ghost} />
          </motion.g>
        )}
      </AnimatePresence>
    </motion.svg>
  );
}

function Ghost({ ghost }) {
  const arrow = ghost.dir === 'left' ? '↙' : ghost.dir === 'right' ? '↘' : '';
  const text = `${ghost.text}${arrow ? '  ' + arrow : ''}`;
  const w = text.length * 8.2 + 22;
  const tone = ghost.tone || 'cmp';
  return (
    <motion.g key={text} initial={{ scale: 0.7 }} animate={{ scale: 1 }}>
      <rect className={`ghost ghost-${tone}`} x={-w / 2} y={-15} width={w} height={30} rx={15} />
      <path className={`ghost-tail ghost-${tone}`} d="M -6 14 L 0 21 L 6 14 Z" />
      <text className="ghost-text" dy=".35em">
        {text}
      </text>
    </motion.g>
  );
}
