export const PSEUDO = {
  push: {
    title: 'Push — Stack',
    subtitle: 'Üstə əlavə etmək',
    complexity: 'O(1)',
    lines: [
      ['def', 'procedure PUSH(S, x)'],
      ['full', '  if top = capacity - 1 then error "Overflow"'],
      ['inc', '  top ← top + 1'],
      ['set', '  S[top] ← x'],
    ],
  },
  pop: {
    title: 'Pop — Stack',
    subtitle: 'Üstdən götürmək',
    complexity: 'O(1)',
    lines: [
      ['def', 'function POP(S)'],
      ['empty', '  if top = -1 then error "Underflow"'],
      ['take', '  x ← S[top]'],
      ['dec', '  top ← top - 1'],
      ['ret', '  return x'],
    ],
  },
  peek: {
    title: 'Peek — Stack',
    subtitle: 'Üstə baxmaq (silmədən)',
    complexity: 'O(1)',
    lines: [
      ['def', 'function PEEK(S)'],
      ['empty', '  if top = -1 then error "boş stek"'],
      ['ret', '  return S[top]'],
    ],
  },
  balanced: {
    title: 'Balanced Parentheses',
    subtitle: 'Stek ilə mötərizə yoxlaması',
    complexity: 'O(n)',
    lines: [
      ['def', 'function IS_BALANCED(expr)'],
      ['init', '  S ← empty stack'],
      ['loop', '  for each ch in expr do'],
      ['open', '    if ch ∈ { (, [, { } then'],
      ['push', '      S.push(ch)'],
      ['close', '    else if ch ∈ { ), ], } } then'],
      ['empty', '      if S is empty then return false'],
      ['match', '      if S.pop() ≠ pair(ch) then return false'],
      ['ret', '  return S is empty'],
    ],
  },
};

export const INFO = {
  push: {
    about:
      'Stack — LIFO (Last In, First Out) prinsipi ilə işləyən strukturdur: sonuncu əlavə olunan element birinci çıxır. Boşqab yığını kimi düşünün.',
    how: ['Stekin dolu olmadığı yoxlanılır (top = capacity − 1 → Overflow).', 'top bir vahid artırılır.', 'Yeni element S[top] xanasına yazılır.'],
    time: 'O(1)',
    space: 'O(1)',
    note: 'İstifadə yerləri: funksiya çağırışları (call stack), Undo, brauzerdə "Geri" düyməsi, DFS.',
  },
  pop: {
    about: 'Pop yalnız ən üstdəki elementi götürür. Ortadakı elementə birbaşa çatmaq mümkün deyil.',
    how: ['Stekin boş olmadığı yoxlanılır (top = −1 → Underflow).', 'x = S[top] götürülür.', 'top bir vahid azalır, x qaytarılır.'],
    time: 'O(1)',
    space: 'O(1)',
    note: 'Boş stekdən pop etmək "Stack Underflow" xətasıdır.',
  },
  peek: {
    about: 'Peek (Top) üstdəki elementi qaytarır, amma stekdən silmir.',
    how: ['Stekin boş olmadığı yoxlanılır.', 'S[top] qaytarılır — top dəyişmir.'],
    time: 'O(1)',
    space: 'O(1)',
    note: 'Çox vaxt pop etməzdən əvvəl qərar vermək üçün istifadə olunur.',
  },
  balanced: {
    about:
      'Stekin klassik tətbiqi: ifadədəki mötərizələrin düzgün açılıb-bağlandığını yoxlamaq. Sonuncu açılan mötərizə birinci bağlanmalıdır — bu, LIFO-nun özüdür.',
    how: [
      'Açılan mötərizə ( [ { görüləndə stekə push edilir.',
      'Bağlanan mötərizə ) ] } görüləndə stekin üstü pop edilib cütü yoxlanılır.',
      'Stek boşdursa və ya cüt uyğun deyilsə — balanslı deyil.',
      'Sonda stek boş qalmalıdır.',
    ],
    time: 'O(n)',
    space: 'O(n)',
    note: 'Kompilyatorlar və kod redaktorları mötərizə xətalarını məhz bu üsulla tapır. Sınayın: {[()()]}, ([)], ((()',
  },
};
