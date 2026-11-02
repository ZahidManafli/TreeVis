import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search, Trash2, Sparkles, Shuffle, Eraser, Network, GitFork, Layers, Ruler, Scale, Hash, Route } from 'lucide-react';
import TreeCanvas from './TreeCanvas';
import BuildModal from './BuildModal';
import { PSEUDO } from './pseudocode';
import { INFO } from './info';
import { btFromValues, bstFromValues, countNodes, treeHeight, emptyTree } from './tree';
import { btInsert, bstInsert, buildBST, traversalSearch, bstSearch, btDelete, bstDelete, balanceBST, bfsSearch, dfsSearch } from './algorithms';
import { usePlayer } from '../../hooks/usePlayer';
import { parseValue, sanitizeValue, randomValues, valuePlaceholder } from '../../lib/values';
import { WorkspaceHeader, AlgoSidebar, Player, Legend } from '../../components/Layout';
import { ArrayStrip, VisitStrip, StatusMessage } from '../../components/Overlays';

const MAX_NODES = 40;

const MODES = [
  { id: 'bt', label: 'Binary Tree', icon: GitFork },
  { id: 'bst', label: 'Binary Search Tree', icon: Network },
];

const METHODS = [
  { id: 'pre', label: 'Preorder', hint: 'Kök → Sol → Sağ', group: 'rec' },
  { id: 'in', label: 'Inorder', hint: 'Sol → Kök → Sağ', group: 'rec' },
  { id: 'post', label: 'Postorder', hint: 'Sol → Sağ → Kök', group: 'rec' },
  { id: 'bfs', label: 'BFS', hint: 'Səviyyə · Queue', group: 'iter' },
  { id: 'dfs', label: 'DFS', hint: 'Dərinlik · Stack', group: 'iter' },
  { id: 'bst', label: 'BST Search', hint: 'Müqayisə · O(h)', group: 'bst', bstOnly: true },
];

const LEGEND = [
  ['path', 'Yol'],
  ['compare', 'Müqayisə'],
  ['queued', 'Növbədə'],
  ['visited', 'Ziyarət edilib'],
  ['found', 'Tapıldı'],
  ['new', 'Yeni'],
  ['target', 'Hədəf'],
  ['succ', 'Varis'],
  ['removing', 'Silinir'],
];

const SAMPLE = {
  int: { bt: [8, 3, 12, 5, 9, 1, 7, 14], bst: [50, 30, 70, 20, 40, 60, 80, 35, 65] },
  string: {
    bt: ['cat', 'dog', 'owl', 'fox', 'bee', 'yak', 'ant', 'emu'],
    bst: ['lion', 'cat', 'swan', 'bee', 'fox', 'owl', 'yak', 'dog', 'pig'],
  },
};

const sampleTrees = (dtype) => ({ bt: btFromValues(SAMPLE[dtype].bt), bst: bstFromValues(SAMPLE[dtype].bst) });

