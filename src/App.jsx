import { useCallback, useEffect, useState } from 'react';
import { LayoutGroup } from 'framer-motion';
import { Network } from 'lucide-react';
import NavRail from './components/NavRail';
import Workspace from './components/Workspace';
import { Toast } from './components/Overlays';
import TreeWorkspace from './structures/tree/TreeWorkspace';
import arrayConfig from './structures/array';
import linkedListConfig from './structures/linkedList';
import stackConfig from './structures/stack';
import queueConfig from './structures/queue';
import hashConfig from './structures/hash';
import { DTYPES } from './lib/values';

const STRUCTURES = [
  { ...arrayConfig, short: 'Access · Search · Sort' },
  { ...linkedListConfig, short: 'Insert · Reverse · Middle' },
  { ...stackConfig, short: 'LIFO · Push · Pop' },
  { ...queueConfig, short: 'FIFO · Circular' },
  { ...hashConfig, short: 'Chaining · Probing' },
  { id: 'tree', label: 'Binary Tree', icon: Network, short: 'BST · Traversal · BFS/DFS', Workspace: TreeWorkspace },
];

const load = (key, fallback) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* brauzer yaddaşı əlçatan deyil — problem deyil */
  }
};

const isStructure = (id) => STRUCTURES.some((s) => s.id === id);

export default function App() {
  // URL-dəki #id (məs. #stack) üstünlük təşkil edir — linklə birbaşa strukturu açmaq olur.
  const [active, setActive] = useState(() => {
    const fromHash = window.location.hash.slice(1);
    if (isStructure(fromHash)) return fromHash;
    const saved = load('dsvis.active', 'array');
    return isStructure(saved) ? saved : 'array';
  });

  useEffect(() => {
    const onHash = () => {
      const id = window.location.hash.slice(1);
      if (isStructure(id)) setActive(id);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const [dtype, setDtype] = useState(() => (load('dsvis.dtype', 'int') === 'string' ? 'string' : 'int'));
  const [collapsed, setCollapsed] = useState(() => load('dsvis.rail', '0') === '1');
  const [toast, setToast] = useState(null);

  const notify = useCallback((text, type = 'error') => {
    const id = Date.now();
    setToast({ id, text, type });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2800);
  }, []);

  const select = (id) => {
    setActive(id);
    save('dsvis.active', id);
    window.history.replaceState(null, '', `#${id}`);
  };

  const changeDtype = (t) => {
    if (t === dtype) return;
    setDtype(t);
    save('dsvis.dtype', t);
    notify(`Data tipi: ${DTYPES.find((d) => d.id === t).label} — bütün strukturlar yeni nümunə data ilə yeniləndi`, 'info');
  };

  const toggleRail = () => {
    setCollapsed((c) => {
      save('dsvis.rail', c ? '0' : '1');
      return !c;
    });
  };

  return (
    <div className="shell">
      <NavRail
        items={STRUCTURES}
        active={active}
        onSelect={select}
        dtype={dtype}
        onDtype={changeDtype}
        collapsed={collapsed}
        onCollapse={toggleRail}
      />
      <div className="main">
        {/* Bütün iş sahələri yaddaşda qalır — struktur dəyişəndə data itmir. */}
        {STRUCTURES.map((s) => {
          const Comp = s.Workspace ?? Workspace;
          return (
            <div key={s.id} className="ws-host" hidden={s.id !== active}>
              <LayoutGroup id={s.id}>
                <Comp config={s} dtype={dtype} active={s.id === active} notify={notify} />
              </LayoutGroup>
            </div>
          );
        })}
      </div>
      <Toast toast={toast} />
    </div>
  );
}
