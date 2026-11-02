const HASH_LINE = ['hdef', '// hash: int → k mod m · string → (Σ ascii(c)) mod m'];

export const PSEUDO = {
  chainInsert: {
    title: 'Insert — Separate Chaining',
    subtitle: 'Toqquşmada zəncirə əlavə',
    complexity: 'O(1) orta',
    lines: [
      HASH_LINE,
      ['def', 'procedure INSERT(T, key)'],
      ['hash', '  h ← hash(key)'],
      ['loop', '  for each x in T[h] do'],
      ['dup', '    if x = key then return   // dublikat'],
      ['append', '  T[h].append(key)'],
    ],
  },
  chainSearch: {
    title: 'Search — Separate Chaining',
    subtitle: 'Yalnız bir zəncir yoxlanılır',
    complexity: 'O(1) orta',
    lines: [
      HASH_LINE,
      ['def', 'function SEARCH(T, key)'],
      ['hash', '  h ← hash(key)'],
      ['loop', '  for each x in T[h] do'],
      ['eq', '    if x = key then return x'],
      ['nf', '  return null'],
    ],
  },
  chainDelete: {
    title: 'Delete — Separate Chaining',
    subtitle: 'Zəncirdən çıxarma',
    complexity: 'O(1) orta',
    lines: [
      HASH_LINE,
      ['def', 'procedure DELETE(T, key)'],
      ['hash', '  h ← hash(key)'],
      ['loop', '  for each x in T[h] do'],
      ['eq', '    if x = key then'],
      ['remove', '      T[h].remove(x); return'],
      ['nf', '  // tapılmadı'],
    ],
  },
  probeInsert: {
    title: 'Insert — Linear Probing',
    subtitle: 'Növbəti boş xananı tapmaq',
    complexity: 'O(1) orta',
    lines: [
      HASH_LINE,
      ['def', 'procedure INSERT(T, key)'],
      ['hash', '  h ← hash(key)'],
      ['loop', '  for i ← 0 to m - 1 do'],
      ['probe', '    j ← (h + i) mod m'],
      ['place', '    if T[j] = null or T[j] = DELETED then T[j] ← key; return'],
      ['dup', '    if T[j] = key then return   // dublikat'],
      ['full', '  error "cədvəl doludur"'],
    ],
  },
  probeSearch: {
    title: 'Search — Linear Probing',
    subtitle: 'Boş xanaya qədər ardıcıl sınaq',
    complexity: 'O(1) orta',
    lines: [
      HASH_LINE,
      ['def', 'function SEARCH(T, key)'],
      ['hash', '  h ← hash(key)'],
      ['loop', '  for i ← 0 to m - 1 do'],
      ['probe', '    j ← (h + i) mod m'],
      ['empty', '    if T[j] = null then return null'],
      ['eq', '    if T[j] = key then return j'],
      ['nf', '  return null'],
    ],
  },
  probeDelete: {
    title: 'Delete — Linear Probing',
    subtitle: 'Tombstone (DELETED) işarəsi',
    complexity: 'O(1) orta',
    lines: [
      HASH_LINE,
      ['def', 'procedure DELETE(T, key)'],
      ['hash', '  h ← hash(key)'],
      ['loop', '  for i ← 0 to m - 1 do'],
      ['probe', '    j ← (h + i) mod m'],
      ['nf', '    if T[j] = null then return   // tapılmadı'],
      ['eq', '    if T[j] = key then'],
      ['tomb', '      T[j] ← DELETED; return'],
    ],
  },
};

const HASH_HOW = 'Hash funksiyası açarı indeksə çevirir: int üçün k mod m, string üçün simvolların ASCII kodlarının cəmi mod m.';

export const INFO = {
  chainInsert: {
    about:
      'Hash Table açarı birbaşa indeksə çevirərək orta hesabla O(1)-də əlavə, axtarış və silmə imkanı verir. Separate Chaining-də hər xana (bucket) bir siyahı saxlayır — eyni indeksə düşən açarlar zəncirə əlavə olunur.',
    how: [HASH_HOW, 'T[h] zənciri dublikat üçün yoxlanılır.', 'Açar zəncirin sonuna əlavə olunur.'],
    time: 'O(1) orta · O(n) ən pis',
    space: 'O(n + m)',
    note: 'İki fərqli açarın eyni indeksə düşməsi "toqquşma" (collision) adlanır. Yükləmə əmsalı α = n / m böyüdükcə zəncirlər uzanır.',
  },
  chainSearch: {
    about: 'Axtarışda bütün cədvəl yox, yalnız açarın hash indeksindəki zəncir yoxlanılır.',
    how: [HASH_HOW, 'T[h] zəncirindəki elementlər bir-bir müqayisə olunur.', 'Tapılmasa, null qaytarılır.'],
    time: 'O(1 + α) orta',
    space: 'O(1)',
    note: 'Yaxşı hash funksiyası açarları kovalar arasında bərabər paylayır — zəncirlər qısa qalır.',
  },
  chainDelete: {
    about: 'Silmə də yalnız bir zəncirdə aparılır: açar tapılıb siyahıdan çıxarılır.',
    how: [HASH_HOW, 'T[h] zəncirində açar axtarılır.', 'Tapılarsa, zəncirdən silinir.'],
    time: 'O(1 + α) orta',
    space: 'O(1)',
    note: 'Chaining-də silmə sadədir — Linear Probing-dəki kimi tombstone lazım deyil.',
  },
  probeInsert: {
    about:
      'Open Addressing (Linear Probing) üsulunda bütün açarlar cədvəlin özündə saxlanılır. Xana doludursa, növbəti xanaya (j + 1) keçilir — boş yer tapılana qədər.',
    how: [HASH_HOW, 'j = (h + i) mod m, i = 0, 1, 2, … ardıcıl yoxlanılır.', 'İlk boş (və ya DELETED) xanaya açar yazılır.'],
    time: 'O(1) orta · O(m) ən pis',
    space: 'O(m)',
    note: 'Dolu xanalar bir-birinin ardınca yığılır (primary clustering) — α yüksəldikcə sınaq sayı kəskin artır.',
  },
  probeSearch: {
    about: 'Axtarış h-dən başlayıb ardıcıl xanaları yoxlayır. Boş (null) xanaya çatanda dayanır — çünki açar olsaydı, ən geci ora yazılardı.',
    how: [HASH_HOW, 'j = (h + i) mod m ardıcıl yoxlanılır.', 'T[j] = key → tapıldı; T[j] = null → yoxdur; DELETED → davam.'],
    time: 'O(1) orta',
    space: 'O(1)',
    note: 'DELETED xanalar axtarışı dayandırmır — bu, silmənin düzgün işləməsi üçün vacibdir.',
  },
  probeDelete: {
    about: 'Linear Probing-də silinən xanaya null yox, xüsusi DELETED (tombstone) işarəsi qoyulur.',
    how: [HASH_HOW, 'Açar ardıcıl sınaqla tapılır.', 'Xana DELETED kimi işarələnir.'],
    time: 'O(1) orta',
    space: 'O(1)',
    note: 'null qoysaydıq, həmin xanadan sonra yerləşmiş toqquşan açarlar axtarışda "itərdi".',
  },
};
