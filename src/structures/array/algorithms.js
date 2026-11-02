import { Recorder, newId, list } from '../../lib/recorder';

// Data: { cap, slots: [item | null], lift: { item, at } | null }
// Əməliyyatdan əvvəl və sonra elementlər 0..n-1 xanalarında ardıcıl yerləşir;
// animasiya zamanı isə müvəqqəti boşluq və ya yuxarı qaldırılmış (lift) element ola bilər.

export const size = (d) => d.slots.filter(Boolean).length + (d.lift ? 1 : 0);
const values = (d) => d.slots.filter(Boolean).map((s) => s.value);

export function createArray(vals, cap = 12) {
  const slots = Array(cap).fill(null);
  vals.slice(0, cap).forEach((v, i) => (slots[i] = { id: newId('a'), value: v }));
  return { cap, slots, lift: null };
}

export const isSorted = (d) => values(d).every((x, i, a) => i === 0 || a[i - 1] <= x);

const BASE = 0x1000;
const hex = (n) => '0x' + n.toString(16).toUpperCase();

const sortedHl = (from, to) => {
  const hl = {};
  for (let k = from; k < to; k++) hl[k] = 'sorted';
  return hl;
};

/* ───────── Access ───────── */

export function access(d, { index: i }) {
  const r = new Recorder(d);
  const n = size(r.data);
  r.vars = { i, n };
  r.step('def', `ACCESS(${i}): A[${i}] elementinə birbaşa müraciət`);
  if (i >= n) {
    r.step('bounds', `${i} ≥ n (${n}) → indeks sərhəddən kənardır`, { kind: 'error' });
    return r.result('access');
  }
  r.ptr = { i };
  r.hl = { [i]: 'active' };
  r.step('bounds', `0 ≤ ${i} < ${n} ✓ indeks düzgündür`);
  const addr = BASE + i * 4;
  r.vars.address = hex(addr);
  r.step('addr', `Ünvan = base + i × 4 = ${hex(BASE)} + ${i} × 4 = ${hex(addr)}`, {
    badge: { text: `${hex(BASE)} + ${i} × 4 = ${hex(addr)}` },
  });
  r.hl = { [i]: 'found' };
  r.step('ret', `A[${i}] = ${r.data.slots[i].value} — dövr yoxdur, cəmi 1 addım: O(1)`, { kind: 'success' });
  return r.result('access');
}

/* ───────── Insert ───────── */

export function insert(d, { value, index }) {
  const r = new Recorder(d);
  const s = r.data.slots;
  const n = size(r.data);
  const i = index ?? n;
  r.vars = { i, x: value, n };
  r.step('def', `INSERT(${i}, ${value})${index == null ? ' — indeks verilmədiyi üçün sona əlavə olunur' : ''}`);

  if (n === r.data.cap) {
    r.step('full', `n = capacity (${n}) → massiv doludur, əlavə etmək olmur`, { kind: 'error' });
    return r.result('insert');
  }
  if (i > n) {
    r.step('bounds', `${i} > n (${n}) → yanlış indeks (massivdə boşluq qala bilməz)`, { kind: 'error' });
    return r.result('insert');
  }
  r.ptr = { i };
  r.hl = { [i]: 'target' };
  r.step('bounds', `0 ≤ ${i} ≤ ${n} ✓ — ${n - i} element sağa sürüşdürüləcək`);

  for (let j = n - 1; j >= i; j--) {
    r.ptr = { i, j };
    r.vars.j = j;
    s[j + 1] = s[j];
    s[j] = null;
    r.hl = { [i]: 'target', [j + 1]: 'active' };
    r.step('shift', `A[${j + 1}] ← A[${j}] — ${s[j + 1].value} bir xana sağa`);
  }

  s[i] = { id: newId('a'), value };
  delete r.vars.j;
  r.ptr = { i };
  r.hl = { [i]: 'new' };
  r.step('set', `A[${i}] ← ${value}`);
  r.vars.n = n + 1;
  r.step('inc', `n ← ${n + 1}. Sürüşdürmə sayı: ${n - i}`, { kind: 'success' });
  return r.result('insert');
}

