import { Recorder, newId, list } from '../../lib/recorder';

// Data: { nodes: { [id]: { id, value, next } }, head, order: [id] (ekrandakı sıra), raised: [id] (yuxarı qaldırılmış yeni düyün) }

export const MAX_NODES = 10;

export function createList(vals) {
  const nodes = {};
  const order = vals.map((value) => {
    const id = newId('l');
    nodes[id] = { id, value, next: null };
    return id;
  });
  order.forEach((id, i) => (nodes[id].next = order[i + 1] ?? null));
  return { nodes, head: order[0] ?? null, order, raised: [] };
}

export function traverse(d) {
  const ids = [];
  for (let x = d.head; x != null && ids.length <= Object.keys(d.nodes).length; x = d.nodes[x].next) ids.push(x);
  return ids;
}

export const length = (d) => traverse(d).length;

const val = (r, id) => (id == null ? 'null' : r.data.nodes[id].value);
const valuesOf = (r) => list(traverse(r.data).map((id) => r.data.nodes[id].value));

function makeNode(r, value, orderIndex) {
  const id = newId('l');
  r.data.nodes[id] = { id, value, next: null };
  r.data.order.splice(orderIndex, 0, id);
  r.data.raised = [id];
  r.hl[id] = 'new';
  return id;
}

function full(r, algo) {
  if (length(r.data) < MAX_NODES) return false;
  r.step(null, `Maksimum ${MAX_NODES} düyün — vizualizasiya üçün limit`, { kind: 'error' });
  return true;
}

/* ───────── Insert Head ───────── */

export function insertHead(d, { value }) {
  const r = new Recorder(d);
  r.step('def', `INSERT_HEAD(${value}): yeni düyün siyahının əvvəlinə qoşulur`);
  if (full(r)) return r.result('insertHead');
  const id = makeNode(r, value, 0);
  r.ptr = { node: id };
  r.step('new', `node ← new Node(${value})`);
  const oldHead = r.data.head;
  r.data.nodes[id].next = oldHead;
  r.step('link', oldHead == null ? 'node.next ← head (null) — siyahı boş idi' : `node.next ← head (${val(r, oldHead)})`);
  r.data.head = id;
  r.data.raised = [];
  r.ptr = {};
  r.step('head', `head ← node — ${value} yeni baş düyün oldu. ${valuesOf(r)}`, { kind: 'success' });
  return r.result('insertHead');
}

/* ───────── Insert Tail ───────── */

export function insertTail(d, { value }) {
  const r = new Recorder(d);
  r.step('def', `INSERT_TAIL(${value}): sona çatmaq üçün bütün siyahı gəzilir`);
  if (full(r)) return r.result('insertTail');
  const id = makeNode(r, value, r.data.order.length);
  r.ptr = { node: id };
  r.step('new', `node ← new Node(${value})`);
  if (r.data.head == null) {
    r.data.head = id;
    r.data.raised = [];
    r.step('empty', `head = null → head ← node`, { kind: 'success' });
    return r.result('insertTail');
  }
  let cur = r.data.head;
  r.ptr = { node: id, cur };
  r.hl[cur] = 'path';
  r.vars = { cur: val(r, cur) };
  r.step('init', `cur ← head (${val(r, cur)})`);
  while (r.data.nodes[cur].next != null) {
    const prev = cur;
    cur = r.data.nodes[cur].next;
    r.ptr = { node: id, cur };
    r.hl[cur] = 'path';
    r.vars.cur = val(r, cur);
    r.step('adv', `${val(r, prev)}.next ≠ null → cur ← ${val(r, cur)}`);
  }
  r.step('loop', `${val(r, cur)}.next = null → son düyün tapıldı`, { kind: 'compare' });
  r.data.nodes[cur].next = id;
  r.data.raised = [];
  r.ptr = {};
  r.step('link', `cur.next ← node — ${value} sona əlavə olundu. ${valuesOf(r)}`, { kind: 'success' });
  return r.result('insertTail');
}

/* ───────── Insert At ───────── */

