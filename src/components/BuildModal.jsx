import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shuffle, ArrowLeft, ArrowRight, Sparkles, Hash } from 'lucide-react';
import { randomValues } from '../lib/tree';

const MAX_N = 20;
const isInt = (s) => /^-?\d{1,3}$/.test(s.trim());

export default function BuildModal({ open, onClose, onBuild }) {
  const [stage, setStage] = useState(1);
  const [n, setN] = useState('7');
  const [values, setValues] = useState([]);
  const [showErrors, setShowErrors] = useState(false);
  const nRef = useRef(null);
  const cellRefs = useRef([]);

  useEffect(() => {
    if (open) {
      setStage(1);
      setShowErrors(false);
      setTimeout(() => nRef.current?.select(), 80);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const nNum = parseInt(n, 10);
  const nValid = Number.isInteger(nNum) && nNum >= 1 && nNum <= MAX_N;

  const goNext = () => {
    if (!nValid) return;
    setValues((prev) => Array.from({ length: nNum }, (_, i) => prev[i] ?? ''));
    setShowErrors(false);
    setStage(2);
    setTimeout(() => cellRefs.current[0]?.focus(), 120);
  };

  const fillRandom = () => setValues(randomValues(values.length).map(String));

  const submit = () => {
    if (values.some((v) => !isInt(v))) {
      setShowErrors(true);
      const firstBad = values.findIndex((v) => !isInt(v));
      cellRefs.current[firstBad]?.focus();
      return;
    }
    onBuild(values.map((v) => parseInt(v, 10)));
  };

  const onCellKey = (e, i) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (i < values.length - 1) cellRefs.current[i + 1]?.focus();
      else submit();
    }
  };

  const filled = values.filter(isInt).length;
  const dupCount = values.filter(isInt).length - new Set(values.filter(isInt).map(Number)).size;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div
            className="modal"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header className="modal-head">
              <div className="modal-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <h2>Massivdən BST qur</h2>
                <p>{stage === 1 ? 'Addım 1/2 — massivin uzunluğunu daxil edin' : 'Addım 2/2 — elementləri daxil edin'}</p>
              </div>
              <button className="icon-btn ghost" onClick={onClose} title="Bağla (Esc)">
                <X size={18} />
              </button>
            </header>

            <div className="stepper">
              <span className={`stepper-dot ${stage >= 1 ? 'on' : ''}`}>1</span>
              <span className={`stepper-bar ${stage >= 2 ? 'on' : ''}`} />
              <span className={`stepper-dot ${stage >= 2 ? 'on' : ''}`}>2</span>
            </div>

            <AnimatePresence mode="wait">
              {stage === 1 ? (
                <motion.div key="s1" className="modal-body" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <label className="field-label">Massivin uzunluğu (n)</label>
                  <div className="n-input">
                    <Hash size={18} />
                    <input
                      ref={nRef}
                      type="number"
                      min={1}
                      max={MAX_N}
                      value={n}
                      onChange={(e) => setN(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && goNext()}
                    />
                  </div>
                  <div className="quick">
                    {[5, 7, 10, 15].map((q) => (
                      <button key={q} className={`chip ${nNum === q ? 'on' : ''}`} onClick={() => setN(String(q))}>
                        {q}
                      </button>
                    ))}
                  </div>
                  {!nValid && n !== '' && <p className="field-error">1 ilə {MAX_N} arasında ədəd daxil edin.</p>}
                  <p className="hint">Növbəti addımda {nValid ? nNum : 'n'} ədəd xana yaranacaq.</p>
                </motion.div>
              ) : (
                <motion.div key="s2" className="modal-body" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="cells-head">
                    <label className="field-label">A[0..{values.length - 1}]</label>
                    <button className="btn btn-soft sm" onClick={fillRandom}>
                      <Shuffle size={14} /> Təsadüfi doldur
                    </button>
                  </div>
                  <div className="cells">
                    {values.map((v, i) => (
                      <motion.div
                        key={i}
                        className="cell-wrap"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <input
                          ref={(el) => (cellRefs.current[i] = el)}
                          className={`cell-input ${showErrors && !isInt(v) ? 'invalid' : ''} ${isInt(v) ? 'filled' : ''}`}
                          value={v}
                          inputMode="numeric"
                          maxLength={4}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^\d-]/g, '');
                            setValues((prev) => prev.map((p, j) => (j === i ? val : p)));
                          }}
                          onKeyDown={(e) => onCellKey(e, i)}
                        />
                        <span className="cell-idx">[{i}]</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="cells-foot">
                    <span>
                      Doldurulub: <b>{filled}</b> / {values.length}
                    </span>
                    {dupCount > 0 && <span className="warn">{dupCount} dublikat — qurulma zamanı atlanacaq</span>}
                  </div>
                  {showErrors && <p className="field-error">Bütün xanalara -999…999 arası tam ədəd daxil edin.</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <footer className="modal-foot">
              {stage === 2 ? (
                <button className="btn btn-soft" onClick={() => setStage(1)}>
                  <ArrowLeft size={16} /> Geri
                </button>
              ) : (
                <button className="btn btn-soft" onClick={onClose}>
                  Ləğv et
                </button>
              )}
              {stage === 1 ? (
                <button className="btn btn-primary" onClick={goNext} disabled={!nValid}>
                  Davam <ArrowRight size={16} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={submit}>
                  <Sparkles size={16} /> Qur və animasiya et
                </button>
              )}
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