/* ───────── Delete ───────── */

export function remove(d, { index: i }) {
  const r = new Recorder(d);
  const s = r.data.slots;
  const n = size(r.data);
  r.vars = { i, n };
  r.step('def', `DELETE(${i}): A[${i}] silinir, sağdakılar sola sürüşür`);
  if (i >= n) {
    r.step('bounds', `${i} ≥ n (${n}) → yanlış indeks`, { kind: 'error' });
    return r.result('delete');
  }
  r.ptr = { i };
  r.hl = { [i]: 'removing' };
  r.vars.x = s[i].value;
  r.step('take', `x ← A[${i}] = ${s[i].value} — silinəcək element`);
  s[i] = null;
  r.hl = {};
  r.step('take', `A[${i}] boşaldı — boşluğu doldurmaq üçün elementlər sola sürüşür`);

  for (let j = i; j <= n - 2; j++) {
    r.ptr = { j };
    r.vars.j = j;
    s[j] = s[j + 1];
    s[j + 1] = null;
    r.hl = { [j]: 'active' };
    r.step('shift', `A[${j}] ← A[${j + 1}] — ${s[j].value} bir xana sola`);
  }
  delete r.vars.j;
  r.ptr = {};
  r.hl = {};
  r.vars.n = n - 1;
  r.step('dec', `n ← ${n - 1}. Silindi ✓ (${n - 1 - i} sürüşdürmə)`, { kind: 'success' });
  return r.result('delete');
}

/* ───────── Linear Search ───────── */

export function linearSearch(d, { value: key }) {
  const r = new Recorder(d);
  const s = r.data.slots;
  const n = size(r.data);
  r.vars = { key, n };
  r.step('def', `LINEAR_SEARCH(${key}): elementlər soldan sağa bir-bir yoxlanılır`);
  for (let i = 0; i < n; i++) {
    r.ptr = { i };
    r.vars.i = i;
    const v = s[i].value;
    if (v === key) {
      r.hl[i] = 'found';
      r.step('eq', `A[${i}] = ${v} = ${key} ✓ Tapıldı! İndeks: ${i} (${i + 1} müqayisə)`, {
        kind: 'success',
        badge: { text: `A[${i}] = ${key}`, tone: 'good' },
      });
      return r.result('linear');
    }
    r.hl[i] = 'compare';
    r.step('eq', `A[${i}] = ${v} ≠ ${key} → növbəti`, { kind: 'compare', badge: { text: `${v} ≠ ${key}`, tone: 'bad' } });
    r.hl[i] = 'visited';
  }
  r.ptr = {};
  r.step('nf', `${key} tapılmadı → return -1 (${n} müqayisə)`, { kind: 'error' });
  return r.result('linear');
}

/* ───────── Binary Search ───────── */

export function binarySearch(d, { value: key }) {
  if (!isSorted(d)) return { error: 'Binary Search üçün massiv sıralı olmalıdır — əvvəlcə sort alqoritmlərindən birini işlədin' };
  const r = new Recorder(d);
  const s = r.data.slots;
  const n = size(r.data);
  let lo = 0;
  let hi = n - 1;
  let count = 0;
  const range = (mid) => {
    r.hl = {};
    for (let k = 0; k < n; k++) if (k < lo || k > hi) r.hl[k] = 'dim';
    if (mid != null) r.hl[mid] = 'compare';
  };
  r.vars = { key, lo, hi };
  r.ptr = { lo, hi };
  range();
  r.step('init', `lo ← 0, hi ← ${n - 1} — bütün massiv axtarış aralığıdır`);

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    count++;
    r.ptr = { lo, hi, mid };
    r.vars = { key, lo, hi, mid };
    range(mid);
    r.step('mid', `mid ← ⌊(${lo} + ${hi}) / 2⌋ = ${mid}, A[mid] = ${s[mid].value}`);
    const v = s[mid].value;
    if (v === key) {
      r.hl[mid] = 'found';
      r.step('eq', `A[${mid}] = ${key} ✓ Tapıldı! (${count} müqayisə)`, {
        kind: 'success',
        badge: { text: `${v} = ${key}`, tone: 'good' },
      });
      return r.result('binary');
    }
    if (v < key) {
      r.step('lt', `${v} < ${key} → sol yarı atılır, lo ← ${mid + 1}`, { kind: 'compare', badge: { text: `${v} < ${key} → sağa` } });
      lo = mid + 1;
    } else {
      r.step('gt', `${v} > ${key} → sağ yarı atılır, hi ← ${mid - 1}`, { kind: 'compare', badge: { text: `${v} > ${key} → sola` } });
      hi = mid - 1;
    }
  }
  r.ptr = { lo, hi };
  r.vars = { key, lo, hi };
  range();
  r.step('nf', `lo (${lo}) > hi (${hi}) → ${key} yoxdur, return -1 (${count} müqayisə)`, { kind: 'error' });
  return r.result('binary');
}

