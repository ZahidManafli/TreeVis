import { motion, AnimatePresence } from 'framer-motion';
import FitBox from '../../components/FitBox';
import { ptrColor } from '../../lib/pointers';
import { size } from './algorithms';

const CELL = 58;
const STEP = 68;
const LIFT = 84;

const spring = { type: 'spring', stiffness: 220, damping: 24 };

export default function ArrayView({ data, step }) {
  const hl = step?.hl ?? {};
  const ptr = step?.ptr ?? {};
  const n = size(data);
  const width = data.cap * STEP - (STEP - CELL);

  const items = [];
  data.slots.forEach((item, k) => item && items.push({ item, k, lifted: false }));
  if (data.lift) items.push({ item: data.lift.item, k: data.lift.at, lifted: true });

  // Eyni xanaya düşən göstəricilər alt-alta yığılır.
  const stackIndex = {};
  const pointers = Object.entries(ptr)
    .filter(([, pos]) => pos != null && pos >= 0 && pos < data.cap)
    .map(([name, pos]) => {
      const level = (stackIndex[pos] = (stackIndex[pos] ?? -1) + 1);
      return { name, pos, level };
    });

  return (
    <FitBox>
      <div className="arr-stage" style={{ width, height: LIFT + CELL + 130 }}>
        {Array.from({ length: data.cap }, (_, k) => (
          <div
            key={k}
            className={`arr-slot ${k >= n && !data.slots[k] ? 'empty' : ''} ${hl[k] === 'target' ? 'st-target' : ''}`}
            style={{ left: k * STEP, top: LIFT, width: CELL, height: CELL }}
          />
        ))}

        <AnimatePresence>
          {items.map(({ item, k, lifted }) => {
            const state = lifted ? 'lift' : hl[k] || 'idle';
            const label = String(item.value);
            return (
              <motion.div
                key={item.id}
                className={`arr-item st-${state}`}
                style={{ width: CELL, height: CELL, fontSize: label.length > 3 ? 14 : 18 }}
                initial={{ x: k * STEP, y: LIFT - 46, opacity: 0, scale: 0.7 }}
                animate={{ x: k * STEP, y: lifted ? 0 : LIFT, opacity: state === 'dim' ? 0.28 : 1, scale: 1 }}
                exit={{ y: LIFT + 46, opacity: 0, scale: 0.6, transition: { duration: 0.3 } }}
                transition={spring}
              >
                {label}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {Array.from({ length: data.cap }, (_, k) => (
          <div key={k} className={`arr-idx ${k < n ? 'on' : ''}`} style={{ left: k * STEP, top: LIFT + CELL + 6, width: CELL }}>
            <b>{k}</b>
            <small>0x{(0x1000 + k * 4).toString(16).toUpperCase()}</small>
          </div>
        ))}

        <AnimatePresence>
          {pointers.map(({ name, pos, level }) => (
            <motion.div
              key={name}
              className="ptr"
              style={{ '--pc': ptrColor(name), width: CELL }}
              initial={{ opacity: 0, x: pos * STEP, y: LIFT + CELL + 44 + level * 26 }}
              animate={{ opacity: 1, x: pos * STEP, y: LIFT + CELL + 44 + level * 26 }}
              exit={{ opacity: 0 }}
              transition={spring}
            >
              {level === 0 && <span className="ptr-arrow">▲</span>}
              <span className="ptr-name">{name}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FitBox>
  );
}
