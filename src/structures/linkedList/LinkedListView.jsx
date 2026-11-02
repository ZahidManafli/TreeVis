import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ptrColor, groupPointers } from '../../lib/pointers';
import { traverse } from './algorithms';

const W_VAL = 58;
const W_NEXT = 28;
const W = W_VAL + W_NEXT;
const H = 44;
const GAP = 58;
const STEP = W + GAP;
const RAISE = 104;

const spring = { type: 'spring', stiffness: 170, damping: 22 };

// Bütün oxlar eyni formada (M … C …) — framer-motion onları hamar şəkildə interpolyasiya edə bilsin.
function arrowPath(a, b) {
  const sx = a.x + W_VAL + W_NEXT / 2;
  const sy = a.y + H / 2;
  if (b.x > a.x + W) {
    const tx = b.x;
    const ty = b.y + H / 2;
    const dx = tx - sx;
    if (dx > STEP && Math.abs(ty - sy) < 1) {
      // Aradakı düyünün üstündən keçən ox (silmə zamanı)
      return `M ${sx} ${sy} C ${sx + 40} ${sy - 110}, ${tx - 40} ${ty - 110}, ${tx} ${ty - 6}`;
    }
    return `M ${sx} ${sy} C ${sx + dx * 0.55} ${sy}, ${tx - dx * 0.55} ${ty}, ${tx} ${ty}`;
  }
  // Geriyə baxan ox (reverse zamanı) — aşağıdan əyilir
  const tx = b.x + W / 2;
  const ty = b.y + H;
  return `M ${sx} ${sy + 8} C ${sx + 20} ${sy + 110}, ${tx + 10} ${ty + 90}, ${tx} ${ty + 2}`;
}

export default function LinkedListView({ data, step }) {
  const hl = step?.hl ?? {};
  const { nodes, order, head } = data;

  const pos = useMemo(() => {
    const p = {};
    order.forEach((id, k) => (p[id] = { x: k * STEP, y: data.raised.includes(id) ? -RAISE : 0 }));
    return p;
  }, [order, data.raised]);

  const indexOf = useMemo(() => {
    const m = {};
    traverse(data).forEach((id, k) => (m[id] = k));
    return m;
  }, [data]);

  const width = Math.max(order.length * STEP - GAP, W);
  const vbW = Math.max(width + 160, 620);
  const vbX = -(vbW - width) / 2;
  const viewBox = `${vbX} ${-RAISE - 70} ${vbW} ${RAISE + H + 210}`;

  const groups = groupPointers(step?.ptr);

  return (
    <motion.svg className="view-svg" initial={false} animate={{ viewBox }} transition={{ duration: 0.5 }}>
      <defs>
        <marker id="ll-head" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="ll-arrowhead" />
        </marker>
      </defs>

      {order.length === 0 && (
        <g>
          <text className="ll-empty" x={W / 2} y={H / 2} dy=".35em">
            head → null · siyahı boşdur
          </text>
        </g>
      )}

      {/* next oxları */}
      <AnimatePresence>
        {order.map((id) => {
          const n = nodes[id];
          if (n.next == null || !pos[n.next]) return null;
          return (
            <motion.path
              key={id}
              className={`ll-arrow ${hl[id] === 'sorted' ? 'flipped' : ''}`}
              markerEnd="url(#ll-head)"
              initial={{ d: arrowPath(pos[id], pos[n.next]), opacity: 0 }}
              animate={{ d: arrowPath(pos[id], pos[n.next]), opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={spring}
            />
          );
        })}
      </AnimatePresence>

      {/* Düyünlər */}
      <AnimatePresence>
        {order.map((id) => {
          const n = nodes[id];
          const p = pos[id];
          const s = hl[id] || 'idle';
          const label = String(n.value);
          return (
            <motion.g
              key={id}
              initial={{ x: p.x, y: p.y - 40, opacity: 0 }}
              animate={{ x: p.x, y: p.y, opacity: 1 }}
              exit={{ y: p.y + 60, opacity: 0, transition: { duration: 0.35 } }}
              transition={spring}
            >
              <rect className={`ll-box st-${s}`} width={W} height={H} rx={9} />
              <rect className="ll-next" x={W_VAL} y={1.5} width={W_NEXT - 1.5} height={H - 3} rx={7} />
              <line className="ll-div" x1={W_VAL} y1={0} x2={W_VAL} y2={H} />
              <text className="ll-text" x={W_VAL / 2} y={H / 2} dy=".35em" style={{ fontSize: label.length > 3 ? 13 : 16 }}>
                {label}
              </text>
              {n.next == null ? (
                <line className="ll-null" x1={W_VAL + 6} y1={H - 8} x2={W - 6} y2={8} />
              ) : (
                <circle className="ll-dot" cx={W_VAL + W_NEXT / 2} cy={H / 2} r={3.5} />
              )}
              {indexOf[id] != null && !data.raised.includes(id) && (
                <text className="ll-idx" x={W / 2} y={-10}>
                  [{indexOf[id]}]
                </text>
              )}
            </motion.g>
          );
        })}
      </AnimatePresence>

      {/* head göstəricisi */}
      {head != null && pos[head] && (
        <g className="svg-move" style={{ transform: `translate(${pos[head].x}px, ${pos[head].y}px)` }}>
          <text className="ll-headlbl" x={-18} y={H / 2} dy=".35em" textAnchor="end">
            head
          </text>
          <path className="ll-headarrow" d={`M -14 ${H / 2} L -3 ${H / 2}`} markerEnd="url(#ll-head)" />
        </g>
      )}

      {/* Göstəricilər: cur, prev, next, node, slow, fast */}
      <AnimatePresence>
        {Object.entries(groups).flatMap(([id, names]) =>
          pos[id]
            ? names.map((name, level) => (
                <motion.g
                  key={name}
                  initial={{ opacity: 0, x: pos[id].x + W / 2, y: pos[id].y + H + 30 + level * 24 }}
                  animate={{ opacity: 1, x: pos[id].x + W / 2, y: pos[id].y + H + 30 + level * 24 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                >
                  {level === 0 && <path d="M -6 -12 L 0 -20 L 6 -12 Z" fill={ptrColor(name)} />}
                  <rect x={-24} y={-9} width={48} height={18} rx={9} fill={ptrColor(name)} opacity={0.18} stroke={ptrColor(name)} />
                  <text className="ptr-svg" dy=".35em" fill={ptrColor(name)}>
                    {name}
                  </text>
                </motion.g>
              ))
            : []
        )}
      </AnimatePresence>
    </motion.svg>
  );
}
