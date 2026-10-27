// Hər alqoritmin izahı: nə edir, necə işləyir, mürəkkəblik və qeyd.

export const INFO = {
  btInsert: {
    about:
      'Adi Binary Tree-də dəyərlər arasında sıra qaydası yoxdur. Yeni düyün ağacı mümkün qədər "dolu" saxlamaq üçün ilk boş mövqeyə — yuxarıdan aşağı, soldan sağa — yerləşdirilir.',
    how: [
      'Kök düyün növbəyə (queue) əlavə olunur.',
      'Növbədən düyün çıxarılır və onun sol, sonra sağ övladı yoxlanılır.',
      'İlk rast gəlinən boş (null) övlad yerinə yeni düyün qoyulur.',
      'Boş deyilsə, övlad növbəyə əlavə olunur və proses davam edir.',
    ],
    time: 'O(n)',
    space: 'O(n)',
    note: 'Bu üsul ağacı "complete binary tree" kimi saxlayır — hündürlük həmişə ⌈log₂(n+1)⌉ olur.',
  },

  bstInsert: {
    about:
      'Binary Search Tree-də hər düyün üçün: sol alt ağacdakı bütün dəyərlər kiçik, sağdakılar isə böyükdür. Insert bu qaydanı qoruyaraq yeni dəyərə uyğun yarpaq mövqeyini tapır.',
    how: [
      'Kökdən başlanır: key < cur.key olarsa sola, key > cur.key olarsa sağa gedilir.',
      'Getmək istənilən övlad null olduqda, yeni düyün məhz ora qoşulur.',
      'key = cur.key olarsa dəyər artıq mövcuddur — dublikat əlavə edilmir.',
    ],
    time: 'O(h) — balanslı: O(log n), ən pis: O(n)',
    space: 'O(1) (iterativ)',
    note: 'Elementlər sıralı ardıcıllıqla daxil edilsə, ağac "zəncirə" çevrilir və h = n olur. Bunun üçün "Make Perfect" istifadə edin.',
  },

  build: {
    about:
      'Massivin elementləri soldan sağa bir-bir BST-yə daxil edilir. Yaranan ağacın forması elementlərin ardıcıllığından asılıdır.',
    how: [
      'root ← null ilə başlanır.',
      'Hər i iterasiyasında key ← A[i] götürülür.',
      'key BST Insert qaydası ilə kökdən başlayaraq müqayisə edilib yerləşdirilir.',
      'Dublikat dəyərlər atlanır.',
    ],
    time: 'O(n·h) — orta: O(n log n), ən pis (sıralı massiv): O(n²)',
    space: 'O(n)',
    note: 'Eyni dəyərlər fərqli ardıcıllıqla verilsə, tamamilə fərqli forma alına bilər.',
  },

  balance: {
    about:
      'Əyilmiş (degenerate) BST-ni minimum hündürlüklü balanslı ağaca çevirir. Əgər n = 2ᵏ − 1 olarsa, nəticə Perfect Binary Tree olur — bütün daxili düyünlərin 2 övladı var və bütün yarpaqlar eyni səviyyədədir.',
    how: [
      'Inorder traversal ilə dəyərlər sıralı massivə (A) yığılır.',
      'Köhnə ağac sökülür.',
      'BUILD(lo, hi): ortadakı element A[mid] kök olur.',
      'Sol yarı (lo..mid−1) sol alt ağacı, sağ yarı (mid+1..hi) sağ alt ağacı rekursiv qurur.',
    ],
    time: 'O(n)',
    space: 'O(n)',
    note: 'Nəticədə hündürlük ⌈log₂(n+1)⌉ olur və axtarış O(n)-dən O(log n)-ə düşür.',
  },

  pre: {
    about:
      'Preorder — Depth-First traversal növüdür: əvvəlcə düyünün özü, sonra sol alt ağac, sonra sağ alt ağac ziyarət olunur (Kök → Sol → Sağ).',
    how: [
      'node = null olarsa geri qayıdılır.',
      'Düyün ziyarət edilir və key ilə müqayisə olunur.',
      'Tapılmayıbsa, rekursiv olaraq sol, sonra sağ alt ağaca keçilir.',
    ],
    time: 'O(n)',
    space: 'O(h) — rekursiya steki',
    note: 'Ağacın surətini çıxarmaq və prefiks ifadələr (məs. + a b) üçün istifadə olunur.',
  },

  in: {
    about:
      'Inorder — əvvəlcə sol alt ağac, sonra düyünün özü, sonra sağ alt ağac ziyarət olunur (Sol → Kök → Sağ).',
    how: [
      'node = null olarsa geri qayıdılır.',
      'Əvvəlcə sol alt ağac tam gəzilir.',
      'Sonra düyün ziyarət edilib key ilə müqayisə olunur.',
      'Sonda sağ alt ağaca keçilir.',
    ],
    time: 'O(n)',
    space: 'O(h) — rekursiya steki',
    note: 'BST-də inorder dəyərləri artan sırada verir — bu, BST-nin əsas xüsusiyyətidir.',
  },

  post: {
    about:
      'Postorder — əvvəlcə sol, sonra sağ alt ağac, ən sonda düyünün özü ziyarət olunur (Sol → Sağ → Kök).',
    how: [
      'node = null olarsa geri qayıdılır.',
      'Sol alt ağac, sonra sağ alt ağac tam gəzilir.',
      'Yalnız ondan sonra düyün ziyarət edilib key ilə müqayisə olunur.',
    ],
    time: 'O(n)',
    space: 'O(h) — rekursiya steki',
    note: 'Ağacı silmək (əvvəl övladlar, sonra valideyn) və postfiks ifadələri hesablamaq üçün istifadə olunur.',
  },

  bfs: {
    about:
      'Breadth-First Search (genişliyə görə axtarış) ağacı səviyyə-səviyyə gəzir: əvvəl kök, sonra 1-ci səviyyənin bütün düyünləri, sonra 2-ci səviyyə və s. Buna level-order traversal da deyilir.',
    how: [
      'Kök növbəyə (queue, FIFO) əlavə olunur.',
      'Növbənin əvvəlindən düyün çıxarılır və ziyarət edilir.',
      'key ilə bərabərdirsə, axtarış bitir.',
      'Əks halda onun sol və sağ övladları növbənin sonuna əlavə olunur.',
    ],
    time: 'O(n)',
    space: 'O(w) — w: ağacın ən geniş səviyyəsi',
    note: 'Köka ən yaxın uyğun düyünü ilk tapır. Qısa yol axtarışında (unweighted graph) əsas alqoritmdir.',
  },

  dfs: {
    about:
      'Depth-First Search (dərinliyə görə axtarış) bir budaq üzrə mümkün qədər dərinə gedir, sonra geri qayıdıb digər budağa keçir. Burada rekursiya əvəzinə açıq stek (LIFO) istifadə olunur.',
    how: [
      'Kök stekə (stack, LIFO) əlavə olunur.',
      'Stekin üstündən düyün götürülür və ziyarət edilir.',
      'key ilə bərabərdirsə, axtarış bitir.',
      'Əks halda əvvəl sağ, sonra sol övlad stekə qoyulur — beləliklə sol övlad əvvəl çıxır.',
    ],
    time: 'O(n)',
    space: 'O(h) — stekdəki düyün sayı',
    note: 'Ziyarət ardıcıllığı Preorder ilə eynidir. Fərq: Preorder rekursiyanın gizli stekini, DFS isə açıq stek istifadə edir.',
  },

  bstSearch: {
    about:
      'BST-də axtarış hər müqayisədə ağacın yarısını kənara atır: key kiçikdirsə yalnız sola, böyükdürsə yalnız sağa baxılır.',
    how: [
      'cur ← root.',
      'key = cur.key olarsa, tapıldı.',
      'key < cur.key olarsa sola, əks halda sağa keçilir.',
      'cur = null olarsa, dəyər ağacda yoxdur.',
    ],
    time: 'O(h) — balanslı: O(log n), ən pis: O(n)',
    space: 'O(1)',
    note: 'Traversal üsulları bütün düyünləri yoxlaya bilər (O(n)), BST Search isə yalnız bir yol üzrə enir.',
  },

  btDelete: {
    about:
      'Adi Binary Tree-də silmə zamanı ağacın "dolu" quruluşunu pozmamaq üçün silinən düyünün yerinə ən dərin, ən sağdakı düyünün dəyəri yazılır.',
    how: [
      'BFS ilə bütün ağac gəzilir və silinəcək düyün (target) tapılır.',
      'Gəzintinin son düyünü — ən dərin, ən sağdakı düyündür.',
      'Onun dəyəri target-ə köçürülür.',
      'Ən dərin düyün öz valideynindən ayrılıb silinir.',
    ],
    time: 'O(n)',
    space: 'O(n)',
    note: 'Bu üsulda ağacın forması minimum dəyişir — yalnız bir yarpaq yox olur.',
  },

  bstDelete: {
    about:
      'BST-dən silmə zamanı BST qaydası qorunmalıdır. Silinən düyünün övlad sayına görə 3 hal var.',
    how: [
      '0 övlad (yarpaq): düyün sadəcə silinir.',
      '1 övlad: övlad düyünün yerinə qalxır.',
      '2 övlad: inorder varis (sağ alt ağacın ən kiçik dəyəri) tapılır, dəyəri düyünə köçürülür və varis silinir.',
    ],
    time: 'O(h)',
    space: 'O(1)',
    note: 'Varisin sol övladı olmur, ona görə onu silmək həmişə 0 və ya 1 övladlı sadə hala gəlir.',
  },
};
