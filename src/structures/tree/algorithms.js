import { addNode, cloneTree, emptyTree, parentOf, countNodes, treeHeight } from './tree.js';

// Hər alqoritm addımlar siyahısı yaradır. Addım = ağacın snapshot-u + vizual vəziyyət
// (düyün rəngləri, kursor, psevdokod sətri, dəyişənlər, izah mətni).
class Recorder {
  constructor(tree) {
    this.tree = cloneTree(tree);
    this.steps = [];
    this.states = {};
    this.order = {};
    this.visited = [];
    this.trail = [];
    this.current = null;
    this.vars = {};
    this.meta = null;
  }

  v(id) {
    return id == null ? 'null' : this.tree.nodes[id]?.value;
  }

  step(line, msg, extra = {}) {
    this.steps.push({
      tree: cloneTree(this.tree),
      line,
      msg,
      kind: extra.kind || 'info',
      states: { ...this.states },
      order: { ...this.order },
      visited: [...this.visited],
      trail: [...this.trail],
      current: this.current,
      vars: { ...this.vars },
      meta: this.meta ? JSON.parse(JSON.stringify(this.meta)) : null,
      ghost: extra.ghost || null,
      slot: extra.slot || null,
    });
  }

  result(algo) {
    return { algo, steps: this.steps, tree: cloneTree(this.tree) };
  }
}

const list = (arr) => `[${arr.join(', ')}]`;
const sideAz = (side) => (side === 'left' ? 'sol' : 'sağ');

/* ───────────────────────── Binary Tree: Insert ───────────────────────── */

export function btInsert(tree, key) {
  const r = new Recorder(tree);
  const t = r.tree;
  r.vars = { key };
  r.step('def', `INSERT(${key}): ilk boş yer səviyyə-səviyyə (BFS) axtarılır`);

  if (t.root == null) {
    r.step('rootNull', 'Ağac boşdur: root = null');
    const id = addNode(t, key);
    t.root = id;
    r.states[id] = 'new';
    r.current = id;
    r.step('setRoot', `${key} kök düyün kimi əlavə olundu`, { kind: 'success' });
    return r.result('btInsert');
  }

  const Q = [t.root];
  const syncQ = () => (r.vars.Q = list(Q.map((id) => r.v(id))));
  r.states[t.root] = 'queued';
  syncQ();
  r.step('init', `Növbə yaradılır, kök (${r.v(t.root)}) növbəyə əlavə olunur`);

  while (Q.length) {
    const cur = Q.shift();
    const c = t.nodes[cur];
    r.current = cur;
    r.states[cur] = 'active';
    r.vars.cur = c.value;
    syncQ();
    r.step('deq', `Növbədən ${c.value} çıxarılır`);

    for (const side of ['left', 'right']) {
      const L = side === 'left' ? 'L' : 'R';
      if (c[side] == null) {
        r.step(`chk${L}`, `${c.value}.${side} = null → boş yer tapıldı`, {
          kind: 'compare',
          slot: { parent: cur, side },
        });
        const id = addNode(t, key);
        c[side] = id;
        r.states[cur] = 'visited';
        r.states[id] = 'new';
        r.current = id;
        r.step(`set${L}`, `${key}, ${c.value} düyününün ${sideAz(side)} övladı oldu`, { kind: 'success' });
        return r.result('btInsert');
      }
      Q.push(c[side]);
      r.states[c[side]] = 'queued';
      syncQ();
      r.step(`enq${L}`, `${c.value}.${side} = ${r.v(c[side])} (boş deyil) → növbəyə əlavə olunur`);
    }
    r.states[cur] = 'visited';
  }
  return r.result('btInsert');
}

/* ───────────────────────── BST: Insert (ümumi nüvə) ───────────────────────── */

