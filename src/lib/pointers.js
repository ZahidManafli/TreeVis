// Göstərici (pointer) adlarına uyğun rənglər — bütün görünüşlərdə eyni.
const COLORS = {
  i: '#818cf8',
  j: '#fbbf24',
  'j+1': '#fbbf24',
  lo: '#22d3ee',
  hi: '#f43f5e',
  mid: '#34d399',
  min: '#c084fc',
  cur: '#fbbf24',
  prev: '#22d3ee',
  next: '#c084fc',
  node: '#34d399',
  slow: '#22d3ee',
  fast: '#f43f5e',
  head: '#818cf8',
  top: '#34d399',
  front: '#34d399',
  rear: '#c084fc',
  h: '#fbbf24',
};

export const ptrColor = (name) => COLORS[name] ?? '#a3aec4';

// { name: position } → { position: [names] }
export function groupPointers(ptr) {
  const groups = {};
  for (const [name, pos] of Object.entries(ptr ?? {})) {
    if (pos == null) continue;
    (groups[pos] ??= []).push(name);
  }
  return groups;
}
