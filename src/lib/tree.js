// Ağac strukturu: { root: id | null, nodes: { [id]: { id, value, left, right } } }

let uid = 0;

export const emptyTree = () => ({ root: null, nodes: {} });

export function addNode(tree, value) {
  const id = `n${++uid}`;
  tree.nodes[id] = { id, value, left: null, right: null };
  return id;
}

export function cloneTree(tree) {
  const nodes = {};
  for (const k in tree.nodes) nodes[k] = { ...tree.nodes[k] };
  return { root: tree.root, nodes };
}

export function countNodes(tree) {
  let n = 0;
  const walk = (id) => {
    if (id == null) return;
    n++;
    walk(tree.nodes[id].left);
    walk(tree.nodes[id].right);
  };
  walk(tree.root);
  return n;
}

export function treeHeight(tree, id = tree.root) {
  if (id == null) return 0;
  const n = tree.nodes[id];
  return 1 + Math.max(treeHeight(tree, n.left), treeHeight(tree, n.right));
}

export function parentOf(tree, childId) {
  for (const k in tree.nodes) {
    const n = tree.nodes[k];
    if (n.left === childId) return { parent: k, side: 'left' };
    if (n.right === childId) return { parent: k, side: 'right' };
  }
  return null;
}

// Inorder indeksinə əsaslanan yerləşmə: düyünlər heç vaxt üst-üstə düşmür.
export function layout(tree, hGap, vGap) {
  const pos = {};
  let i = 0;
  const walk = (id, depth) => {
    if (id == null) return;
    const n = tree.nodes[id];
    walk(n.left, depth + 1);
    pos[id] = { x: i * hGap, y: depth * vGap };
    i++;
    walk(n.right, depth + 1);
  };
  walk(tree.root, 0);
  return pos;
}

export function edgesOf(tree) {
  const edges = [];
  const walk = (id) => {
    if (id == null) return;
    const n = tree.nodes[id];
    if (n.left != null) edges.push({ parent: id, child: n.left });
    if (n.right != null) edges.push({ parent: id, child: n.right });
    walk(n.left);
    walk(n.right);
  };
  walk(tree.root);
  return edges;
}

export function bstFromValues(values) {
  const t = emptyTree();
  for (const v of values) {
    if (t.root == null) {
      t.root = addNode(t, v);
      continue;
    }
    let cur = t.root;
    while (true) {
      const c = t.nodes[cur];
      if (v === c.value) break;
      const side = v < c.value ? 'left' : 'right';
      if (c[side] == null) {
        c[side] = addNode(t, v);
        break;
      }
      cur = c[side];
    }
  }
  return t;
}

// Massivi səviyyə-səviyyə (complete binary tree kimi) yerləşdirir.
export function btFromValues(values) {
  const t = emptyTree();
  const ids = values.map((v) => addNode(t, v));
  ids.forEach((id, i) => {
    t.nodes[id].left = ids[2 * i + 1] ?? null;
    t.nodes[id].right = ids[2 * i + 2] ?? null;
  });
  t.root = ids[0] ?? null;
  return t;
}

export function randomValues(n, min = 1, max = 99) {
  const set = new Set();
  while (set.size < Math.min(n, max - min + 1)) {
    set.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return [...set];
}
