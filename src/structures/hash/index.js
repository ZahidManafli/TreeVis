import { Hash, Plus, Search, Trash2 } from 'lucide-react';
import HashView from './HashView';
import { PSEUDO, INFO } from './content';
import {
  createTable,
  emptyTable,
  valuesOf,
  countOf,
  chainInsert,
  chainSearch,
  chainDelete,
  probeInsert,
  probeSearch,
  probeDelete,
} from './algorithms';
import { randomValues } from '../../lib/values';

const SAMPLE = { int: [15, 22, 8, 36, 4, 29], string: ['cat', 'dog', 'owl', 'fox', 'bee', 'yak'] };

const RUN = {
  insert: { chain: chainInsert, probe: probeInsert },
  search: { chain: chainSearch, probe: probeSearch },
  delete: { chain: chainDelete, probe: probeDelete },
};
const byMethod = (op) => (d, args) => RUN[op][d.method](d, args);

export default {
  id: 'hash',
  label: 'Hash Table',
  icon: Hash,
  tagline: 'Açar → hash(açar) → indeks · orta O(1)',
  View: HashView,
  PSEUDO,
  INFO,
  defaultAlgo: 'insert',
  algoKey: (id, d) => `${d.method}${id[0].toUpperCase()}${id.slice(1)}`,
  create: (dtype) => createTable('chain', SAMPLE[dtype]),
  random: (dtype, d) => createTable(d.method, randomValues(dtype, 5 + Math.floor(Math.random() * 3))),
  empty: (d) => emptyTable(d.method),
  stats: (d) => {
    const n = countOf(d);
    return [
      { label: 'Açar (n)', value: n },
      { label: 'Ölçü (m)', value: d.m },
      { label: 'Yükləmə α', value: (n / d.m).toFixed(2) },
    ];
  },
  legend: [
    ['active', 'Hash indeksi'],
    ['compare', 'Müqayisə'],
    ['visited', 'Yoxlanılıb'],
    ['found', 'Tapıldı'],
    ['new', 'Yeni'],
    ['removing', 'Silinir'],
    ['deleted', 'DELETED'],
  ],
  options: {
    label: 'Toqquşma həlli',
    get: (d) => d.method,
    apply: (d, method) => createTable(method, valuesOf(d)),
    choices: [
      { id: 'chain', label: 'Separate Chaining', hint: 'Hər kovada zəncir (linked list) · m = 7' },
      { id: 'probe', label: 'Linear Probing', hint: 'Növbəti boş xana · m = 11' },
    ],
  },
  inputs: [{ key: 'value', kind: 'value', label: 'Açar', enter: 'insert' }],
  ops: [
    { id: 'insert', label: 'Insert', icon: Plus, tone: 'insert', needs: ['value'], clear: ['value'], run: byMethod('insert') },
    { id: 'search', label: 'Search', icon: Search, tone: 'search', needs: ['value'], run: byMethod('search') },
    { id: 'delete', label: 'Delete', icon: Trash2, tone: 'delete', needs: ['value'], clear: ['value'], run: byMethod('delete') },
  ],
};
