import { Layers, ArrowDownToLine, ArrowUpFromLine, Eye } from 'lucide-react';
import StackView from './StackView';
import { PSEUDO, INFO } from './content';
import { createStack, push, pop, peek, balanced } from './algorithms';
import { randomValues } from '../../lib/values';

const SAMPLE = { int: [5, 18, 42, 7], string: ['cat', 'dog', 'owl', 'fox'] };

export default {
  id: 'stack',
  label: 'Stack',
  icon: Layers,
  tagline: 'LIFO — sonuncu girən birinci çıxır',
  View: StackView,
  PSEUDO,
  INFO,
  defaultAlgo: 'push',
  create: (dtype) => createStack(SAMPLE[dtype]),
  random: (dtype) => createStack(randomValues(dtype, 3 + Math.floor(Math.random() * 3))),
  empty: () => createStack([]),
  stats: (d) => [
    { label: 'Ölçü', value: d.items.length },
    { label: 'Tutum', value: d.cap },
    { label: 'Top', value: d.items.length ? d.items[d.items.length - 1].value : '—' },
  ],
  legend: [
    ['new', 'Push'],
    ['removing', 'Pop'],
    ['found', 'Peek'],
    ['compare', 'Cüt yoxlanılır'],
  ],
  inputs: [
    { key: 'value', kind: 'value', label: 'Dəyər', enter: 'push' },
    { key: 'expr', kind: 'text', label: 'İfadə', row: 2, placeholder: '{[()()]}', initial: '{[()()]}', max: 16 },
  ],
  ops: [
    { id: 'push', label: 'Push', icon: ArrowDownToLine, tone: 'insert', needs: ['value'], clear: ['value'], run: push },
    { id: 'pop', label: 'Pop', icon: ArrowUpFromLine, tone: 'delete', run: pop },
    { id: 'peek', label: 'Peek', icon: Eye, tone: 'search', run: peek },
  ],
  algos: [{ id: 'balanced', label: 'Balanced Parentheses', hint: 'O(n) · ( [ { } ] )', group: 'a', needs: ['expr'], run: balanced }],
};
