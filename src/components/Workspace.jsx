import { Fragment, useEffect, useRef, useState } from 'react';
import { Shuffle, Eraser, Play, Hash, ListOrdered, Type, Workflow } from 'lucide-react';
import { usePlayer } from '../hooks/usePlayer';
import { parseValue, parseIndex, sanitizeValue, valuePlaceholder } from '../lib/values';
import { WorkspaceHeader, AlgoSidebar, Player, Badge, Legend } from './Layout';
import { StatusMessage } from './Overlays';

const INPUT_ICON = { value: Hash, index: ListOrdered, text: Type };

// Array, Linked List, Stack, Queue və Hash Table üçün ümumi iş sahəsi.
// Hər struktur öz konfiqurasiyasını verir: data, əməliyyatlar, alqoritmlər, görünüş, psevdokod.
export default function Workspace({ config, dtype, active, notify }) {
  const [data, setData] = useState(() => config.create(dtype));
  const [vals, setVals] = useState(() => Object.fromEntries(config.inputs.map((i) => [i.key, i.initial ?? ''])));
  const [preview, setPreview] = useState(config.defaultAlgo);
  const player = usePlayer(active);
  const refs = useRef({});
  const firstRender = useRef(true);

  // Data tipi dəyişəndə struktur yeni tipdə nümunə ilə doldurulur.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setData(config.create(dtype));
    setVals((v) => ({ ...v, value: '' }));
    player.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dtype]);

  const step = player.step;
  const shown = step ? step.data : data;
  const View = config.View;

  const parseInput = (key) => {
    const def = config.inputs.find((i) => i.key === key);
    const raw = vals[key];
    if (def.kind === 'value') return parseValue(dtype, raw);
    if (def.kind === 'index') return parseIndex(raw);
    const s = String(raw ?? '').trim();
    return s ? { value: s } : { error: `${def.label} daxil edin` };
  };

  const exec = (op) => {
    const args = {};
    for (const key of op.needs ?? []) {
      const r = parseInput(key);
      if (r.error) {
        notify(r.error);
        refs.current[key]?.focus();
        return;
      }
      args[key] = r.value;
    }
    for (const key of op.optional ?? []) {
      if (String(vals[key] ?? '').trim() === '') continue;
      const r = parseInput(key);
      if (r.error) {
        notify(r.error);
        refs.current[key]?.focus();
        return;
      }
      args[key] = r.value;
    }
    const res = op.run(data, args, { dtype });
    if (res.error) return notify(res.error);
    setData(res.data);
    setPreview(op.id);
    player.run(res);
    if (op.clear) setVals((v) => ({ ...v, ...Object.fromEntries(op.clear.map((k) => [k, ''])) }));
  };

  const onInputChange = (def, raw) => {
    let v = raw;
    if (def.kind === 'value') v = sanitizeValue(dtype, raw);
    else if (def.kind === 'index') v = raw.replace(/\D/g, '').slice(0, 2);
    else v = raw.slice(0, def.max ?? 16);
    setVals((prev) => ({ ...prev, [def.key]: v }));
  };

  const onEnter = (def) => {
    const all = [...config.ops, ...(config.algos ?? [])];
    const op = all.find((o) => o.id === def.enter) ?? all.find((o) => (o.needs ?? []).includes(def.key));
    if (op) exec(op);
  };

  const onRandom = () => {
    setData(config.random(dtype, data));
    player.reset();
  };
  const onClear = () => {
    setData(config.empty(data));
    player.reset();
  };

  const opt = config.options;
  const onOption = (id) => {
    if (opt.get(data) === id) return;
    setData(opt.apply(data, id, dtype));
    player.reset();
  };

  // Əməliyyat id-si → psevdokod açarı (Hash Table-də metoddan asılıdır).
  const keyFor = (id) => (config.algoKey ? config.algoKey(id, data) : id);
  const algoKey = player.anim ? player.anim.algo : keyFor(preview);
  const row1Inputs = config.inputs.filter((i) => (i.row ?? 1) === 1);
  const row2Inputs = config.inputs.filter((i) => i.row === 2);

  const renderInput = (def) => {
    const Icon = INPUT_ICON[def.kind] ?? Hash;
    return (
      <div key={def.key} className={`value-input ${def.kind === 'index' ? 'narrow' : ''} ${def.kind === 'text' ? 'wide' : ''}`}>
        <span className="value-tag">
          <Icon size={14} /> {def.label}
        </span>
        <input
          ref={(el) => (refs.current[def.key] = el)}
          value={vals[def.key]}
          placeholder={def.kind === 'value' ? valuePlaceholder(dtype) : def.placeholder}
          inputMode={def.kind === 'index' || (def.kind === 'value' && dtype === 'int') ? 'numeric' : 'text'}
          onChange={(e) => onInputChange(def, e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onEnter(def)}
        />
      </div>
    );
  };

  return (
    <>
      <WorkspaceHeader
        icon={config.icon}
        title={config.label}
        tagline={config.tagline}
        dtype={dtype}
        center={
          opt && (
            <div className="opt-switch">
              <span className="opt-label">{opt.label}</span>
              <div className="segmented sm">
                {opt.choices.map((c) => (
                  <button key={c.id} className={opt.get(data) === c.id ? 'on' : ''} onClick={() => onOption(c.id)} title={c.hint}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )
        }
        actions={
          <>
            <button className="btn btn-soft" onClick={onRandom} title="Təsadüfi data">
              <Shuffle size={16} /> <span className="hide-sm">Təsadüfi</span>
            </button>
            <button className="btn btn-soft" onClick={onClear} title="Təmizlə">
              <Eraser size={16} /> <span className="hide-sm">Təmizlə</span>
            </button>
          </>
        }
      />

      <main className="workspace">
        <section className="stage">
          <div className="card toolbar">
            <div className="toolbar-row">
              {row1Inputs.map(renderInput)}
              <div className="op-btns">
                {config.ops.map((op) => {
                  const Icon = op.icon;
                  return (
                    <button
                      key={op.id}
                      className={`btn btn-op op-${op.tone}`}
                      onClick={() => exec(op)}
                      onMouseEnter={() => !player.anim && setPreview(op.id)}
                      title={op.title}
                    >
                      <Icon size={16} /> {op.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {config.algos?.length > 0 && (
              <div className="toolbar-row method-row">
                <span className="method-label">
                  <Workflow size={14} /> Alqoritmlər
                </span>
                {row2Inputs.length > 0 && <div className="row2-inputs">{row2Inputs.map(renderInput)}</div>}
                <div className="method-grid">
                  {config.algos.map((a, i) => (
                    <Fragment key={a.id}>
                      {i > 0 && config.algos[i - 1].group !== a.group && <span className="method-sep" />}
                      <button
                        className={`method-btn action ${algoKey === keyFor(a.id) ? 'on' : ''}`}
                        onClick={() => exec(a)}
                        onMouseEnter={() => !player.anim && setPreview(a.id)}
                      >
                        <b>
                          <Play size={11} className="play-ico" /> {a.label}
                        </b>
                        <small>{a.hint}</small>
                      </button>
                    </Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card canvas">
            <div className="canvas-top">
              <div className="stats">
                {config.stats(shown).map((s) => (
                  <span key={s.label} className="stat">
                    {s.label}: <b>{s.value}</b>
                  </span>
                ))}
              </div>
              <Legend items={config.legend} />
            </div>
            <div className="canvas-area">
              <Badge badge={step?.badge} />
              <View data={shown} step={step} dtype={dtype} />
            </div>
            <StatusMessage step={step} />
          </div>

          <Player player={player} />
        </section>

        <AlgoSidebar algoKey={algoKey} pseudo={config.PSEUDO} info={config.INFO} player={player} />
      </main>
    </>
  );
}
