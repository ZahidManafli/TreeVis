import { Rows3, MousePointerClick, Plus, Trash2 } from 'lucide-react';
import ArrayView from './ArrayView';
import { PSEUDO, INFO } from './content';
import {
  createArray,
  size,
  isSorted,
  access,
  insert,
  remove,
  linearSearch,
  binarySearch,
  bubbleSort,
  selectionSort,
  insertionSort,
} from './algorithms';
import { randomValues } from '../../lib/values';

const SAMPLE = { int: [34, 7, 23, 32, 5, 62, 14], string: ['owl', 'cat', 'yak', 'bee', 'fox', 'ant'] };

export default {
  id: 'array',
  label: 'Array',
  icon: Rows3,
  tagline: 'Ardıcıl yaddaş · indeksə görə O(1) müraciət',
  View: ArrayView,
  PSEUDO,
  INFO,
  defaultAlgo: 'insert',
  create: (dtype) => createArray(SAMPLE[dtype]),
  random: (dtype) => createArray(randomValues(dtype, 6 + Math.floor(Math.random() * 3))),
  empty: () => createArray([]),
  stats: (d) => [
    { label: 'Ölçü (n)', value: size(d) },
    { label: 'Tutum', value: d.cap },
    { label: 'Sıralı', value: isSorted(d) ? 'Bəli' : 'Xeyr' },
  ],
  legend: [
    ['compare', 'Müqayisə'],
    ['swap', 'Yerdəyişmə'],
    ['active', 'Sürüşür'],
    ['min', 'Minimum'],
    ['sorted', 'Sıralı'],
    ['found', 'Tapıldı'],
    ['new', 'Yeni'],
    ['removing', 'Silinir'],
  ],
  inputs: [
    { key: 'value', kind: 'value', label: 'Dəyər', enter: 'insert' },
    { key: 'index', kind: 'index', label: 'İndeks', placeholder: 'boş = son' },
  ],
  ops: [
    { id: 'access', label: 'Access', icon: MousePointerClick, tone: 'search', needs: ['index'], run: access },
    { id: 'insert', label: 'Insert', icon: Plus, tone: 'insert', needs: ['value'], optional: ['index'], clear: ['value'], run: insert },
    { id: 'delete', label: 'Delete', icon: Trash2, tone: 'delete', needs: ['index'], run: remove },
  ],
  algos: [
    { id: 'linear', label: 'Linear Search', hint: 'O(n)', group: 'search', needs: ['value'], run: linearSearch },
    { id: 'binary', label: 'Binary Search', hint: 'O(log n) · sıralı', group: 'search', needs: ['value'], run: binarySearch },
    { id: 'bubble', label: 'Bubble Sort', hint: 'O(n²)', group: 'sort', run: bubbleSort },
    { id: 'selection', label: 'Selection Sort', hint: 'O(n²)', group: 'sort', run: selectionSort },
    { id: 'insertion', label: 'Insertion Sort', hint: 'O(n²)', group: 'sort', run: insertionSort },
  ],
};
