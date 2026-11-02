import { motion, AnimatePresence } from 'framer-motion';
import { ptrColor } from '../../lib/pointers';

const R = 122;
const SLOT_R = 27;
const LX = 270;
const CELL = 52;
const LSTEP = 58;

const spring = { type: 'spring', stiffness: 150, damping: 22 };

const angle = (k, cap) => -Math.PI / 2 + (k * 2 * Math.PI) / cap;
const onRing = (k, cap, radius = R, shift = 0) => {
  const a = angle(k, cap) + shift;
  return { x: radius * Math.cos(a), y: radius * Math.sin(a) };
};

export default function QueueView({ data, step }) {
  const hl = step?.hl ?? {};
  const { cap, slots, front, rear, size } = data;
  const rearIdx = ((rear % cap) + cap) % cap;
  const width = LX + cap * LSTEP + 40;
  const extra = step?.ptr?.i;

  const markers = [
    { name: 'front', k: front, shift: -0.2 },
    { name: 'rear', k: rearIdx, shift: 0.2 },
  ];

  return (
    <svg className="view-svg" viewBox={`-215 -205 ${width + 215} 410`}>

      {/* ───── Dairəvi görünüş ───── */}
      <text className="q-title" x={0} y={-188}>
        Dairəvi görünüş
      </text>
      <circle className="q-ring" r={R} />
      <text className="q-center" y={-4}>
        size
      </text>
      <text className="q-center big" y={20}>
        {size} / {cap}
      </text>

      {slots.map((_, k) => {
        const p = onRing(k, cap);
        const ip = onRing(k, cap, R - 46);
        return (
          <g key={k}>
            <circle className={`q-slot ${slots[k] ? '' : 'empty'}`} cx={p.x} cy={p.y} r={SLOT_R} />
            <text className="q-idx" x={ip.x} y={ip.y} dy=".35em">
              {k}
            </text>
          </g>
        );
      })}

      <AnimatePresence>
        {slots.map((item, k) => {
          if (!item) return null;
          const p = onRing(k, cap);
          const s = hl[`s${k}`] || 'idle';
          return (
            <motion.g
              key={item.id}
              initial={{ x: p.x * 1.5, y: p.y * 1.5, opacity: 0, scale: 0.5 }}
              animate={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
              exit={{ x: p.x * 1.5, y: p.y * 1.5, opacity: 0, scale: 0.5, transition: { duration: 0.35 } }}
              transition={spring}
            >
              <circle className={`q-item st-${s}`} r={SLOT_R - 2} />
              <text className="q-text" dy=".35em" style={{ fontSize: String(item.value).length > 3 ? 12 : 15 }}>
                {item.value}
              </text>
            </motion.g>
          );
        })}
      </AnimatePresence>

      {/* empty slot highlight (rear yeni yerə keçəndə) */}
      {slots.map((item, k) =>
        !item && hl[`s${k}`] === 'target' ? (
          <circle key={`t${k}`} className="q-target" {...(({ x, y }) => ({ cx: x, cy: y }))(onRing(k, cap))} r={SLOT_R} />
        ) : null
      )}

      {markers.map(({ name, k, shift }) => {
        const lbl = onRing(k, cap, R + 62, shift * 1.6);
        const tip = onRing(k, cap, R + SLOT_R + 4, shift * 0.6);
        return (
          <motion.g key={name} initial={false} animate={{ opacity: size || name === 'rear' ? 1 : 0.5 }}>
            <motion.line
              stroke={ptrColor(name)}
              strokeWidth={2}
              initial={false}
              animate={{ x1: lbl.x * 0.93, y1: lbl.y * 0.93, x2: tip.x, y2: tip.y }}
              transition={spring}
            />
            <motion.circle r={4} fill={ptrColor(name)} initial={false} animate={{ cx: tip.x, cy: tip.y }} transition={spring} />
            <g className="svg-move" style={{ transform: `translate(${lbl.x}px, ${lbl.y}px)` }}>
              <rect x={-28} y={-11} width={56} height={22} rx={11} fill={ptrColor(name)} opacity={0.18} stroke={ptrColor(name)} />
              <text className="ptr-svg" dy=".35em" fill={ptrColor(name)}>
                {name}
              </text>
            </g>
          </motion.g>
        );
      })}

      {/* ───── Yaddaşdakı massiv ───── */}
      <text className="q-title" x={LX + (cap * LSTEP) / 2 - 6} y={-62}>
        Yaddaşda (massiv)
      </text>
      {slots.map((item, k) => {
        const s = hl[`s${k}`] || 'idle';
        return (
          <g key={k} transform={`translate(${LX + k * LSTEP}, -26)`}>
            <rect className={`q-cell ${item ? `st-${s}` : 'empty'} ${!item && s === 'target' ? 'st-target' : ''}`} width={CELL} height={CELL} rx={9} />
            <AnimatePresence>
              {item && (
                <motion.text
                  key={item.id}
                  className="q-text"
                  x={CELL / 2}
                  y={CELL / 2}
                  dy=".35em"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ fontSize: String(item.value).length > 3 ? 12 : 15 }}
                >
                  {item.value}
                </motion.text>
              )}
            </AnimatePresence>
            <text className="q-cell-idx" x={CELL / 2} y={CELL + 16}>
              {k}
            </text>
          </g>
        );
      })}

      {[
        { name: 'front', k: front, below: true },
        { name: 'rear', k: rearIdx, below: false },
        ...(extra != null ? [{ name: 'i', k: extra, below: true, level: 1 }] : []),
      ].map(({ name, k, below, level = 0 }) => (
        <g
          key={`lin-${name}`}
          className="svg-move"
          style={{ transform: `translate(${LX + k * LSTEP + CELL / 2}px, ${below ? 26 + 40 + level * 30 : -26 - 22}px)` }}
          opacity={size || name === 'rear' ? 1 : 0.5}
        >
          {level === 0 && <path d={below ? 'M -6 -12 L 0 -20 L 6 -12 Z' : 'M -6 12 L 0 20 L 6 12 Z'} fill={ptrColor(name)} />}
          <rect x={-26} y={-10} width={52} height={20} rx={10} fill={ptrColor(name)} opacity={0.18} stroke={ptrColor(name)} />
          <text className="ptr-svg" dy=".35em" fill={ptrColor(name)}>
            {name}
          </text>
        </g>
      ))}
    </svg>
  );
}