function bstInsertCore(r, key, { prefix = '', onPlaced } = {}) {
  const t = r.tree;
  r.vars.key = key;

  if (t.root == null) {
    r.step('rootNull', `${prefix}Ağac boşdur: root = null`);
    const id = addNode(t, key);
    t.root = id;
    r.states[id] = 'new';
    r.current = id;
    r.trail = [id];
    onPlaced?.();
    r.step('setRoot', `${prefix}${key} kök düyün oldu`, { kind: 'success' });
    return id;
  }

  let cur = t.root;
  r.current = cur;
  r.trail = [cur];
  r.vars.cur = r.v(cur);
  r.states[cur] = 'path';
  r.step('init', `${prefix}cur ← root (${r.v(cur)})`);

  while (true) {
    const c = t.nodes[cur];
    if (key === c.value) {
      r.states[cur] = 'target';
      r.step('dup', `${prefix}${key} = ${c.value} → dublikat, əlavə edilmir`, {
        kind: 'error',
        ghost: { text: `${key} = ${c.value}`, tone: 'bad' },
      });
      return null;
    }

    const side = key < c.value ? 'left' : 'right';
    const isLeft = side === 'left';
    r.states[cur] = 'compare';
    r.step(
      isLeft ? 'lt' : 'gt',
      isLeft
        ? `${prefix}${key} < ${c.value} → sola get`
        : `${prefix}${key} < ${c.value} deyil, ${key} > ${c.value} → sağa get`,
      { kind: 'compare', ghost: { text: `${key} ${isLeft ? '<' : '>'} ${c.value}`, dir: side } }
    );
    r.states[cur] = 'path';

    if (c[side] == null) {
      r.step(isLeft ? 'ltNull' : 'gtNull', `${prefix}${c.value}.${side} = null → yer tapıldı`, {
        slot: { parent: cur, side },
      });
      const id = addNode(t, key);
      c[side] = id;
      r.states[id] = 'new';
      r.current = id;
      r.trail.push(id);
      onPlaced?.();
      r.step(isLeft ? 'setL' : 'setR', `${prefix}${key}, ${c.value}-in ${sideAz(side)} övladı kimi əlavə olundu`, {
        kind: 'success',
      });
      return id;
    }

    cur = c[side];
    r.current = cur;
    r.trail.push(cur);
    r.vars.cur = r.v(cur);
    r.states[cur] = 'path';
    r.step(isLeft ? 'goL' : 'goR', `${prefix}cur ← ${c.value}.${side} (${r.v(cur)})`);
  }
}

export function bstInsert(tree, key) {
  const r = new Recorder(tree);
  r.vars = { key };
  r.step('def', `INSERT(${key}): BST qaydası — kiçik sola, böyük sağa`);
  bstInsertCore(r, key);
  return r.result('bstInsert');
}

/* ───────────────────────── BST: massivdən qurmaq ───────────────────────── */

export function buildBST(values) {
  const r = new Recorder(emptyTree());
  r.meta = { array: values, ai: -1, done: [], skipped: [] };
  r.step('def', `${values.length} elementli massivdən BST qurulur: ${list(values)}`);
  r.step('start', 'root ← null — ağac hələ boşdur');

  values.forEach((key, i) => {
    r.meta.ai = i;
    r.states = {};
    r.trail = [];
    r.current = null;
    r.vars = { i, n: values.length };
    r.step('for', `İterasiya i = ${i} (${i + 1}/${values.length})`);
    r.vars.key = key;
    r.step('key', `key ← A[${i}] = ${key}`);
    const id = bstInsertCore(r, key, {
      prefix: `[i=${i}] `,
      onPlaced: () => r.meta.done.push(i),
    });
    if (id == null) r.meta.skipped.push(i);
  });

  r.meta.ai = -1;
  r.states = {};
  r.trail = [];
  r.current = null;
  r.step('done', `BST quruldu — ${countNodes(r.tree)} düyün`, { kind: 'success' });
  return r.result('build');
}

/* ───────────────────────── Traversal ilə axtarış ───────────────────────── */

const TRAV_NAME = { pre: 'PREORDER', in: 'INORDER', post: 'POSTORDER' };

