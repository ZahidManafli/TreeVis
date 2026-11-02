import { Recorder, newId } from '../../lib/recorder';

// Chaining: { method: 'chain', m, buckets: [[{ id, value }]] }
// Probing:  { method: 'probe', m, cells: [null | { id, value } | { id, deleted: true }] }

export const SIZES = { chain: 7, probe: 11 };

export function hashOf(key, m) {
  if (typeof key === 'number') {
    const h = ((key % m) + m) % m;
    return { h, text: `h(${key}) = ${key} mod ${m} = ${h}` };
  }
  const codes = [...key].map((c) => c.charCodeAt(0));
  const sum = codes.reduce((a, b) => a + b, 0);
  const h = sum % m;
  return { h, text: `h("${key}") = (${codes.join(' + ')}) mod ${m} = ${sum} mod ${m} = ${h}` };
}

export function emptyTable(method) {
  const m = SIZES[method];
  return method === 'chain'
    ? { method, m, buckets: Array.from({ length: m }, () => []) }
    : { method, m, cells: Array(m).fill(null) };
}

export function valuesOf(d) {
  return d.method === 'chain'
    ? d.buckets.flat().map((x) => x.value)
    : d.cells.filter((c) => c && !c.deleted).map((c) => c.value);
}

export const countOf = (d) => valuesOf(d).length;

// Animasiyasız doldurma (nümunə data və metod dəyişəndə).
export function createTable(method, vals) {
  const d = emptyTable(method);
  for (const v of vals) {
    const { h } = hashOf(v, d.m);
    if (method === 'chain') {
      if (!d.buckets[h].some((x) => x.value === v)) d.buckets[h].push({ id: newId('h'), value: v });
    } else {
      for (let i = 0; i < d.m; i++) {
        const j = (h + i) % d.m;
        if (d.cells[j]?.value === v) break;
        if (!d.cells[j]) {
          d.cells[j] = { id: newId('h'), value: v };
          break;
        }
      }
    }
  }
  return d;
}

function hashStep(r, key) {
  const { h, text } = hashOf(key, r.data.m);
  r.vars = { key, h };
  r.ptr = { h };
  r.hl = { [`b${h}`]: 'active' };
  r.step('hash', text, { badge: { text } });
  return h;
}

/* ───────── Separate Chaining ───────── */

function chainFind(r, key, h, onLine) {
  const bucket = r.data.buckets[h];
  if (!bucket.length) {
    r.step(onLine, `T[${h}] boşdur (zəncir yoxdur)`);
    return -1;
  }
  for (let k = 0; k < bucket.length; k++) {
    const x = bucket[k];
    r.hl[x.id] = 'compare';
    if (x.value === key) return k;
    r.step(onLine, `${x.value} ≠ ${key} → zəncirdə növbəti`, { kind: 'compare', badge: { text: `${x.value} ≠ ${key}`, tone: 'bad' } });
    r.hl[x.id] = 'visited';
  }
  return -1;
}

export function chainInsert(d, { value: key }) {
  const r = new Recorder(d);
  r.step('def', `INSERT(${key}): açar hash funksiyası ilə kovaya (bucket) yerləşdirilir`);
  const h = hashStep(r, key);
  const k = chainFind(r, key, h, 'loop');
  if (k >= 0) {
    r.hl[r.data.buckets[h][k].id] = 'target';
    r.step('dup', `${key} artıq T[${h}]-də var — dublikat əlavə edilmir`, { kind: 'error' });
    return r.result('chainInsert');
  }
  const item = { id: newId('h'), value: key };
  const collision = r.data.buckets[h].length > 0;
  r.data.buckets[h].push(item);
  r.hl[item.id] = 'new';
  r.step(
    'append',
    collision
      ? `Toqquşma (collision)! T[${h}] doludur → ${key} zəncirin sonuna əlavə olundu (uzunluq ${r.data.buckets[h].length})`
      : `T[${h}].append(${key}) ✓`,
    { kind: 'success' }
  );
  return r.result('chainInsert');
}

export function chainSearch(d, { value: key }) {
  const r = new Recorder(d);
  r.step('def', `SEARCH(${key}): yalnız bir kovanın zənciri yoxlanılır`);
  const h = hashStep(r, key);
  const k = chainFind(r, key, h, 'loop');
  if (k >= 0) {
    r.hl[r.data.buckets[h][k].id] = 'found';
    r.step('eq', `${key} = ${key} ✓ Tapıldı! T[${h}], zəncirdə mövqe ${k}`, { kind: 'success', badge: { text: `${key} = ${key}`, tone: 'good' } });
  } else {
    r.step('nf', `${key} cədvəldə yoxdur → return null`, { kind: 'error' });
  }
  return r.result('chainSearch');
}