export function insertAt(d, { value, index: i }) {
  const r = new Recorder(d);
  const n = length(r.data);
  r.vars = { i, n };
  r.step('def', `INSERT_AT(${i}, ${value}): (i − 1)-ci düyünə qədər gedilir`);
  if (full(r)) return r.result('insertAt');
  if (i > n) {
    r.step('bounds', `${i} > n (${n}) → yanlış mövqe`, { kind: 'error' });
    return r.result('insertAt');
  }
  if (i === 0) {
    r.step('zero', 'i = 0 → yeni düyün başa qoşulur');
    const id = makeNode(r, value, 0);
    r.data.nodes[id].next = r.data.head;
    r.ptr = { node: id };
    r.step('zero', `node.next ← head (${val(r, r.data.head)})`);
    r.data.head = id;
    r.data.raised = [];
    r.ptr = {};
    r.step('zero', `head ← node ✓ ${valuesOf(r)}`, { kind: 'success' });
    return r.result('insertAt');
  }

  let prev = r.data.head;
  r.ptr = { prev };
  r.hl[prev] = 'path';
  r.vars.prev = val(r, prev);
  r.step('init', `prev ← head (${val(r, prev)})`);
  for (let k = 1; k <= i - 1; k++) {
    prev = r.data.nodes[prev].next;
    r.ptr = { prev };
    r.hl[prev] = 'path';
    r.vars.k = k;
    r.vars.prev = val(r, prev);
    r.step('adv', `k = ${k}: prev ← prev.next (${val(r, prev)})`);
  }

  const id = makeNode(r, value, r.data.order.indexOf(prev) + 1);
  r.ptr = { prev, node: id };
  r.step('new', `node ← new Node(${value})`);
  r.data.nodes[id].next = r.data.nodes[prev].next;
  r.step('link1', `node.next ← prev.next (${val(r, r.data.nodes[id].next)})`);
  r.data.nodes[prev].next = id;
  r.data.raised = [];
  r.ptr = {};
  r.step('link2', `prev.next ← node — ${value} ${i}-ci mövqeyə əlavə olundu. ${valuesOf(r)}`, { kind: 'success' });
  return r.result('insertAt');
}

/* ───────── Delete ───────── */

function dropNode(r, id) {
  delete r.data.nodes[id];
  r.data.order = r.data.order.filter((x) => x !== id);
  delete r.hl[id];
}

export function deleteValue(d, { value: key }) {
  const r = new Recorder(d);
  r.vars = { key };
  r.step('def', `DELETE(${key}): düyün tapılır və əvvəlki düyün onun "üstündən" bağlanır`);
  const head = r.data.head;
  if (head == null) {
    r.step('empty', 'head = null → siyahı boşdur', { kind: 'error' });
    return r.result('delete');
  }
  if (r.data.nodes[head].value === key) {
    r.hl[head] = 'removing';
    r.step('headEq', `head.value = ${key} → baş düyün silinir`, { kind: 'compare', badge: { text: `${key} = ${key}`, tone: 'good' } });
    r.data.head = r.data.nodes[head].next;
    r.step('headMv', `head ← head.next (${val(r, r.data.head)})`);
    dropNode(r, head);
    r.step('headMv', `${key} silindi ✓ ${valuesOf(r)}`, { kind: 'success' });
    return r.result('delete');
  }
  r.hl[head] = 'visited';
  r.step('headEq', `head.value = ${val(r, head)} ≠ ${key}`, { badge: { text: `${val(r, head)} ≠ ${key}`, tone: 'bad' } });

  let prev = head;
  r.ptr = { prev };
  r.step('init', `prev ← head (${val(r, prev)})`);
  while (r.data.nodes[prev].next != null) {
    const nx = r.data.nodes[prev].next;
    r.hl[nx] = 'compare';
    if (r.data.nodes[nx].value === key) break;
    r.step('loop', `prev.next = ${val(r, nx)} ≠ ${key} → irəli`, { badge: { text: `${val(r, nx)} ≠ ${key}`, tone: 'bad' } });
    r.hl[nx] = 'visited';
    prev = nx;
    r.ptr = { prev };
    r.step('adv', `prev ← ${val(r, prev)}`);
  }
  const target = r.data.nodes[prev].next;
  if (target == null) {
    r.step('nf', `prev.next = null → ${key} siyahıda yoxdur`, { kind: 'error' });
    return r.result('delete');
  }
  r.hl[target] = 'removing';
  r.step('loop', `prev.next = ${key} → silinəcək düyün tapıldı`, { kind: 'compare', badge: { text: `${key} = ${key}`, tone: 'good' } });
  r.data.nodes[prev].next = r.data.nodes[target].next;
  r.step('bypass', `prev.next ← ${key}.next (${val(r, r.data.nodes[target].next)}) — ${key} zəncirdən ayrıldı`);
  dropNode(r, target);
  r.ptr = { prev };
  r.step('bypass', `${key} silindi ✓ ${valuesOf(r)}`, { kind: 'success' });
  return r.result('delete');
}