export function traversalSearch(tree, key, kind) {
  const r = new Recorder(tree);
  const t = r.tree;
  const name = TRAV_NAME[kind];
  let count = 0;
  r.vars = { key };

  if (t.root == null) {
    r.step('nullchk', 'Ağac boşdur — axtarış mümkün deyil', { kind: 'error' });
    return r.result(kind);
  }

  const syncStack = () => (r.vars.stack = list(r.trail.map((id) => r.v(id))));

  const visit = (id) => {
    r.order[id] = ++count;
    r.visited.push(r.v(id));
    r.states[id] = 'visited';
    r.current = id;
    r.step('visit', `visit(${r.v(id)}) — ziyarət #${count}`);
  };

  const check = (id) => {
    const val = r.v(id);
    if (val === key) {
      r.states[id] = 'found';
      r.step('eq', `${val} = ${key} ✓ Tapıldı!`, { kind: 'success', ghost: { text: `${val} = ${key}`, tone: 'good' } });
      return true;
    }
    r.step('eq', `${val} ≠ ${key} → davam`, { kind: 'compare', ghost: { text: `${val} ≠ ${key}`, tone: 'bad' } });
    return false;
  };

  const back = (id, line, msg) => {
    r.current = id;
    syncStack();
    r.step(line, msg);
  };

  const rec = (id, parent, side, line) => {
    if (id == null) {
      r.step('nullchk', `${r.v(parent)}.${side} = null → return null`, { slot: { parent, side } });
      return null;
    }
    r.trail.push(id);
    r.current = id;
    if (!r.states[id]) r.states[id] = 'path';
    syncStack();
    r.step(
      line,
      line === 'call'
        ? `${name}(${r.v(id)}) — kökdən başlanır`
        : `${name}(${r.v(id)}) — ${sideAz(side)} övlada keçid`
    );

    const n = t.nodes[id];

    if (kind === 'pre') {
      visit(id);
      if (check(id)) return id;
    }

    const L = rec(n.left, id, 'left', 'recL');
    if (L) return L;
    if (n.left != null) back(id, 'chkL', `${r.v(id)}-ə qayıdıldı: sol alt ağacda tapılmadı`);

    if (kind === 'in') {
      visit(id);
      if (check(id)) return id;
    }

    const R = rec(n.right, id, 'right', 'recR');
    if (R) return R;

    if (kind === 'post') {
      if (n.right != null) back(id, 'chkR', `${r.v(id)}-ə qayıdıldı: sağ alt ağacda tapılmadı`);
      visit(id);
      if (check(id)) return id;
      r.step('retNull', `${r.v(id)} alt ağacında yoxdur → return null`);
    }

    r.trail.pop();
    syncStack();
    return null;
  };

  r.step('call', `${name} traversal ilə ${key} axtarılır`);
  const found = rec(t.root, null, null, 'call');
  if (found) {
    r.current = found;
    r.step('found', `Nəticə: ${key} tapıldı (${count} düyün ziyarət edildi). Yol: ${r.trail.map((id) => r.v(id)).join(' → ')}`, {
      kind: 'success',
    });
  } else {
    r.current = null;
    r.step(null, `Nəticə: ${key} ağacda yoxdur (${count} düyünün hamısı yoxlanıldı)`, { kind: 'error' });
  }
  return r.result(kind);
}

/* ───────────────────────── BST: Search ───────────────────────── */

export function bstSearch(tree, key) {
  const r = new Recorder(tree);
  const t = r.tree;
  r.vars = { key };
  r.step('def', `SEARCH(${key}): hər addımda yalnız bir budaq seçilir`);

  let cur = t.root;
  r.vars.cur = r.v(cur);
  if (cur != null) {
    r.current = cur;
    r.trail = [cur];
    r.states[cur] = 'path';
  }
  r.step('init', `cur ← root (${r.v(cur)})`);

  let steps = 0;
  while (cur != null) {
    const c = t.nodes[cur];
    steps++;
    if (key === c.value) {
      r.states[cur] = 'found';
      r.step('eq', `${key} = ${c.value} ✓ Tapıldı! (${steps} müqayisə)`, {
        kind: 'success',
        ghost: { text: `${key} = ${c.value}`, tone: 'good' },
      });
      return r.result('bstSearch');
    }
    const side = key < c.value ? 'left' : 'right';
    r.states[cur] = 'compare';
    r.step(
      side === 'left' ? 'lt' : 'gt',
      side === 'left' ? `${key} < ${c.value} → sola` : `${key} > ${c.value} → sağa`,
      { kind: 'compare', ghost: { text: `${key} ${side === 'left' ? '<' : '>'} ${c.value}`, dir: side } }
    );
    r.states[cur] = 'path';
    const next = c[side];
    if (next == null) {
      r.vars.cur = 'null';
      r.step('loop', `cur = null → dövr bitir`, { slot: { parent: cur, side } });
    } else {
      r.current = next;
      r.trail.push(next);
      r.states[next] = 'path';
      r.vars.cur = r.v(next);
    }
    cur = next;
  }
  r.current = null;
  r.step('nf', `${key} ağacda yoxdur (${steps} müqayisə)`, { kind: 'error' });
  return r.result('bstSearch');
}

