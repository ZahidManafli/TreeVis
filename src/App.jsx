import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search, Trash2, Sparkles, Shuffle, Eraser, Network, GitFork, Layers, Ruler, Scale, Hash, Route } from 'lucide-react';
import TreeCanvas from './components/TreeCanvas';
import BuildModal from './components/BuildModal';
import { PseudoCode, InfoPanel, VarsPanel, StepLog } from './components/SidePanels';
import { PlayerBar, ArrayStrip, VisitStrip, StatusMessage, Legend, Toast } from './components/Overlays';
import { PSEUDO } from './lib/pseudocode';
import { btFromValues, bstFromValues, randomValues, countNodes, treeHeight, emptyTree } from './lib/tree';
import { btInsert, bstInsert, buildBST, traversalSearch, bstSearch, btDelete, bstDelete, balanceBST, bfsSearch, dfsSearch } from './lib/algorithms';
import { INFO } from './lib/info';

const BASE_DELAY = 950;
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

export default function App() {
  const [mode, setMode] = useState('bst');
  const [trees, setTrees] = useState(() => ({
    bt: btFromValues([8, 3, 12, 5, 9, 1, 7, 14]),
    bst: bstFromValues([50, 30, 70, 20, 40, 60, 80, 35, 65]),
  }));
  const [method, setMethod] = useState('pre');
  const [input, setInput] = useState('');
  const [anim, setAnim] = useState(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const inputRef = useRef(null);

  const notify = useCallback((text, type = 'error') => {
    const id = Date.now();
    setToast({ id, text, type });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2600);
  }, []);

  // Oynatma
  useEffect(() => {
    if (!playing || !anim) return;
    if (index >= anim.steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIndex((i) => i + 1), BASE_DELAY / speed);
    return () => clearTimeout(t);
  }, [playing, index, anim, speed]);

  const step = anim ? anim.steps[index] : null;
  const shownTree = step ? step.tree : trees[mode];
  const committed = trees[mode];
  const stats = useMemo(() => ({ n: countNodes(shownTree), h: treeHeight(shownTree) }), [shownTree]);

  const run = useCallback((result, targetMode) => {
    setTrees((prev) => ({ ...prev, [targetMode]: result.tree }));
    setAnim(result);
    setIndex(0);
    setPlaying(true);
  }, []);

  const readValue = () => {
    const s = input.trim();
    if (!/^-?\d+$/.test(s)) {
      notify('Zəhmət olmasa tam ədəd daxil edin');
      inputRef.current?.focus();
      return null;
    }
    const v = parseInt(s, 10);
    if (Math.abs(v) > 999) {
      notify('Dəyər -999 ilə 999 arasında olmalıdır');
      return null;
    }
    return v;
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

  const resetAnim = () => {
    setAnim(null);
    setPlaying(false);
    setIndex(0);
  };

  const switchMode = (m) => {
    if (m === mode) return;
    setMode(m);
    if (m === 'bt' && method === 'bst') setMethod('pre');
    resetAnim();
  };

  const onRandom = () => {
    const vals = randomValues(mode === 'bt' ? 7 + Math.floor(Math.random() * 4) : 9 + Math.floor(Math.random() * 4));
    setTrees((prev) => ({ ...prev, [mode]: mode === 'bt' ? btFromValues(vals) : bstFromValues(vals) }));
    resetAnim();
  };

  const onClear = () => {
    setTrees((prev) => ({ ...prev, [mode]: emptyTree() }));
    resetAnim();
  };

  const togglePlay = useCallback(() => {
    if (!anim) return;
    if (!playing && index >= anim.steps.length - 1) setIndex(0);
    setPlaying((p) => !p);
  }, [anim, playing, index]);

  const stepBy = useCallback(
    (d) => {
      if (!anim) return;
      setPlaying(false);
      setIndex((i) => Math.min(Math.max(i + d, 0), anim.steps.length - 1));
    },
    [anim]
  );

  const seek = (i) => {
    setPlaying(false);
    setIndex(i);
  };

  // Klaviatura: Space — oynat/dayandır, ← → — addımlar
  useEffect(() => {
    const onKey = (e) => {
      if (modalOpen || ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') stepBy(1);
      else if (e.key === 'ArrowLeft') stepBy(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, stepBy, modalOpen]);

  const methods = METHODS.filter((m) => !m.bstOnly || mode === 'bst');
  // Animasiya yoxdursa, seçilmiş axtarış metodunun psevdokodu və izahı göstərilir.
  const algoKey = anim ? anim.algo : method === 'bst' ? 'bstSearch' : method;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">
            <Network size={20} />
          </div>
          <div>
            <h1>TreeVis</h1>
            <span>Data Structures · Binary Tree Vizualizatoru</span>
          </div>
        </div>

        <div className="segmented mode-switch">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button key={id} className={mode === id ? 'on' : ''} onClick={() => switchMode(id)}>
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <div className="top-actions">
          <button className="btn btn-soft" onClick={onRandom} title="Təsadüfi ağac">
            <Shuffle size={16} /> <span className="hide-sm">Təsadüfi</span>
          </button>
          <button className="btn btn-soft" onClick={onClear} title="Ağacı təmizlə">
            <Eraser size={16} /> <span className="hide-sm">Təmizlə</span>
          </button>
          {mode === 'bst' && (
            <button className="btn btn-perfect" onClick={onPerfect} title="Ağacı perfect / balanslı BST-yə çevir">
              <Scale size={16} /> Make Perfect
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Sparkles size={16} /> BST qur
          </button>
        </div>
      </header>

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
                  placeholder="Ədəd daxil edin, məs. 42"
                  inputMode="numeric"
                  maxLength={4}
                  onChange={(e) => setInput(e.target.value.replace(/[^\d-]/g, ''))}
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
                <Route size={14} /> Axtarış
                <br />
                metodu
              </span>
              <div className="method-grid">
                {methods.map((m, i) => (
                  <Fragment key={m.id}>
                    {i > 0 && methods[i - 1].group !== m.group && <span className="method-sep" />}
                    <button
                      className={`method-btn ${method === m.id ? 'on' : ''}`}
                      onClick={() => setMethod(m.id)}
                    >
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
              <Legend />
            </div>
            {step?.meta && <ArrayStrip meta={step.meta} />}
            <div className="canvas-area">
              <TreeCanvas tree={shownTree} step={step} />
            </div>
            <VisitStrip visited={step?.visited} />
            <StatusMessage step={step} />
          </div>

          <PlayerBar
            total={anim?.steps.length ?? 0}
            index={index}
            playing={playing}
            speed={speed}
            onPlay={togglePlay}
            onStep={stepBy}
            onSeek={seek}
            onSpeed={setSpeed}
          />
        </section>

        <aside className="sidebar">
          <PseudoCode code={PSEUDO[algoKey]} activeLine={step?.line} />
          <InfoPanel info={INFO[algoKey]} title={PSEUDO[algoKey].title} idle={!anim} />
          <VarsPanel vars={step?.vars} />
          <StepLog steps={anim?.steps ?? []} index={index} onJump={seek} />
        </aside>
      </main>

      <BuildModal open={modalOpen} onClose={() => setModalOpen(false)} onBuild={onBuild} />
      <Toast toast={toast} />
    </div>
  );
}
