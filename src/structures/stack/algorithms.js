import { Recorder, newId, list } from '../../lib/recorder';

// Data: { cap, items: [{ id, value }] } — items[0] dib, items[n-1] üst (top). expr: mötərizə alqoritmi üçün.

export function createStack(vals, cap = 8) {
  return { cap, items: vals.slice(0, cap).map((value) => ({ id: newId('s'), value })), expr: null };
}

const show = (r) => list(r.data.items.map((x) => x.value));

export function push(d, { value }) {
  const r = new Recorder(d);
  const top = r.data.items.length - 1;
  r.vars = { top, capacity: r.data.cap };
  r.ptr = { top };
  r.step('def', `PUSH(${value}): element yalnız üstə əlavə olunur`);
  if (top === r.data.cap - 1) {
    r.step('full', `top = capacity − 1 (${top}) → Stack Overflow!`, { kind: 'error' });
    return r.result('push');
  }
  r.ptr = { top: top + 1 };
  r.vars.top = top + 1;
  r.step('inc', `top ← ${top} + 1 = ${top + 1}`);
  const item = { id: newId('s'), value };
  r.data.items.push(item);
  r.hl = { [item.id]: 'new' };
  r.step('set', `S[${top + 1}] ← ${value} — stek: ${show(r)}`, { kind: 'success' });
  return r.result('push');
}

export function pop(d) {
  const r = new Recorder(d);
  const top = r.data.items.length - 1;
  r.vars = { top };
  r.ptr = { top };
  r.step('def', 'POP: yalnız üstdəki element götürülə bilər (LIFO)');
  if (top === -1) {
    r.step('empty', 'top = -1 → Stack Underflow! (stek boşdur)', { kind: 'error' });
    return r.result('pop');
  }
  const item = r.data.items[top];
  r.hl = { [item.id]: 'removing' };
  r.vars.x = item.value;
  r.step('take', `x ← S[${top}] = ${item.value}`);
  r.data.items.pop();
  r.hl = {};
  r.ptr = { top: top - 1 };
  r.vars.top = top - 1;
  r.step('dec', `top ← ${top - 1}`);
  r.step('ret', `return ${item.value} — stek: ${show(r)}`, { kind: 'success' });
  return r.result('pop');
}

export function peek(d) {
  const r = new Recorder(d);
  const top = r.data.items.length - 1;
  r.vars = { top };
  r.ptr = { top };
  r.step('def', 'PEEK: üstdəki elementə baxılır, amma silinmir');
  if (top === -1) {
    r.step('empty', 'top = -1 → stek boşdur', { kind: 'error' });
    return r.result('peek');
  }
  const item = r.data.items[top];
  r.hl = { [item.id]: 'found' };
  r.step('ret', `S[top] = ${item.value} (stek dəyişmədi)`, { kind: 'success' });
  return r.result('peek');
}

/* ───────── Balanced Parentheses ───────── */

const OPEN = '([{';
const CLOSE = ')]}';
const PAIR = { ')': '(', ']': '[', '}': '{' };

export function balanced(d, { expr }) {
  const chars = [...expr];
  const opens = chars.filter((c) => OPEN.includes(c)).length;
  const r = new Recorder({ cap: Math.max(8, opens), items: [], expr: { chars, status: chars.map(() => ''), at: -1 } });
  const e = r.data.expr;
  const openIdx = [];
  r.vars = { expr };
  r.step('def', `IS_BALANCED("${expr}"): hər açılan mötərizə düzgün bağlanmalıdır`);
  r.step('init', 'S ← boş stek');

  const finish = (ok, line, msg) => {
    r.step(line, msg, { kind: ok ? 'success' : 'error' });
    // Əsas stek bərpa olunur — alqoritm müvəqqəti stekdə işlədi.
    const finalExpr = structuredClone(e);
    finalExpr.at = -1;
    r.data = { ...structuredClone(d), expr: finalExpr };
    r.hl = {};
    r.ptr = {};
    r.step(null, `Nəticə: ${ok ? 'true — balanslıdır ✓' : 'false — balanslı deyil ✗'} (əsas stek bərpa olundu)`, {
      kind: ok ? 'success' : 'error',
    });
    return { ...r.result('balanced'), data: structuredClone(d) };
  };

  for (let k = 0; k < chars.length; k++) {
    const ch = chars[k];
    e.at = k;
    r.vars = { k, ch: `'${ch}'`, S: list(r.data.items.map((x) => x.value)) };
    if (OPEN.includes(ch)) {
      r.step('open', `'${ch}' açılan mötərizədir`);
      const item = { id: newId('s'), value: ch };
      r.data.items.push(item);
      openIdx.push(k);
      e.status[k] = 'push';
      r.hl = { [item.id]: 'new' };
      r.ptr = { top: r.data.items.length - 1 };
      r.vars.S = list(r.data.items.map((x) => x.value));
      r.step('push', `S.push('${ch}')`);
    } else if (CLOSE.includes(ch)) {
      r.hl = {};
      r.step('close', `'${ch}' bağlanan mötərizədir — cütü stekin üstündə olmalıdır`);
      if (!r.data.items.length) {
        e.status[k] = 'bad';
        return finish(false, 'empty', `Stek boşdur — '${ch}' üçün açılan mötərizə yoxdur → return false`);
      }
      const top = r.data.items[r.data.items.length - 1];
      r.hl = { [top.id]: 'compare' };
      r.step('match', `S.pop() → '${top.value}'. '${top.value}' və '${ch}' cütdürmü?`, {
        kind: 'compare',
        badge: { text: `${top.value} … ${ch}` },
      });
      r.data.items.pop();
      r.ptr = { top: r.data.items.length - 1 };
      const o = openIdx.pop();
      if (PAIR[ch] !== top.value) {
        e.status[k] = 'bad';
        e.status[o] = 'bad';
        return finish(false, 'match', `'${top.value}' ilə '${ch}' uyğun deyil → return false`);
      }
      e.status[k] = 'match';
      e.status[o] = 'match';
      r.hl = {};
      r.vars.S = list(r.data.items.map((x) => x.value));
      r.step('match', `'${top.value}${ch}' cütü uyğundur ✓`, { badge: { text: `${top.value}${ch} ✓`, tone: 'good' } });
    } else {
      e.status[k] = 'skip';
      r.step('loop', `'${ch}' mötərizə deyil → keçilir`);
    }
  }
  e.at = -1;
  if (r.data.items.length === 0) return finish(true, 'ret', 'İfadə bitdi və stek boşdur → return true');
  openIdx.forEach((o) => (e.status[o] = 'bad'));
  return finish(false, 'ret', `İfadə bitdi, amma stekdə ${r.data.items.length} bağlanmamış mötərizə qaldı → return false`);
}