export function chainDelete(d, { value: key }) {
  const r = new Recorder(d);
  r.step('def', `DELETE(${key}): kova tapılır və açar zəncirdən çıxarılır`);
  const h = hashStep(r, key);
  const k = chainFind(r, key, h, 'loop');
  if (k < 0) {
    r.step('nf', `${key} cədvəldə yoxdur`, { kind: 'error' });
    return r.result('chainDelete');
  }
  const item = r.data.buckets[h][k];
  r.hl[item.id] = 'removing';
  r.step('eq', `${key} tapıldı — silinir`, { kind: 'compare', badge: { text: `${key} = ${key}`, tone: 'good' } });
  r.data.buckets[h].splice(k, 1);
  delete r.hl[item.id];
  r.step('remove', `T[${h}].remove(${key}) ✓`, { kind: 'success' });
  return r.result('chainDelete');
}

/* ───────── Linear Probing ───────── */

function probeLoop(r, key, h, mode) {
  const { m, cells } = r.data;
  for (let i = 0; i < m; i++) {
    const j = (h + i) % m;
    r.vars = { key, h, i, j };
    r.ptr = { h, j };
    const c = cells[j];
    const idx = `j = (${h} + ${i}) mod ${m} = ${j}`;
    r.hl[`c${j}`] = 'compare';
    if (c == null) {
      return { j, kind: 'empty', idx };
    }
    if (c.deleted) {
      if (mode === 'insert') return { j, kind: 'empty', idx };
      r.step('probe', `${idx}: T[${j}] = DELETED → axtarış davam edir`, { badge: { text: idx } });
      r.hl[`c${j}`] = 'visited';
      continue;
    }
    if (c.value === key) return { j, kind: 'match', idx };
    r.step('probe', `${idx}: T[${j}] = ${c.value} ≠ ${key} → toqquşma, növbəti xana`, {
      kind: 'compare',
      badge: { text: idx },
    });
    r.hl[`c${j}`] = 'visited';
  }
  return { j: -1, kind: 'full' };
}

export function probeInsert(d, { value: key }) {
  const r = new Recorder(d);
  r.step('def', `INSERT(${key}): xana doludursa, növbəti boş xanaya keçilir (linear probing)`);
  const h = hashStep(r, key);
  const res = probeLoop(r, key, h, 'insert');
  if (res.kind === 'full') {
    r.step('full', 'Bütün xanalar doludur → cədvəl dolub', { kind: 'error' });
    return r.result('probeInsert');
  }
  if (res.kind === 'match') {
    r.hl[`c${res.j}`] = 'target';
    r.step('dup', `${res.idx}: T[${res.j}] = ${key} → dublikat, əlavə edilmir`, { kind: 'error' });
    return r.result('probeInsert');
  }
  const was = r.data.cells[res.j];
  r.data.cells[res.j] = { id: newId('h'), value: key };
  r.hl[`c${res.j}`] = 'new';
  r.step('place', `${res.idx}: T[${res.j}] ${was?.deleted ? 'DELETED idi' : 'boşdur'} → ${key} yazıldı ✓${res.j !== h ? ` (${(res.j - h + r.data.m) % r.data.m} sınaq)` : ''}`, {
    kind: 'success',
  });
  return r.result('probeInsert');
}

export function probeSearch(d, { value: key }) {
  const r = new Recorder(d);
  r.step('def', `SEARCH(${key}): h-dən başlayıb boş xanaya qədər yoxlanılır`);
  const h = hashStep(r, key);
  const res = probeLoop(r, key, h, 'search');
  if (res.kind === 'match') {
    r.hl[`c${res.j}`] = 'found';
    r.step('eq', `${res.idx}: T[${res.j}] = ${key} ✓ Tapıldı!`, { kind: 'success', badge: { text: `${key} = ${key}`, tone: 'good' } });
  } else if (res.kind === 'empty') {
    r.step('empty', `${res.idx}: T[${res.j}] = null → ${key} yoxdur (boş xanada axtarış dayanır)`, { kind: 'error' });
  } else {
    r.step('nf', `Bütün cədvəl yoxlanıldı → ${key} yoxdur`, { kind: 'error' });
  }
  return r.result('probeSearch');
}

export function probeDelete(d, { value: key }) {
  const r = new Recorder(d);
  r.step('def', `DELETE(${key}): tapılır və xana DELETED (tombstone) kimi işarələnir`);
  const h = hashStep(r, key);
  const res = probeLoop(r, key, h, 'search');
  if (res.kind !== 'match') {
    r.step('nf', `${key} cədvəldə yoxdur`, { kind: 'error' });
    return r.result('probeDelete');
  }
  r.hl[`c${res.j}`] = 'removing';
  r.step('eq', `${res.idx}: T[${res.j}] = ${key} — silinəcək`, { kind: 'compare', badge: { text: `${key} = ${key}`, tone: 'good' } });
  r.data.cells[res.j] = { id: newId('h'), deleted: true };
  r.hl[`c${res.j}`] = 'deleted';
  r.step('tomb', `T[${res.j}] ← DELETED — null qoysaydıq, sonrakı açarların axtarışı yarımçıq qalardı`, { kind: 'success' });
  return r.result('probeDelete');
}