/* ───────── Bubble Sort ───────── */

export function bubbleSort(d) {
  const r = new Recorder(d);
  const s = r.data.slots;
  const n = size(r.data);
  let cmp = 0;
  let swaps = 0;
  r.step('def', `BUBBLE_SORT: qonşu elementlər müqayisə olunur, böyük olan sona "üzür" — ${list(values(r.data))}`);

  let sortedFrom = n;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    r.vars = { i, swapped: false };
    r.ptr = {};
    r.hl = sortedHl(sortedFrom, n);
    r.step('outer', `Keçid i = ${i}`);
    for (let j = 0; j <= n - 2 - i; j++) {
      const a = s[j].value;
      const b = s[j + 1].value;
      cmp++;
      r.ptr = { j, 'j+1': j + 1 };
      r.vars.j = j;
      r.hl = { ...sortedHl(sortedFrom, n), [j]: 'compare', [j + 1]: 'compare' };
      if (a > b) {
        r.step('cmp', `${a} > ${b} → yerləri dəyişilməlidir`, { kind: 'compare', badge: { text: `${a} > ${b}` } });
        [s[j], s[j + 1]] = [s[j + 1], s[j]];
        swapped = true;
        swaps++;
        r.vars.swapped = true;
        r.hl[j] = 'swap';
        r.hl[j + 1] = 'swap';
        r.step('swap', `swap → ${list(values(r.data))}`);
      } else {
        r.step('cmp', `${a} ≤ ${b} → yerində qalır`, { badge: { text: `${a} ≤ ${b}`, tone: 'good' } });
      }
    }
    sortedFrom = n - 1 - i;
    r.hl = sortedHl(sortedFrom, n);
    r.ptr = {};
    if (!swapped) {
      sortedFrom = 0;
      r.hl = sortedHl(0, n);
      r.step('break', 'Bu keçiddə heç bir yerdəyişmə olmadı → massiv artıq sıralıdır, dövr dayanır', { kind: 'success' });
      break;
    }
  }
  r.hl = sortedHl(0, n);
  r.ptr = {};
  r.vars = { müqayisə: cmp, swap: swaps };
  r.step(null, `Sıralandı ✓ ${list(values(r.data))} — ${cmp} müqayisə, ${swaps} yerdəyişmə`, { kind: 'success' });
  return r.result('bubble');
}

/* ───────── Selection Sort ───────── */

