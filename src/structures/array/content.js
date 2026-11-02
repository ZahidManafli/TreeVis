export const PSEUDO = {
  access: {
    title: 'Access — Array',
    subtitle: 'İndeksə görə birbaşa müraciət',
    complexity: 'O(1)',
    lines: [
      ['def', 'function ACCESS(A, i)'],
      ['bounds', '  if i < 0 or i ≥ n then error "out of bounds"'],
      ['addr', '  address ← base + i × elementSize'],
      ['ret', '  return A[i]'],
    ],
  },
  insert: {
    title: 'Insert — Array',
    subtitle: 'Sağa sürüşdürərək yer açmaq',
    complexity: 'O(n)',
    lines: [
      ['def', 'procedure INSERT(A, i, x)'],
      ['full', '  if n = capacity then error "massiv doludur"'],
      ['bounds', '  if i < 0 or i > n then error "yanlış indeks"'],
      ['loop', '  for j ← n - 1 downto i do'],
      ['shift', '    A[j + 1] ← A[j]'],
      ['set', '  A[i] ← x'],
      ['inc', '  n ← n + 1'],
    ],
  },
  delete: {
    title: 'Delete — Array',
    subtitle: 'Sola sürüşdürərək boşluğu bağlamaq',
    complexity: 'O(n)',
    lines: [
      ['def', 'procedure DELETE(A, i)'],
      ['bounds', '  if i < 0 or i ≥ n then error "yanlış indeks"'],
      ['take', '  x ← A[i]'],
      ['loop', '  for j ← i to n - 2 do'],
      ['shift', '    A[j] ← A[j + 1]'],
      ['dec', '  n ← n - 1'],
    ],
  },
  linear: {
    title: 'Linear Search',
    subtitle: 'Ardıcıl axtarış',
    complexity: 'O(n)',
    lines: [
      ['def', 'function LINEAR_SEARCH(A, key)'],
      ['loop', '  for i ← 0 to n - 1 do'],
      ['eq', '    if A[i] = key then return i'],
      ['nf', '  return -1   // tapılmadı'],
    ],
  },
  binary: {
    title: 'Binary Search',
    subtitle: 'Sıralı massivdə yarıya bölmə',
    complexity: 'O(log n)',
    lines: [
      ['def', 'function BINARY_SEARCH(A, key)'],
      ['init', '  lo ← 0; hi ← n - 1'],
      ['loop', '  while lo ≤ hi do'],
      ['mid', '    mid ← ⌊(lo + hi) / 2⌋'],
      ['eq', '    if A[mid] = key then return mid'],
      ['lt', '    else if A[mid] < key then lo ← mid + 1'],
      ['gt', '    else hi ← mid - 1'],
      ['nf', '  return -1   // tapılmadı'],
    ],
  },
  bubble: {
    title: 'Bubble Sort',
    subtitle: 'Qonşuları müqayisə et və dəyiş',
    complexity: 'O(n²)',
    lines: [
      ['def', 'procedure BUBBLE_SORT(A)'],
      ['outer', '  for i ← 0 to n - 2 do'],
      ['flag', '    swapped ← false'],
      ['inner', '    for j ← 0 to n - 2 - i do'],
      ['cmp', '      if A[j] > A[j + 1] then'],
      ['swap', '        swap(A[j], A[j + 1]); swapped ← true'],
      ['break', '    if not swapped then break'],
    ],
  },
  selection: {
    title: 'Selection Sort',
    subtitle: 'Minimumu seç və əvvələ qoy',
    complexity: 'O(n²)',
    lines: [
      ['def', 'procedure SELECTION_SORT(A)'],
      ['outer', '  for i ← 0 to n - 2 do'],
      ['min', '    min ← i'],
      ['inner', '    for j ← i + 1 to n - 1 do'],
      ['cmp', '      if A[j] < A[min] then min ← j'],
      ['swap', '    if min ≠ i then swap(A[i], A[min])'],
    ],
  },
  insertion: {
    title: 'Insertion Sort',
    subtitle: 'Elementi sıralı hissəyə taxmaq',
    complexity: 'O(n²)',
    lines: [
      ['def', 'procedure INSERTION_SORT(A)'],
      ['outer', '  for i ← 1 to n - 1 do'],
      ['key', '    key ← A[i]'],
      ['j', '    j ← i - 1'],
      ['while', '    while j ≥ 0 and A[j] > key do'],
      ['shift', '      A[j + 1] ← A[j]'],
      ['dec', '      j ← j - 1'],
      ['place', '    A[j + 1] ← key'],
    ],
  },
};

