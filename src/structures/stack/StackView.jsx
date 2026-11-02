import { motion, AnimatePresence } from 'framer-motion';

const GAP = 6;

const spring = { type: 'spring', stiffness: 220, damping: 24 };

export function ExprStrip({ expr }) {
  if (!expr) return null;
  return (
    <div className="expr-strip">
      <span className="strip-label">expr</span>
      <div className="expr-chars">
        {expr.chars.map((ch, k) => (
          <motion.span
            key={k}
            className={`expr-ch ${expr.status[k]} ${k === expr.at ? 'cur' : ''}`}
            animate={{ y: k === expr.at ? -5 : 0 }}
            transition={spring}
          >
            {ch}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export default function StackView({ data, step }) {
  const hl = step?.hl ?? {};
  const cap = data.cap;
  const SLOT_H = cap > 8 ? 30 : 44;
  const ROW = SLOT_H + GAP;
  const n = data.items.length;
  const top = step?.ptr?.top ?? n - 1;
  const height = cap * ROW - GAP;
  const yOf = (k) => (cap - 1 - k) * ROW;

  return (
    <div className="view-center column">
      <ExprStrip expr={data.expr} />
      <div className="stk">
        <div className="stk-idx" style={{ height }}>
          {Array.from({ length: cap }, (_, k) => (
            <span key={k} style={{ top: yOf(k), height: SLOT_H }}>
              {k}
            </span>
          ))}
        </div>

        <div className="stk-tube" style={{ height: height + 16 }}>
          {Array.from({ length: cap }, (_, k) => (
            <div key={k} className="stk-slot" style={{ top: yOf(k) + 8, height: SLOT_H }} />
          ))}
          <AnimatePresence>
            {data.items.map((item, k) => (
              <motion.div
                key={item.id}
                className={`stk-item st-${hl[item.id] || 'idle'}`}
                style={{ height: SLOT_H }}
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: yOf(k) + 8, opacity: 1 }}
                exit={{ y: -90, opacity: 0, transition: { duration: 0.4 } }}
                transition={spring}
              >
                {item.value}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="stk-ptr-col" style={{ height: height + 16 }}>
          <motion.div
            className="stk-top"
            initial={false}
            animate={{ y: top >= 0 ? yOf(top) + 8 : height + 16 }}
            transition={spring}
            style={{ height: top >= 0 ? SLOT_H : 'auto' }}
          >
            <span className="stk-arrow">◀</span>
            <span className="stk-top-lbl">top = {top}</span>
          </motion.div>
        </div>
      </div>
      <div className="stk-caption">
        {n} / {cap} · LIFO
      </div>
    </div>
  );
}
