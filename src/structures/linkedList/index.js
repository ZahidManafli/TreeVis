import { Link2, ListStart, ListEnd, ListPlus, Trash2 } from 'lucide-react';
import LinkedListView from './LinkedListView';
import { PSEUDO, INFO } from './content';
import { createList, length, insertHead, insertTail, insertAt, deleteValue, search, reverse, findMiddle } from './algorithms';
import { randomValues } from '../../lib/values';

const SAMPLE = { int: [12, 7, 25, 3, 18], string: ['cat', 'dog', 'owl', 'fox', 'bee'] };

export default {
  id: 'linkedList',
  label: 'Linked List',
  icon: Link2,
  tagline: 'Singly linked · düyünlər göstəricilərlə bağlanır',
  View: LinkedListView,
  PSEUDO,
  INFO,
  defaultAlgo: 'insertHead',
  create: (dtype) => createList(SAMPLE[dtype]),
  random: (dtype) => createList(randomValues(dtype, 4 + Math.floor(Math.random() * 3))),
  empty: () => createList([]),
  stats: (d) => [
    { label: 'Uzunluq', value: length(d) },
    { label: 'Head', value: d.nodes[d.head]?.value ?? 'null' },
  ],
  legend: [
    ['path', 'Gəzilən'],
    ['compare', 'Müqayisə'],
    ['visited', 'Yoxlanılıb'],
    ['found', 'Tapıldı'],
    ['new', 'Yeni'],
    ['sorted', 'Çevrilib'],
    ['removing', 'Silinir'],
  ],
  inputs: [
    { key: 'value', kind: 'value', label: 'Dəyər', enter: 'insertHead' },
    { key: 'index', kind: 'index', label: 'Mövqe', placeholder: 'i' },
  ],
  ops: [
    { id: 'insertHead', label: 'Head', title: 'Başa əlavə et', icon: ListStart, tone: 'insert', needs: ['value'], clear: ['value'], run: insertHead },
    { id: 'insertTail', label: 'Tail', title: 'Sona əlavə et', icon: ListEnd, tone: 'insert', needs: ['value'], clear: ['value'], run: insertTail },
    { id: 'insertAt', label: 'At i', title: 'i-ci mövqeyə əlavə et', icon: ListPlus, tone: 'insert', needs: ['value', 'index'], clear: ['value'], run: insertAt },
    { id: 'delete', label: 'Delete', icon: Trash2, tone: 'delete', needs: ['value'], clear: ['value'], run: deleteValue },
  ],
  algos: [
    { id: 'search', label: 'Search', hint: 'O(n) · ardıcıl', group: 'a', needs: ['value'], run: search },
    { id: 'reverse', label: 'Reverse', hint: 'O(n) · 3 göstərici', group: 'b', run: reverse },
    { id: 'middle', label: 'Find Middle', hint: 'O(n) · slow / fast', group: 'b', run: findMiddle },
  ],
};