export const INFO = {
  access: {
    about:
      'Massiv elementləri yaddaşda ardıcıl (yan-yana) saxlanılır. Ona görə istənilən elementin ünvanı sadə düsturla dərhal hesablanır — dövr və axtarış lazım deyil.',
    how: [
      'İndeksin 0 ≤ i < n aralığında olduğu yoxlanılır.',
      'Ünvan hesablanır: base + i × elementSize (burada int = 4 bayt).',
      'Həmin ünvandakı dəyər qaytarılır.',
    ],
    time: 'O(1)',
    space: 'O(1)',
    note: 'Random access — massivin əsas üstünlüyüdür. Linked List-də eyni əməliyyat O(n) çəkir.',
  },
  insert: {
    about:
      'Ortaya element əlavə etmək üçün həmin mövqedən sağdakı bütün elementlər bir xana sağa sürüşdürülür ki, yer açılsın.',
    how: [
      'Massivin dolu olmadığı və indeksin düzgün olduğu yoxlanılır.',
      'Sonuncu elementdən başlayaraq i-ci mövqeyə qədər hər element bir xana sağa köçürülür.',
      'Boşalan A[i] xanasına yeni dəyər yazılır, n bir vahid artır.',
    ],
    time: 'O(n) — sona əlavə: O(1)',
    space: 'O(1)',
    note: 'Sürüşdürmə sağdan sola aparılır — əks istiqamətdə etsək, elementlər bir-birinin üzərinə yazılıb itərdi.',
  },
  delete: {
    about: 'Element silindikdə yaranan boşluq sağdakı elementləri bir xana sola sürüşdürməklə bağlanır.',
    how: [
      'İndeksin düzgünlüyü yoxlanılır.',
      'A[i] götürülür (silinir).',
      'i-dən sona qədər hər element bir xana sola köçürülür.',
      'n bir vahid azalır.',
    ],
    time: 'O(n) — sondan silmə: O(1)',
    space: 'O(1)',
    note: 'Ardıcıllıq vacib deyilsə, silinən yerə sonuncu elementi qoymaqla O(1)-də silmək olar.',
  },
  linear: {
    about: 'Ən sadə axtarış: elementlər əvvəldən sona bir-bir açarla müqayisə edilir. Massivin sıralı olması tələb olunmur.',
    how: ['i = 0-dan başlanır.', 'A[i] = key olarsa, i qaytarılır.', 'Massiv bitərsə, -1 qaytarılır (tapılmadı).'],
    time: 'O(n) — ən yaxşı: O(1)',
    space: 'O(1)',
    note: 'Kiçik və ya sırasız massivlər üçün idealdır. Linked List-də də eyni qaydada işləyir.',
  },
  binary: {
    about:
      'Sıralı massivdə hər addımda ortadakı element yoxlanılır və axtarış aralığı yarıya endirilir. 1 000 000 elementdə belə ən çox ~20 müqayisə kifayətdir.',
    how: [
      'lo = 0, hi = n − 1 götürülür.',
      'mid = ⌊(lo + hi) / 2⌋ hesablanır.',
      'A[mid] = key → tapıldı. A[mid] < key → sağ yarıda (lo = mid + 1), əks halda sol yarıda (hi = mid − 1) axtarılır.',
      'lo > hi olarsa, element yoxdur.',
    ],
    time: 'O(log n)',
    space: 'O(1)',
    note: 'Massiv mütləq sıralı olmalıdır. Solğun xanalar artıq axtarışdan kənarlaşdırılmış hissədir.',
  },
  bubble: {
    about:
      'Qonşu elementlər müqayisə edilir və səhv ardıcıllıqdadırsa, yerləri dəyişdirilir. Hər keçiddən sonra ən böyük element sona "üzür".',
    how: [
      'Massiv boyunca qonşu cütlər (A[j], A[j+1]) müqayisə olunur.',
      'A[j] > A[j+1] olarsa, yerləri dəyişdirilir.',
      'Hər keçiddən sonra sonuncu element öz yerində olur və növbəti keçid bir az qısalır.',
      'Keçiddə heç bir dəyişiklik olmasa, massiv sıralıdır — alqoritm dayanır.',
    ],
    time: 'O(n²) — ən yaxşı (sıralı): O(n)',
    space: 'O(1) · stabil',
    note: 'Tədris üçün ən sadə sıralama alqoritmidir, amma praktikada yavaşdır.',
  },
  selection: {
    about: 'Hər addımda sıralanmamış hissənin ən kiçik elementi tapılır və o hissənin əvvəlinə qoyulur.',
    how: [
      'i-ci mövqe üçün min = i götürülür.',
      'i+1-dən sona qədər daha kiçik element axtarılır.',
      'Tapılan minimum A[i] ilə yerini dəyişir.',
      'Sıralı hissə (yaşıl) hər addımda bir element böyüyür.',
    ],
    time: 'O(n²) — həmişə',
    space: 'O(1) · stabil deyil',
    note: 'Yerdəyişmə sayı ən çox n − 1-dir — yazma əməliyyatı baha olduqda faydalıdır.',
  },
  insertion: {
    about:
      'Kart oyunçusunun əlindəki kartları sıraladığı kimi: hər yeni element sol tərəfdəki artıq sıralı hissədə öz yerinə taxılır.',
    how: [
      'key = A[i] götürülür (yuxarı qaldırılır).',
      'Soldakı key-dən böyük elementlər bir xana sağa sürüşdürülür.',
      'Boşalan yerə key qoyulur.',
      'Proses i = 1-dən n − 1-ə qədər təkrarlanır.',
    ],
    time: 'O(n²) — ən yaxşı (demək olar sıralı): O(n)',
    space: 'O(1) · stabil',
    note: 'Kiçik və ya demək olar ki, sıralı massivlər üçün ən sürətli sadə alqoritmdir.',
  },
};