export default function TreeWorkspace({ dtype, active, notify }) {
  const [mode, setMode] = useState('bst');
  const [trees, setTrees] = useState(() => sampleTrees(dtype));
  const [method, setMethod] = useState('pre');
  const [input, setInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const inputRef = useRef(null);
  const player = usePlayer(active, modalOpen);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setTrees(sampleTrees(dtype));
    setInput('');
    player.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dtype]);

  const step = player.step;
  const shownTree = step ? step.tree : trees[mode];
  const committed = trees[mode];
  const stats = useMemo(() => ({ n: countNodes(shownTree), h: treeHeight(shownTree) }), [shownTree]);

  const run = (result, targetMode) => {
    setTrees((prev) => ({ ...prev, [targetMode]: result.tree }));
    player.run(result);
  };

  const readValue = () => {
    const r = parseValue(dtype, input);
    if (r.error) {
      notify(r.error);
      inputRef.current?.focus();
      return null;
    }
    return r.value;
  };

  const onInsert = () => {
    const v = readValue();
    if (v == null) return;
    if (countNodes(committed) >= MAX_NODES) return notify(`Maksimum ${MAX_NODES} düyün`);
    run(mode === 'bt' ? btInsert(committed, v) : bstInsert(committed, v), mode);
    setInput('');
  };

  const onSearch = () => {
    const v = readValue();
    if (v == null) return;
    const search = {
      bst: () => bstSearch(committed, v),
      bfs: () => bfsSearch(committed, v),
      dfs: () => dfsSearch(committed, v),
    }[method];
    run(search ? search() : traversalSearch(committed, v, method), mode);
  };

  const onDelete = () => {
    const v = readValue();
    if (v == null) return;
    run(mode === 'bt' ? btDelete(committed, v) : bstDelete(committed, v), mode);
    setInput('');
  };

  const onBuild = (values) => {
    setModalOpen(false);
    setMode('bst');
    run(buildBST(values), 'bst');
  };

  const onPerfect = () => {
    if (!committed.root) return notify('Ağac boşdur — əvvəlcə düyün əlavə edin');
    run(balanceBST(committed), 'bst');
  };

  const switchMode = (m) => {
    if (m === mode) return;
    setMode(m);
    if (m === 'bt' && method === 'bst') setMethod('pre');
    player.reset();
  };

  const onRandom = () => {
    const vals = randomValues(dtype, mode === 'bt' ? 7 + Math.floor(Math.random() * 4) : 9 + Math.floor(Math.random() * 4));
    setTrees((prev) => ({ ...prev, [mode]: mode === 'bt' ? btFromValues(vals) : bstFromValues(vals) }));
    player.reset();
  };

  const onClear = () => {
    setTrees((prev) => ({ ...prev, [mode]: emptyTree() }));
    player.reset();
  };

  const methods = METHODS.filter((m) => !m.bstOnly || mode === 'bst');
  // Animasiya yoxdursa, seçilmiş axtarış metodunun psevdokodu və izahı göstərilir.
  const algoKey = player.anim ? player.anim.algo : method === 'bst' ? 'bstSearch' : method;

  return (
    <>
      <WorkspaceHeader
        icon={Network}
        title="Binary Tree"
        tagline="BT · BST · Traversal · BFS / DFS · Balanslaşdırma"
        dtype={dtype}
        center={
          <div className="segmented mode-switch">
            {MODES.map(({ id, label, icon: Icon }) => (
              <button key={id} className={mode === id ? 'on' : ''} onClick={() => switchMode(id)}>
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        }
        actions={
          <>
            <button className="btn btn-soft" onClick={onRandom} title="Təsadüfi ağac">
              <Shuffle size={16} /> <span className="hide-sm">Təsadüfi</span>
            </button>
            <button className="btn btn-soft" onClick={onClear} title="Ağacı təmizlə">
              <Eraser size={16} /> <span className="hide-sm">Təmizlə</span>
            </button>
            {mode === 'bst' && (
              <button className="btn btn-perfect" onClick={onPerfect} title="Ağacı perfect / balanslı BST-yə çevir">
                <Scale size={16} /> <span className="hide-sm">Make Perfect</span>
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
              <Sparkles size={16} /> BST qur
            </button>
          </>
        }
      />

      <main className="workspace">
        <section className="stage">
          <div className="card toolbar">
            <div className="toolbar-row">
              <div className="value-input">
                <span className="value-tag">
                  <Hash size={14} /> Dəyər
                </span>
                <input
                  ref={inputRef}
                  value={input}
                  placeholder={valuePlaceholder(dtype)}
                  inputMode={dtype === 'int' ? 'numeric' : 'text'}
                  onChange={(e) => setInput(sanitizeValue(dtype, e.target.value))}
                  onKeyDown={(e) => e.key === 'Enter' && onInsert()}
                />
                <kbd className="kbd-hint">Enter ↵ Insert</kbd>
              </div>
              <div className="op-btns">
                <button className="btn btn-op op-insert" onClick={onInsert}>
                  <Plus size={16} /> Insert
                </button>
                <button className="btn btn-op op-search" onClick={onSearch}>
                  <Search size={16} /> Search
                </button>
                <button className="btn btn-op op-delete" onClick={onDelete}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>

            <div className="toolbar-row method-row">
              <span className="method-label">
                <Route size={14} /> Axtarış metodu
              </span>
              <div className="method-grid">
                {methods.map((m, i) => (
                  <Fragment key={m.id}>
                    {i > 0 && methods[i - 1].group !== m.group && <span className="method-sep" />}
                    <button className={`method-btn ${method === m.id ? 'on' : ''}`} onClick={() => setMethod(m.id)}>
                      <b>{m.label}</b>
                      <small>{m.hint}</small>
                    </button>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="card canvas">
            <div className="canvas-top">
              <div className="stats">
                <span className="stat">
                  <Layers size={14} /> Düyün: <b>{stats.n}</b>
                </span>
                <span className="stat">
                  <Ruler size={14} /> Hündürlük: <b>{stats.h}</b>
                </span>
                <span className={`stat mode-tag ${mode}`}>{mode === 'bt' ? 'Binary Tree' : 'BST'}</span>
              </div>
              <Legend items={LEGEND} prefix="node-" />
            </div>
            {step?.meta && <ArrayStrip meta={step.meta} />}
            <div className="canvas-area">
              <TreeCanvas tree={shownTree} step={step} />
            </div>
            <VisitStrip visited={step?.visited} />
            <StatusMessage step={step} />
          </div>

          <Player player={player} />
        </section>

        <AlgoSidebar algoKey={algoKey} pseudo={PSEUDO} info={INFO} player={player} />
      </main>

      <BuildModal open={modalOpen} dtype={dtype} onClose={() => setModalOpen(false)} onBuild={onBuild} />
    </>
  );
}
