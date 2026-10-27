import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Variable, ListOrdered, CheckCircle2, XCircle, Scale, Info, BookOpen, ChevronDown, Lightbulb } from 'lucide-react';

const TOKEN_RE =
  /(\/\/.*$)|\b(procedure|function|if|then|else|while|do|return|for|to|and|not|break|continue|true|new)\b|\b(null)\b|\b([A-Z][A-Z_]+)(?=\()|(←|≠|<|>|=|\?|:)|(\b\d+\b)/g;

function highlight(text) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN_RE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const cls = m[1] ? 'tk-comment' : m[2] ? 'tk-kw' : m[3] ? 'tk-null' : m[4] ? 'tk-fn' : m[5] ? 'tk-op' : 'tk-num';
    out.push(
      <span key={m.index} className={cls}>
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function PseudoCode({ code, activeLine }) {
  if (!code) {
    return (
      <section className="card panel">
        <header className="panel-head">
          <Code2 size={16} />
          <h2>Psevdokod</h2>
        </header>
        <div className="panel-placeholder">
          <Info size={18} />
          <p>Əməliyyat seçin — alqoritmin psevdokodu burada addım-addım işıqlanacaq.</p>
        </div>
      </section>
    );
  }
  return (
    <section className="card panel">
      <header className="panel-head">
        <Code2 size={16} />
        <div className="panel-title">
          <h2>{code.title}</h2>
          <span>{code.subtitle}</span>
        </div>
        <span className="complexity">{code.complexity}</span>
      </header>
      <div className="code">
        {code.lines.map(([key, text], i) => {
          const active = key === activeLine;
          const indent = text.match(/^ */)[0].length;
          return (
            <div key={key} className={`code-line ${active ? 'active' : ''}`}>
              {active && <motion.div layoutId="code-hl" className="code-hl" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span className="ln">{i + 1}</span>
              <span className="lc" style={{ paddingLeft: indent * 7 }}>
                {highlight(text.trimStart())}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function InfoPanel({ info, title, idle }) {
  const [open, setOpen] = useState(true);
  if (!info) return null;
  return (
    <section className="card panel">
      <button className="panel-head panel-toggle" onClick={() => setOpen((o) => !o)}>
        <BookOpen size={16} />
        <div className="panel-title">
          <h2>Alqoritmin izahı</h2>
          <span>{idle ? `Seçilmiş metod: ${title}` : title}</span>
        </div>
        <ChevronDown size={16} className={`chev ${open ? 'open' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <p className="info-about">{info.about}</p>
            <h3 className="info-h">Necə işləyir</h3>
            <ol className="info-steps">
              {info.how.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            <div className="info-cx">
              <div>
                <span>Zaman</span>
                <b>{info.time}</b>
              </div>
              <div>
                <span>Yaddaş</span>
                <b>{info.space}</b>
              </div>
            </div>
            {info.note && (
              <div className="info-note">
                <Lightbulb size={15} />
                <p>{info.note}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export function VarsPanel({ vars }) {
  const entries = Object.entries(vars || {});
  return (
    <section className="card panel">
      <header className="panel-head">
        <Variable size={16} />
        <h2>Dəyişənlər</h2>
      </header>
      {entries.length ? (
        <div className="vars">
          {entries.map(([k, v]) => (
            <div key={k} className="var">
              <span className="var-k">{k}</span>
              <motion.span key={String(v)} className="var-v" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                {String(v)}
              </motion.span>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted small">Hələ dəyişən yoxdur.</p>
      )}
    </section>
  );
}

const KIND_ICON = { success: CheckCircle2, error: XCircle, compare: Scale };

export function StepLog({ steps, index, onJump }) {
  const ref = useRef(null);
  // Yalnız siyahının öz scroll-u hərəkət edir — scrollIntoView sağ paneli də sürüşdürürdü.
  useEffect(() => {
    const box = ref.current;
    const el = box?.querySelector('.log-item.current');
    if (!el) return;
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < box.scrollTop) box.scrollTo({ top, behavior: 'smooth' });
    else if (bottom > box.scrollTop + box.clientHeight) box.scrollTo({ top: bottom - box.clientHeight, behavior: 'smooth' });
  }, [index]);

  return (
    <section className="card panel panel-grow">
      <header className="panel-head">
        <ListOrdered size={16} />
        <h2>Addımlar</h2>
        {steps.length > 0 && (
          <span className="pill">
            {index + 1} / {steps.length}
          </span>
        )}
      </header>
      <div className="log" ref={ref}>
        {steps.length === 0 && <p className="muted small">Animasiya başladıqda hər addımın izahı burada görünəcək.</p>}
        {steps.slice(0, index + 1).map((s, i) => {
          const Icon = KIND_ICON[s.kind];
          return (
            <button
              key={i}
              className={`log-item kind-${s.kind} ${i === index ? 'current' : ''}`}
              onClick={() => onJump(i)}
              title="Bu addıma keç"
            >
              <span className="log-n">{i + 1}</span>
              {Icon && <Icon size={14} className="log-icon" />}
              <span className="log-msg">{s.msg}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
