import { Recorder, newId, list } from '../../lib/recorder';

// Dairəvi növbə: { cap, slots: [item | null], front, rear, size }

export function createQueue(vals, cap = 8, offset = 2) {
  const slots = Array(cap).fill(null);
  const n = Math.min(vals.length, cap);
  for (let k = 0; k < n; k++) slots[(offset + k) % cap] = { id: newId('q'), value: vals[k] };
  return { cap, slots, front: n ? offset : 0, rear: n ? (offset + n - 1) % cap : (offset - 1 + cap) % cap, size: n };
}

const contents = (d) => {
  const out = [];
  for (let k = 0; k < d.size; k++) out.push(d.slots[(d.front + k) % d.cap].value);
  return list(out);
};

const sync = (r) => {
  r.ptr = { front: r.data.front, rear: r.data.rear };
  r.vars = { front: r.data.front, rear: r.data.rear, size: r.data.size, ...r.extraVars };
};

export function enqueue(d, { value }) {
  const r = new Recorder(d);
  const q = r.data;
  sync(r);
  r.step('def', `ENQUEUE(${value}): element arxaya (rear) əlavə olunur`);
  if (q.size === q.cap) {
    r.step('full', `size = capacity (${q.cap}) → Queue Overflow!`, { kind: 'error' });
    return r.result('enqueue');
  }
  const old = q.rear;
  q.rear = (q.rear + 1) % q.cap;
  sync(r);
  r.hl = { [`s${q.rear}`]: 'target' };
  r.step('rear', `rear ← (${old} + 1) mod ${q.cap} = ${q.rear}${old + 1 === q.cap ? ' — sona çatdıq, əvvələ dövr edirik!' : ''}`, {
    badge: { text: `(${old} + 1) mod ${q.cap} = ${q.rear}` },
  });
  const item = { id: newId('q'), value };
  q.slots[q.rear] = item;
  r.hl = { [`s${q.rear}`]: 'new' };
  r.step('set', `Q[${q.rear}] ← ${value}`);
  q.size++;
  sync(r);
  r.step('size', `size ← ${q.size} — növbə: ${contents(q)}`, { kind: 'success' });
  return r.result('enqueue');
}

export function dequeue(d) {
  const r = new Recorder(d);
  const q = r.data;
  sync(r);
  r.step('def', 'DEQUEUE: element öndən (front) götürülür — FIFO');
  if (q.size === 0) {
    r.step('empty', 'size = 0 → Queue Underflow! (növbə boşdur)', { kind: 'error' });
    return r.result('dequeue');
  }
  const f = q.front;
  const x = q.slots[f].value;
  r.hl = { [`s${f}`]: 'removing' };
  r.extraVars = { x };
  sync(r);
  r.step('take', `x ← Q[${f}] = ${x}`);
  q.slots[f] = null;
  r.hl = {};
  r.step('clear', `Q[${f}] ← null`);
  q.front = (f + 1) % q.cap;
  sync(r);
  r.step('front', `front ← (${f} + 1) mod ${q.cap} = ${q.front}`, { badge: { text: `(${f} + 1) mod ${q.cap} = ${q.front}` } });
  q.size--;
  sync(r);
  r.step('size', `size ← ${q.size}, return ${x} — növbə: ${contents(q)}`, { kind: 'success' });
  return r.result('dequeue');
}

export function peek(d) {
  const r = new Recorder(d);
  const q = r.data;
  sync(r);
  r.step('def', 'PEEK (FRONT): öndəki elementə baxılır');
  if (q.size === 0) {
    r.step('empty', 'size = 0 → növbə boşdur', { kind: 'error' });
    return r.result('peek');
  }
  r.hl = { [`s${q.front}`]: 'found' };
  r.step('ret', `Q[front] = Q[${q.front}] = ${q.slots[q.front].value} (növbə dəyişmədi)`, { kind: 'success' });
  return r.result('peek');
}

export function search(d, { value: key }) {
  const r = new Recorder(d);
  const q = r.data;
  sync(r);
  r.step('def', `SEARCH(${key}): front-dan başlayaraq size qədər element yoxlanılır`);
  for (let k = 0; k < q.size; k++) {
    const i = (q.front + k) % q.cap;
    r.extraVars = { k, i };
    sync(r);
    r.ptr.i = i;
    r.hl[`s${i}`] = 'compare';
    r.step('idx', `k = ${k}: i ← (${q.front} + ${k}) mod ${q.cap} = ${i}`, { badge: { text: `(${q.front} + ${k}) mod ${q.cap} = ${i}` } });
    const v = q.slots[i].value;
    if (v === key) {
      r.hl[`s${i}`] = 'found';
      r.step('eq', `Q[${i}] = ${key} ✓ Tapıldı! (öndən məsafə: ${k})`, { kind: 'success', badge: { text: `${v} = ${key}`, tone: 'good' } });
      return r.result('search');
    }
    r.step('eq', `Q[${i}] = ${v} ≠ ${key}`, { kind: 'compare', badge: { text: `${v} ≠ ${key}`, tone: 'bad' } });
    r.hl[`s${i}`] = 'visited';
  }
  delete r.ptr.i;
  r.step('nf', `${key} növbədə yoxdur → return -1`, { kind: 'error' });
  return r.result('search');
}