/* ───────────────────────── Binary Tree: Delete ───────────────────────── */

export function btDelete(tree, key) {
  const r = new Recorder(tree);
  const t = r.tree;
  r.vars = { key };
  r.step('def', `DELETE(${key}): hədəf tapılır və ən dərin-sağ düyünlə əvəzlənir`);

  if (t.root == null) {
    r.step('rootNull', 'Ağac boşdur', { kind: 'error' });
    return r.result('btDelete');
  }

  const Q = [t.root];
  const syncQ = () => (r.vars.Q = list(Q.map((id) => r.v(id))));
  let target = null;
  let last = null;
  r.states[t.root] = 'queued';
  r.vars.target = 'null';
  syncQ();
  r.step('init', `Növbəyə kök (${r.v(t.root)}) əlavə olunur, target ← null`);

  while (Q.length) {
    const cur = Q.shift();
    const c = t.nodes[cur];
    last = cur;
    r.current = cur;
    r.vars.cur = c.value;
    syncQ();
    if (target == null && c.value === key) {
      target = cur;
      r.states[cur] = 'target';
      r.vars.target = c.value;
      r.step('eq', `${c.value} = ${key} → target ← ${c.value}`, {
        kind: 'compare',
        ghost: { text: `${c.value} = ${key}`, tone: 'good' },
      });
    } else {
      r.states[cur] = cur === target ? 'target' : 'active';
      r.step('deq', `Növbədən ${c.value} çıxarıldı${target == null ? ` (${c.value} ≠ ${key})` : ''}`);
    }

    const added = [];
    if (c.left != null) added.push(c.left);
    if (c.right != null) added.push(c.right);
    if (added.length) {
      added.forEach((id) => {
        Q.push(id);
        r.states[id] = 'queued';
      });
      syncQ();
      r.step(c.right != null ? 'enqR' : 'enqL', `Övladlar növbəyə əlavə olundu: ${added.map((id) => r.v(id)).join(', ')}`);
    }
    if (r.states[cur] !== 'target') r.states[cur] = 'visited';
  }

  if (target == null) {
    r.current = null;
    r.step('nf', `${key} ağacda yoxdur — heç nə silinmir`, { kind: 'error' });
    return r.result('btDelete');
  }

  r.current = last;
  if (last !== target) r.states[last] = 'replace';
  r.step('deep', `Ən dərin, ən sağdakı düyün: ${r.v(last)}`);

  if (last !== target) {
    t.nodes[target].value = t.nodes[last].value;
    r.states[target] = 'replace';
    r.current = target;
    r.vars.target = t.nodes[target].value;
    r.step('copy', `target.key ← ${r.v(last)} (${key} əvəzinə ${r.v(last)} yazıldı)`, { kind: 'compare' });
  }

  r.states[last] = 'removing';
  r.current = last;
  r.step('remove', `Ən dərin düyün (${r.v(last)}) öz yerindən silinir`);

  const p = parentOf(t, last);
  if (p) t.nodes[p.parent][p.side] = null;
  else t.root = null;
  delete t.nodes[last];
  delete r.states[last];
  r.current = last !== target ? target : null;
  if (last !== target) r.states[target] = 'found';
  r.step('remove', `${key} silindi ✓`, { kind: 'success' });
  return r.result('btDelete');
}

/* ───────────────────────── BST: Delete ───────────────────────── */

