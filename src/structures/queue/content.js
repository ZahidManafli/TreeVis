export const PSEUDO = {
  enqueue: {
    title: 'Enqueue — Circular Queue',
    subtitle: 'Arxaya əlavə',
    complexity: 'O(1)',
    lines: [
      ['def', 'procedure ENQUEUE(Q, x)'],
      ['full', '  if size = capacity then error "Overflow"'],
      ['rear', '  rear ← (rear + 1) mod capacity'],
      ['set', '  Q[rear] ← x'],
      ['size', '  size ← size + 1'],
    ],
  },
  dequeue: {
    title: 'Dequeue — Circular Queue',
    subtitle: 'Öndən götürmə',
    complexity: 'O(1)',
    lines: [
      ['def', 'function DEQUEUE(Q)'],
      ['empty', '  if size = 0 then error "Underflow"'],
      ['take', '  x ← Q[front]'],
      ['clear', '  Q[front] ← null'],
      ['front', '  front ← (front + 1) mod capacity'],
      ['size', '  size ← size - 1; return x'],
    ],
  },
  peek: {
    title: 'Peek — Queue',
    subtitle: 'Öndəki elementə baxmaq',
    complexity: 'O(1)',
    lines: [
      ['def', 'function PEEK(Q)'],
      ['empty', '  if size = 0 then error "boş növbə"'],
      ['ret', '  return Q[front]'],
    ],
  },
  search: {
    title: 'Search — Circular Queue',
    subtitle: 'Modul indeksləmə ilə gəzinti',
    complexity: 'O(n)',
    lines: [
      ['def', 'function SEARCH(Q, key)'],
      ['loop', '  for k ← 0 to size - 1 do'],
      ['idx', '    i ← (front + k) mod capacity'],
      ['eq', '    if Q[i] = key then return i'],
      ['nf', '  return -1'],
    ],
  },
};

export const INFO = {
  enqueue: {
    about:
      'Queue — FIFO (First In, First Out): birinci gələn birinci çıxır, mağaza növbəsi kimi. Dairəvi (circular) növbədə massivin sonuna çatanda əvvələ qayıdılır, beləliklə boşalan yerlər yenidən istifadə olunur.',
    how: [
      'Növbənin dolu olmadığı yoxlanılır.',
      'rear = (rear + 1) mod capacity — sona çatanda 0-a qayıdır.',
      'Element Q[rear] xanasına yazılır, size artır.',
    ],
    time: 'O(1)',
    space: 'O(1)',
    note: 'Dairəvi olmasaydı, dequeue-dən sonra massivin əvvəlindəki boş xanalar israf olunardı (və ya hər dəfə O(n) sürüşdürmə lazım olardı).',
  },
  dequeue: {
    about: 'Dequeue həmişə ən öndəki (ən çox gözləyən) elementi götürür. Elementlər sürüşdürülmür — sadəcə front irəli gedir.',
    how: ['Növbənin boş olmadığı yoxlanılır.', 'x = Q[front] götürülür.', 'front = (front + 1) mod capacity, size azalır.'],
    time: 'O(1)',
    space: 'O(1)',
    note: 'İstifadə yerləri: printer növbəsi, CPU tapşırıq planlaşdırması, BFS, mesaj növbələri.',
  },
  peek: {
    about: 'Peek (Front) öndəki elementi qaytarır, amma növbədən çıxarmır.',
    how: ['Növbənin boş olmadığı yoxlanılır.', 'Q[front] qaytarılır.'],
    time: 'O(1)',
    space: 'O(1)',
    note: 'front və rear göstəriciləri sayəsində hər iki ucdakı elementə O(1)-də çatmaq olur.',
  },
  search: {
    about: 'Dairəvi növbədə elementlər massivdə "sarılmış" ola bilər, ona görə k-cı element (front + k) mod capacity indeksindədir.',
    how: ['k = 0-dan size − 1-ə qədər gedilir.', 'Faktiki indeks i = (front + k) mod capacity hesablanır.', 'Q[i] = key olarsa, tapıldı.'],
    time: 'O(n)',
    space: 'O(1)',
    note: 'Növbə axtarış üçün nəzərdə tutulmayıb, amma bu alqoritm modul indeksləməni yaxşı göstərir.',
  },
};
