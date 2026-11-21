/* Букети, конструктор, доставка, відгуки */
window.DATA = {
  occasions: [
    { id: "love", name: "Коханій" },
    { id: "bday", name: "День народження" },
    { id: "mom", name: "Мамі" },
    { id: "justso", name: "Просто так" },
    { id: "sorry", name: "Вибачення" }
  ],
  colors: [
    { id: "pink", name: "Рожевий", hex: "#FF6FA8" },
    { id: "orange", name: "Помаранчевий", hex: "#FF8A2B" },
    { id: "red", name: "Червоний", hex: "#D7263D" },
    { id: "white", name: "Білий", hex: "#F4EEE6" },
    { id: "mix", name: "Мікс", hex: "conic-gradient(#FF2E88,#FF8A2B,#FFD23F,#2BB673,#8C6CFF,#FF2E88)" }
  ],
  bouquets: [
    { id: 1, name: "Малиновий джем", desc: "Піоновидні троянди, кущова троянда, гортензія", price: 1850, img: "img/b1.jpg", color: "pink", occ: ["love", "bday"], tag: "Хіт" },
    { id: 2, name: "Персиковий бархат", desc: "Жоржини, хризантеми, целозія", price: 1490, img: "img/b2.jpg", color: "orange", occ: ["bday", "justso"], tag: "Новинка" },
    { id: 3, name: "Тюльпанова хмара", desc: "35 тюльпанів мікс у плівці", price: 1650, img: "img/b3.jpg", color: "mix", occ: ["mom", "justso", "bday"] },
    { id: 4, name: "Червоне вино", desc: "15 піоновидних червоних тюльпанів", price: 1190, img: "img/b4.jpg", color: "red", occ: ["love", "sorry"], tag: "Хіт" },
    { id: 5, name: "Ніжний ранок", desc: "Троянди, еустома, хризантема, зелень", price: 1390, img: "img/b5.jpg", color: "pink", occ: ["mom", "bday"] },
    { id: 6, name: "Осінній джаз", desc: "Троянди Кахала, хризантема, жоржина", price: 1790, img: "img/b6.jpg", color: "orange", occ: ["bday", "love"], tag: "Новинка" },
    { id: 7, name: "Польовий вайб", desc: "Ромашки, матрикарія, солідаго", price: 890, img: "img/b7.jpg", color: "white", occ: ["justso", "mom"] },
    { id: 8, name: "Сонячний зайчик", desc: "Соняшник, троянди, гвоздики", price: 1290, img: "img/b8.jpg", color: "red", occ: ["bday", "justso"] },
    { id: 9, name: "Велике «так»", desc: "51 тюльпан мікс, кожен у плівці", price: 2950, img: "img/b9.jpg", color: "mix", occ: ["love"], tag: "Преміум" },
    { id: 10, name: "Півонії", desc: "Півонії Сара Бернар, біла півонія", price: 2490, img: "img/b10.jpg", color: "pink", occ: ["love", "mom", "sorry"] },
    { id: 11, name: "Персик", desc: "5 ранункулюсів, евкаліпт", price: 650, img: "img/b11.jpg", color: "orange", occ: ["justso", "sorry"] },
    { id: 12, name: "Хмаринка", desc: "Гіпсофіла в крафті", price: 790, img: "img/b12.jpg", color: "white", occ: ["mom", "justso"] }
  ],


  // Квіти поштучно (фото, ціна за стебло, доступні кольори)
  palette: {
    red: { name: "Червоний", hex: "#D7263D" }, pink: { name: "Рожевий", hex: "#FF8DBB" }, fuchsia: { name: "Фуксія", hex: "#E8177D" },
    white: { name: "Білий", hex: "#FFF6EA" }, peach: { name: "Персиковий", hex: "#FFB07A" }, orange: { name: "Помаранчевий", hex: "#FF8A2B" },
    yellow: { name: "Жовтий", hex: "#FFD23F" }, lilac: { name: "Бузковий", hex: "#B69CFF" }, blue: { name: "Блакитний", hex: "#8FB8FF" }
  },
  flowers: [
    { id: "rose", name: "Троянда", note: "Еквадор, 60 см", price: 75, min: 9, shape: "rose", img: "img/f-rose.jpg", colors: ["red", "pink", "white", "peach", "yellow"] },
    { id: "tulip", name: "Тюльпан", note: "Голландія", price: 55, min: 9, shape: "tulip", img: "img/f-tulip.jpg", colors: ["fuchsia", "pink", "red", "yellow", "white"] },
    { id: "peony", name: "Півонія", note: "Сара Бернар", price: 190, min: 3, shape: "peony", img: "img/f-peony.jpg", colors: ["pink", "fuchsia", "white"] },
    { id: "ranunc", name: "Ранункулюс", note: "Італія", price: 95, shape: "rose", img: "img/f-ranunc.jpg", colors: ["peach", "orange", "pink", "white"] },
    { id: "hydr", name: "Гортензія", note: "Велика шапка", price: 320, min: 1, shape: "hydr", img: "img/f-hydr.jpg", colors: ["white", "pink", "blue", "lilac"] },
    { id: "carn", name: "Гвоздика", note: "Колумбія", price: 60, shape: "carn", img: "img/f-carn.jpg", colors: ["pink", "red", "white"] },
    { id: "daisy", name: "Ромашка", note: "Гілка, 5–7 квіток", price: 45, min: 7, shape: "daisy", img: "img/f-daisy.jpg", colors: ["white"] },
    { id: "sun", name: "Соняшник", note: "Великий", price: 90, min: 3, shape: "sun", img: "img/f-sun.jpg", colors: ["yellow"] }
  ],
  wraps: [
    { id: "kraft", name: "Крафт", price: 0, color: "#C99A6B" },
    { id: "film", name: "Корейська плівка", price: 90, color: "#FFC2DA" },
    { id: "box", name: "Капелюшна коробка", price: 390, color: "#1C1326" },
    { id: "basket", name: "Кошик", price: 490, color: "#A86F3D" }
  ],
  greenPrice: 120,
  floristWork: 150,

  zones: [
    { id: "pechersk", name: "Печерськ", price: 150, time: "до 2 годин" },
    { id: "center", name: "Шевченківський, Голосіївський, Подільський", price: 200, time: "2–3 години" },
    { id: "right", name: "Інші райони правого берега", price: 250, time: "3–4 години" },
    { id: "left", name: "Лівий берег", price: 300, time: "3–4 години" },
    { id: "pickup", name: "Самовивіз з майстерні", price: 0, time: "через 1 годину" }
  ],

  reviews: [
    { name: "Олена", text: "Замовила мамі на ювілей о 10 ранку, о 12 вже була фото-реакція. Букет навіть більший, ніж на сайті, і простояв майже два тижні.", date: "листопад 2026" },
    { name: "Андрій", text: "Зібрав у конструкторі букет з ранункулюсів, бо не знав, що вибрати. Флористка скинула фото перед відправкою, все чітко.", date: "жовтень 2026" },
    { name: "Марина", text: "Найяскравіші букети на Печерську, без цих сумних сірих упаковок. Беру тут на всі свята для колег.", date: "жовтень 2026" },
    { name: "Дмитро", text: "Термінова доставка за годину на Арсенальну. Кур'єр подзвонив заздалегідь, листівку написали від руки. Дякую!", date: "вересень 2026" },
    { name: "Ірина", text: "Коробка-сюрприз просто вау. Подруга думала, що це з дорогого бутика, а ціна нормальна.", date: "вересень 2026" },
    { name: "Сергій", text: "Замовляю дружині щомісяця. Ні разу не було зів'ялих квітів, і завжди тримають слово з часом.", date: "серпень 2026" }
  ]
};