export function bstDelete(tree, key) {
  const r = new Recorder(tree);
  const t = r.tree;
  r.vars = { key };
  r.step('def', `DELETE(${key}): əvvəlcə düyün tapılır, sonra halına görə silinir`);

  let cur = t.root;
  let parent = null;
  r.vars.cur = r.v(cur);
  r.vars.parent = 'null';
  if (cur != null) {
    r.current = cur;
    r.trail = [cur];
    r.states[cur] = 'path';
  }
  r.step('init', `cur ← root (${r.v(cur)}), parent ← null`);

  while (cur != null && t.nodes[cur].value !== key) {
    const c = t.nodes[cur];
    parent = cur;
    r.vars.parent = c.value;
    const side = key < c.value ? 'left' : 'right';
    r.states[cur] = 'compare';
    r.step(
      side === 'left' ? 'lt' : 'gt',
      side === 'left' ? `${key} < ${c.value} → sola` : `${key} > ${c.value} → sağa`,
      { kind: 'compare', ghost: { text: `${key} ${side === 'left' ? '<' : '>'} ${c.value}`, dir: side } }
    );
    r.states[cur] = 'path';
    cur = c[side];
    r.vars.cur = r.v(cur);
    if (cur != null) {
      r.current = cur;
      r.trail.push(cur);
      r.states[cur] = 'path';
    } else {
      r.step('loop', `cur = null → dövr bitir`, { slot: { parent, side } });
    }
  }

  if (cur == null) {
    r.current = null;
    r.step('nf', `${key} ağacda yoxdur — silinəcək düyün yoxdur`, { kind: 'error' });
    return r.result('bstDelete');
  }

  const node = t.nodes[cur];
  r.states[cur] = 'target';
  r.step('loop', `${key} tapıldı — silinəcək düyün budur`, {
    kind: 'compare',
    ghost: { text: `${node.value} = ${key}`, tone: 'good' },
  });

  if (node.left != null && node.right != null) {
    r.step('two', `${node.value} iki övladlıdır → inorder varis (sağ alt ağacın ən kiçiyi) axtarılır`);
    let sp = cur;
    let s = node.right;
    r.states[s] = 'succ';
    r.current = s;
    r.trail.push(s);
    r.vars.s = r.v(s);
    r.vars.sp = r.v(sp);
    r.step('succ', `s ← ${node.value}.right (${r.v(s)})`);
    while (t.nodes[s].left != null) {
      r.states[s] = 'path';
      sp = s;
      s = t.nodes[s].left;
      r.states[s] = 'succ';
      r.current = s;
      r.trail.push(s);
      r.vars.s = r.v(s);
      r.vars.sp = r.v(sp);
      r.step('sStep', `${r.v(sp)}.left ≠ null → s ← ${r.v(s)}`);
    }
    r.step('sLoop', `${r.v(s)}.left = null → varis = ${r.v(s)}`, { slot: { parent: s, side: 'left' } });

    node.value = t.nodes[s].value;
    r.states[cur] = 'replace';
    r.current = cur;
    r.step('copy', `cur.key ← ${node.value} (${key} əvəzinə varisin dəyəri yazıldı)`, { kind: 'compare' });

    parent = sp;
    cur = s;
    r.states[cur] = 'removing';
    r.current = cur;
    r.vars.cur = r.v(cur);
    r.vars.parent = r.v(parent);
    r.step('shift', `İndi köhnə varis düyünü (${r.v(cur)}) silinəcək`);
  }

  const n = t.nodes[cur];
  const child = n.left ?? n.right;
  r.states[cur] = 'removing';
  r.vars.child = r.v(child);
  r.step(
    'child',
    child == null ? `child ← null (${n.value} yarpaq düyündür)` : `child ← ${r.v(child)} (${n.value}-in yeganə övladı)`
  );

  let line;
  if (parent == null) {
    t.root = child;
    line = 'isRoot';
  } else if (t.nodes[parent].left === cur) {
    t.nodes[parent].left = child;
    line = 'isLeft';
  } else {
    t.nodes[parent].right = child;
    line = 'isRight';
  }
  delete t.nodes[cur];
  delete r.states[cur];
  r.trail = r.trail.filter((id) => id !== cur);
  r.current = child ?? parent;
  r.step(
    line,
    child == null
      ? `${key} silindi ✓`
      : `${key} silindi ✓ — ${r.v(child)} ${parent == null ? 'yeni kök oldu' : 'yuxarı qalxdı'}`,
    { kind: 'success' }
  );
  return r.result('bstDelete');
}

