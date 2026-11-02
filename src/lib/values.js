// Data tipləri: bütün strukturlar seçilmiş tiplə (int və ya string) işləyir.

export const DTYPES = [
  { id: 'int', label: 'Integer', badge: '123', example: '42', hint: 'Tam ədədlər · -999…999' },
  { id: 'string', label: 'String', badge: 'Aa', example: 'cat', hint: 'Sətirlər · 1–4 simvol, leksikoqrafik müqayisə' },
];

const WORDS = [
  'ant', 'ape', 'bat', 'bee', 'boa', 'cat', 'cod', 'cow', 'doe', 'dog', 'eel', 'elk', 'emu', 'ewe',
  'fox', 'gnu', 'hen', 'hog', 'jay', 'koi', 'owl', 'pig', 'pug', 'ram', 'ray', 'yak', 'bear', 'deer',
  'duck', 'frog', 'goat', 'hare', 'kiwi', 'lamb', 'lion', 'mole', 'moth', 'seal', 'swan', 'toad', 'wolf',
];

export function sanitizeValue(dtype, s) {
  return dtype === 'int'
    ? s.replace(/[^\d-]/g, '').slice(0, 4)
    : s.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4);
}

export function parseValue(dtype, raw) {
  const s = String(raw ?? '').trim();
  if (dtype === 'int') {
    if (!/^-?\d+$/.test(s)) return { error: 'Tam ədəd daxil edin (məs. 42)' };
    const v = parseInt(s, 10);
    if (Math.abs(v) > 999) return { error: 'Dəyər -999 ilə 999 arasında olmalıdır' };
    return { value: v };
  }
  if (!s) return { error: 'Sətir daxil edin (məs. cat)' };
  if (!/^[a-z0-9]{1,4}$/.test(s)) return { error: 'Sətir 1–4 kiçik hərf və ya rəqəmdən ibarət olmalıdır' };
  return { value: s };
}

export function parseIndex(raw) {
  const s = String(raw ?? '').trim();
  if (!/^\d+$/.test(s)) return { error: 'İndeks 0 və ya müsbət tam ədəd olmalıdır' };
  return { value: parseInt(s, 10) };
}

export function randomValues(dtype, n, min = 1, max = 99) {
  if (dtype === 'string') {
    const pool = [...WORDS];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, Math.min(n, pool.length));
  }
  const set = new Set();
  while (set.size < Math.min(n, max - min + 1)) set.add(Math.floor(Math.random() * (max - min + 1)) + min);
  return [...set];
}

export const valuePlaceholder = (dtype) => (dtype === 'int' ? 'Ədəd, məs. 42' : 'Sətir, məs. cat');
