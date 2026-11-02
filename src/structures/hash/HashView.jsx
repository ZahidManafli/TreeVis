import { motion, AnimatePresence } from 'framer-motion';
import { ptrColor } from '../../lib/pointers';

const spring = { type: 'spring', stiffness: 260, damping: 26 };

function ChainView({ data, hl }) {
  return (
    <div className="hash-chain">
      {data.buckets.map((bucket, k) => (
        <div key={k} className="hb-row">
          <div className={`hb-idx st-${hl[`b${k}`] || 'idle'}`}>{k}</div>
          <span className="hb-link" />
          <AnimatePresence initial={false}>
            {bucket.map((x) => (
              <motion.div
                key={x.id}
                layout
                className="hb-node-wrap"
                initial={{ opacity: 0, x: -16, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.7, transition: { duration: 0.3 } }}
                transition={spring}
              >
                <div className={`hb-node st-${hl[x.id] || 'idle'}`}>{x.value}</div>
                <span className="hb-arrow">→</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <motion.span layout className="hb-null">
            null
          </motion.span>
        </div>
      ))}
    </div>
  );
}

const CELL = 60;
const STEP = 68;

function ProbeView({ data, hl, ptr }) {
  const width = data.m * STEP - (STEP - CELL);
  const markers = [
    { name: 'h', pos: ptr.h, top: true },
    { name: 'j', pos: ptr.j, top: false },
  ].filter((p) => p.pos != null);

  return (
    <div className="hash-probe" style={{ width, height: CELL + 120 }}>
      {data.cells.map((c, k) => {
        const s = hl[`c${k}`] || 'idle';
        return (
          <div key={k} className="hp-col" style={{ left: k * STEP, width: CELL }}>
            <div className={`hp-cell ${c ? '' : 'empty'} ${c?.deleted ? 'tomb' : ''} st-${s}`} style={{ height: CELL }}>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={c ? c.id : 'empty'}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={spring}
                >
                  {c ? (c.deleted ? 'DEL' : c.value) : ''}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="hp-idx">{k}</span>
          </div>
        );
      })}
      {markers.map(({ name, pos, top }) => (
        <motion.div
          key={name}
          className={`ptr ${top ? 'ptr-top' : ''}`}
          style={{ '--pc': ptrColor(name), width: CELL }}
          initial={false}
          animate={{ x: pos * STEP, y: top ? -2 : CELL + 64 }}
          transition={spring}
        >
          {top ? (
            <>
              <span className="ptr-name">{name}</span>
              <span className="ptr-arrow">▼</span>
            </>
          ) : (
            <>
              <span className="ptr-arrow">▲</span>
              <span className="ptr-name">{name}</span>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default function HashView({ data, step }) {
  const hl = step?.hl ?? {};
  const ptr = step?.ptr ?? {};
  return (
    <div className="view-center column">
      {data.method === 'chain' ? <ChainView data={data} hl={hl} /> : <ProbeView data={data} hl={hl} ptr={ptr} />}
    </div>
  );
}