/* ───────── Search ───────── */

export function search(d, { value: key }) {
  const r = new Recorder(d);
  let cur = r.data.head;
  let i = 0;
  r.vars = { key, i, cur: val(r, cur) };
  r.ptr = { cur };
  r.step('init', `cur ← head (${val(r, cur)}), i ← 0`);
  while (cur != null) {
    const v = r.data.nodes[cur].value;
    if (v === key) {
      r.hl[cur] = 'found';
      r.step('eq', `${v} = ${key} ✓ Tapıldı! Mövqe: ${i}`, { kind: 'success', badge: { text: `${v} = ${key}`, tone: 'good' } });
      return r.result('search');
    }
    r.hl[cur] = 'compare';
    r.step('eq', `${v} ≠ ${key}`, { kind: 'compare', badge: { text: `${v} ≠ ${key}`, tone: 'bad' } });
    r.hl[cur] = 'visited';
    cur = r.data.nodes[cur].next;
    i++;
    r.ptr = { cur };
    r.vars = { key, i, cur: val(r, cur) };
    r.step('adv', `cur ← cur.next (${val(r, cur)}), i ← ${i}`);
  }
  r.step('nf', `cur = null → ${key} tapılmadı, return -1`, { kind: 'error' });
  return r.result('search');
}

/* ───────── Reverse ───────── */

export function reverse(d) {
  const r = new Recorder(d);
  let prev = null;
  let cur = r.data.head;
  const sync = (next) => {
    r.ptr = { prev, cur, next };
    r.vars = { prev: val(r, prev), cur: val(r, cur), next: val(r, next) };
  };
  sync(undefined);
  delete r.vars.next;
  r.step('init', `prev ← null, cur ← head (${val(r, cur)})`);
  while (cur != null) {
    const nx = r.data.nodes[cur].next;
    sync(nx);
    r.step('save', `next ← cur.next (${val(r, nx)}) — əlaqə itməsin deyə yadda saxlanılır`);
    r.data.nodes[cur].next = prev;
    r.hl[cur] = 'sorted';
    r.step('flip', `cur.next ← prev (${val(r, prev)}) — ${val(r, cur)}-in oxu geri çevrildi`, { kind: 'compare' });
    prev = cur;
    cur = nx;
    sync(nx);
    r.step('move', `prev ← ${val(r, prev)}, cur ← ${val(r, cur)}`);
  }
  r.data.head = prev;
  r.ptr = { prev };
  r.step('head', `cur = null → head ← prev (${val(r, prev)})`);
  r.data.order = traverse(r.data);
  r.hl = {};
  r.ptr = {};
  r.step('head', `Siyahı tərsinə çevrildi ✓ ${valuesOf(r)}`, { kind: 'success' });
  return r.result('reverse');
}

/* ───────── Find Middle (slow / fast) ───────── */

export function findMiddle(d) {
  const r = new Recorder(d);
  let slow = r.data.head;
  let fast = r.data.head;
  if (slow == null) {
    r.step('def', 'Siyahı boşdur', { kind: 'error' });
    return r.result('middle');
  }
  const sync = () => {
    r.ptr = { slow, fast };
    r.vars = { slow: val(r, slow), fast: val(r, fast) };
  };
  sync();
  r.step('init', `slow ← head, fast ← head (${val(r, slow)}) — fast 2 dəfə sürətli hərəkət edəcək`);
  while (fast != null && r.data.nodes[fast].next != null) {
    r.step('loop', `fast (${val(r, fast)}) və fast.next (${val(r, r.data.nodes[fast].next)}) null deyil → davam`);
    slow = r.data.nodes[slow].next;
    r.hl[slow] = 'path';
    sync();
    r.step('slow', `slow ← slow.next (${val(r, slow)}) — 1 addım`);
    fast = r.data.nodes[r.data.nodes[fast].next].next;
    sync();
    r.step('fast', `fast ← fast.next.next (${val(r, fast)}) — 2 addım`);
  }
  r.step('loop', fast == null ? 'fast = null → dövr bitir' : `fast.next = null → dövr bitir`);
  r.hl = { [slow]: 'found' };
  r.step('ret', `Orta düyün: ${val(r, slow)} — siyahı yalnız bir dəfə gəzildi`, { kind: 'success' });
  return r.result('middle');
}