/* ───────────────────────── BST: Balanslaşdırma (Perfect / Balanced) ───────────────────────── */

export function balanceBST(tree) {
  const r = new Recorder(tree);
  const t = r.tree;
  const oldHeight = treeHeight(t);
  const A = [];
  r.meta = { array: [], ai: -1, done: [], skipped: [], label: 'A[ ]' };
  r.step('def', `BALANCE: ağac sıralı massivə çevrilib ortadan yenidən qurulacaq (hündürlük indi ${oldHeight})`);

  r.vars = { A: '[]' };
  r.step('arr', 'A ← [] — boş massiv');

  // 1-ci mərhələ: inorder traversal → sıralı massiv
  let count = 0;
  const walk = (id) => {
    if (id == null) return;
    const n = t.nodes[id];
    walk(n.left);
    r.order[id] = ++count;
    r.states[id] = 'visited';
    r.current = id;
    A.push(n.value);
    r.meta.array = [...A];
    r.meta.ai = A.length - 1;
    r.vars.A = list(A);
    r.step('inorder', `Inorder ziyarət #${count}: A.push(${n.value})`);
    walk(n.right);
  };
  walk(t.root);

  if (!A.length) {
    r.step(null, 'Ağac boşdur — balanslaşdırılacaq düyün yoxdur', { kind: 'error' });
    return r.result('balance');
  }

  r.meta.ai = -1;
  r.current = null;
  r.step('inorder', `Sıralı massiv hazırdır: ${list(A)}`, { kind: 'success' });

  // 2-ci mərhələ: köhnə ağac sökülür, ortadan başlayaraq yenidən qurulur
  t.root = null;
  t.nodes = {};
  r.states = {};
  r.order = {};
  r.trail = [];
  r.meta.label = 'A[ ]';
  r.step('rebuild', 'root ← BUILD(A, 0, n − 1) — ağac ortadakı elementdən yenidən qurulur');

  const build = (lo, hi, parent, side) => {
    r.meta.range = [lo, hi];
    r.vars.lo = lo;
    r.vars.hi = hi;
    if (lo > hi) {
      r.meta.ai = -1;
      r.vars.mid = '—';
      r.current = parent;
      r.step('base', `BUILD(${lo}, ${hi}): lo > hi → return null`, parent ? { slot: { parent, side } } : {});
      return null;
    }
    const mid = Math.floor((lo + hi) / 2);
    r.meta.ai = mid;
    r.vars.mid = mid;
    r.current = parent;
    r.step('mid', `BUILD(${lo}, ${hi}): mid = ⌊(${lo} + ${hi}) / 2⌋ = ${mid} → A[${mid}] = ${A[mid]}`, {
      kind: 'compare',
    });

    const id = addNode(t, A[mid]);
    if (parent == null) t.root = id;
    else t.nodes[parent][side] = id;
    for (const k in r.states) if (r.states[k] === 'new') delete r.states[k];
    r.states[id] = 'new';
    r.current = id;
    r.meta.done.push(mid);
    r.step(
      'new',
      parent == null ? `${A[mid]} kök düyün oldu` : `${A[mid]}, ${r.v(parent)}-in ${sideAz(side)} övladı oldu`,
      { kind: 'success' }
    );

    build(lo, mid - 1, id, 'left');
    build(mid + 1, hi, id, 'right');
    r.meta.range = [lo, hi];
    r.vars.lo = lo;
    r.vars.hi = hi;
    r.vars.mid = mid;
    r.current = id;
    return id;
  };
  build(0, A.length - 1, null, null);

  const n = A.length;
  const h = treeHeight(t);
  const perfect = Number.isInteger(Math.log2(n + 1));
  r.meta.ai = -1;
  r.meta.range = null;
  r.states = {};
  r.current = null;
  r.vars = { n, 'h (əvvəl)': oldHeight, 'h (indi)': h };
  r.step(
    'ret',
    perfect
      ? `Perfect Binary Tree ✓ Hər daxili düyünün 2 övladı var. Hündürlük ${oldHeight} → ${h}, axtarış O(log n)`
      : `Balanslı ağac ✓ Hündürlük ${oldHeight} → ${h} (minimum). n = ${n} = 2^k − 1 olmadığı üçün tam perfect mümkün deyil`,
    { kind: 'success' }
  );
  return r.result('balance');
}

