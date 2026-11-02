import { ArrowLeftRight, LogIn, LogOut, Eye } from 'lucide-react';
import QueueView from './QueueView';
import { PSEUDO, INFO } from './content';
import { createQueue, enqueue, dequeue, peek, search } from './algorithms';
import { randomValues } from '../../lib/values';

const SAMPLE = { int: [14, 3, 27, 9, 30], string: ['cat', 'dog', 'owl', 'fox', 'bee'] };

export default {
  id: 'queue',
  label: 'Queue',
  icon: ArrowLeftRight,
  tagline: 'FIFO — dairəvi (circular) növbə',
  View: QueueView,
  PSEUDO,
  INFO,
  defaultAlgo: 'enqueue',
  create: (dtype) => createQueue(SAMPLE[dtype]),
  random: (dtype) => createQueue(randomValues(dtype, 3 + Math.floor(Math.random() * 4)), 8, Math.floor(Math.random() * 8)),
  empty: () => createQueue([], 8, 0),
  stats: (d) => [
    { label: 'Ölçü', value: d.size },
    { label: 'Tutum', value: d.cap },
    { label: 'Front', value: d.size ? d.slots[d.front].value : '—' },
  ],
  legend: [
    ['new', 'Enqueue'],
    ['removing', 'Dequeue'],
    ['compare', 'Müqayisə'],
    ['found', 'Tapıldı'],
    ['visited', 'Yoxlanılıb'],
  ],
  inputs: [{ key: 'value', kind: 'value', label: 'Dəyər', enter: 'enqueue' }],
  ops: [
    { id: 'enqueue', label: 'Enqueue', icon: LogIn, tone: 'insert', needs: ['value'], clear: ['value'], run: enqueue },
    { id: 'dequeue', label: 'Dequeue', icon: LogOut, tone: 'delete', run: dequeue },
    { id: 'peek', label: 'Peek', icon: Eye, tone: 'search', run: peek },
  ],
  algos: [{ id: 'search', label: 'Search', hint: 'O(n) · (front + k) mod cap', group: 'a', needs: ['value'], run: search }],
};