export function selectionSort(d) {
  const r = new Recorder(d);
  const s = r.data.slots;
  const n = size(r.data);
  let cmp = 0;
  let swaps = 0;
  r.step('def', `SELECTION_SORT: hər addımda qalan hissənin minimumu tapılıb əvvələ qoyulur — ${list(values(r.data))}`);

  for (let i = 0; i < n - 1; i++) {
    let min = i;
    r.vars = { i, min };
    r.ptr = { i, min };
    r.hl = { ...sortedHl(0, i), [i]: 'min' };
    r.step('min', `min ← ${i} (A[${i}] = ${s[i].value})`);
    for (let j = i + 1; j < n; j++) {
      cmp++;
      r.ptr = { i, min, j };
      r.vars = { i, min, j };
      r.hl = { ...sortedHl(0, i), [min]: 'min', [j]: 'compare' };
      if (s[j].value < s[min].value) {
        r.step('cmp', `${s[j].value} < ${s[min].value} → yeni minimum: min ← ${j}`, {
          kind: 'compare',
          badge: { text: `${s[j].value} < ${s[min].value}` },
        });
        min = j;
      } else {
        r.step('cmp', `${s[j].value} ≥ ${s[min].value} → minimum dəyişmir`, { badge: { text: `${s[j].value} ≥ ${s[min].value}`, tone: 'good' } });
      }
    }
    r.ptr = { i, min };
    r.vars = { i, min };
    if (min !== i) {
      r.hl = { ...sortedHl(0, i), [i]: 'swap', [min]: 'swap' };
      [s[i], s[min]] = [s[min], s[i]];
      swaps++;
      r.step('swap', `swap(A[${i}], A[${min}]) → ${list(values(r.data))}`);
    } else {
      r.hl = { ...sortedHl(0, i), [i]: 'min' };
      r.step('swap', `Minimum (${s[i].value}) artıq öz yerindədir`);
    }
  }
  r.hl = sortedHl(0, n);
  r.ptr = {};
  r.vars = { müqayisə: cmp, swap: swaps };
  r.step(null, `Sıralandı ✓ ${list(values(r.data))} — ${cmp} müqayisə, ${swaps} yerdəyişmə`, { kind: 'success' });
  return r.result('selection');
}

/* ───────── Insertion Sort ───────── */

export function insertionSort(d) {
  const r = new Recorder(d);
  const s = r.data.slots;
  const n = size(r.data);
  let cmp = 0;
  let shifts = 0;
  r.hl = sortedHl(0, Math.min(1, n));
  r.step('def', `INSERTION_SORT: hər element sol tərəfdəki sıralı hissədə öz yerinə "taxılır" — ${list(values(r.data))}`);

  for (let i = 1; i < n; i++) {
    const item = s[i];
    const key = item.value;
    s[i] = null;
    r.data.lift = { item, at: i };
    r.vars = { i, key };
    r.ptr = { i };
    r.hl = sortedHl(0, i);
    r.step('key', `key ← A[${i}] = ${key} — element götürülür`);
    let j = i - 1;
    r.vars.j = j;
    r.ptr = { i, j };
    r.step('j', `j ← ${j}`);
    while (j >= 0) {
      const a = s[j].value;
      cmp++;
      r.hl = { ...sortedHl(0, i + 1), [j]: 'compare' };
      delete r.hl[i];
      if (a > key) {
        r.step('while', `${a} > ${key} → ${a} sağa sürüşməlidir`, { kind: 'compare', badge: { text: `${a} > ${key}` } });
        s[j + 1] = s[j];
        s[j] = null;
        shifts++;
        r.data.lift.at = j;
        r.hl = { ...sortedHl(0, i + 1), [j + 1]: 'active' };
        r.step('shift', `A[${j + 1}] ← A[${j}]`);
        j--;
        r.vars.j = j;
        r.ptr = { i, j };
        r.step('dec', `j ← ${j}`);
      } else {
        r.step('while', `${a} ≤ ${key} → dayanırıq`, { badge: { text: `${a} ≤ ${key}`, tone: 'good' } });
        break;
      }
    }
    if (j < 0) r.step('while', `j = -1 → massivin əvvəlinə çatdıq`);
    s[j + 1] = item;
    r.data.lift = null;
    r.hl = { ...sortedHl(0, i + 1), [j + 1]: 'new' };
    r.ptr = { i };
    r.step('place', `A[${j + 1}] ← ${key} → ${list(values(r.data))}`);
  }
  r.hl = sortedHl(0, n);
  r.ptr = {};
  r.vars = { müqayisə: cmp, sürüşdürmə: shifts };
  r.step(null, `Sıralandı ✓ ${list(values(r.data))} — ${cmp} müqayisə, ${shifts} sürüşdürmə`, { kind: 'success' });
  return r.result('insertion');
}