/* ───────────────────────── BFS / DFS ilə axtarış ───────────────────────── */

// BFS növbə (FIFO), DFS isə açıq stek (LIFO) istifadə edir — qalan məntiq eynidir.
function frontierSearch(tree, key, kind) {
  const isBfs = kind === 'bfs';
  const name = isBfs ? 'BFS' : 'DFS';
  const r = new Recorder(tree);
  const t = r.tree;
  let count = 0;
  r.vars = { key };
  r.step('def', `${name}(${key}): ${isBfs ? 'səviyyə-səviyyə, növbə (FIFO) ilə' : 'dərinliyə doğru, stek (LIFO) ilə'} axtarış`);

  if (t.root == null) {
    r.step('rootNull', 'Ağac boşdur — return null', { kind: 'error' });
    return r.result(kind);
  }

  const parent = {};
  for (const k in t.nodes) {
    const n = t.nodes[k];
    if (n.left != null) parent[n.left] = k;
    if (n.right != null) parent[n.right] = k;
  }
  const pathTo = (id) => {
    const p = [];
    for (let c = id; c != null; c = parent[c]) p.unshift(c);
    return p;
  };

  const F = [t.root];
  const varName = isBfs ? 'Q' : 'S';
  const sync = () => (r.vars[varName] = isBfs ? list(F.map((id) => r.v(id))) : `${list(F.map((id) => r.v(id)))} ← top`);
  r.states[t.root] = 'queued';
  sync();
  r.step('init', isBfs ? `Q ← queue(${r.v(t.root)})` : `S ← stack(${r.v(t.root)})`);

  while (F.length) {
    const cur = isBfs ? F.shift() : F.pop();
    const c = t.nodes[cur];
    r.current = cur;
    r.trail = pathTo(cur);
    r.order[cur] = ++count;
    r.visited.push(c.value);
    r.states[cur] = 'visited';
    r.vars.cur = c.value;
    sync();
    r.step(
      isBfs ? 'deq' : 'pop',
      `${isBfs ? 'Növbənin əvvəlindən' : 'Stekin üstündən'} ${c.value} götürülür — ziyarət #${count}`
    );

    if (c.value === key) {
      r.states[cur] = 'found';
      r.step('eq', `${c.value} = ${key} ✓ Tapıldı!`, { kind: 'success', ghost: { text: `${c.value} = ${key}`, tone: 'good' } });
      r.step('eq', `Nəticə: ${key} tapıldı (${count} düyün ziyarət edildi). Yol: ${r.trail.map((id) => r.v(id)).join(' → ')}`, {
        kind: 'success',
      });
      return r.result(kind);
    }
    r.step('eq', `${c.value} ≠ ${key} → davam`, { kind: 'compare', ghost: { text: `${c.value} ≠ ${key}`, tone: 'bad' } });

    // BFS: sol, sonra sağ. DFS: sağ, sonra sol (sol stekin üstündə qalsın deyə).
    const order = isBfs ? ['left', 'right'] : ['right', 'left'];
    const added = order.filter((s) => c[s] != null).map((s) => c[s]);
    if (added.length) {
      added.forEach((id) => {
        F.push(id);
        r.states[id] = 'queued';
      });
      sync();
      const lastSide = c[order[1]] != null ? order[1] : order[0];
      const line = isBfs ? (lastSide === 'left' ? 'enqL' : 'enqR') : lastSide === 'left' ? 'pushL' : 'pushR';
      r.step(line, `${isBfs ? 'Növbəyə' : 'Stekə'} əlavə olundu: ${added.map((id) => r.v(id)).join(', ')}`);
    }
  }

  r.current = null;
  r.trail = [];
  r.step('nf', `Nəticə: ${key} ağacda yoxdur (${count} düyünün hamısı yoxlanıldı)`, { kind: 'error' });
  return r.result(kind);
}

export const bfsSearch = (tree, key) => frontierSearch(tree, key, 'bfs');
export const dfsSearch = (tree, key) => frontierSearch(tree, key, 'dfs');
