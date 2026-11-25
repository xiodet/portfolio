/* DIVISION barbershop & coffee — дані з онлайн-запису Altegio (листопад 2026).
   price: [Барбер, ТОП барбер, Бренд барбер]; null = послуги немає на цьому рівні.
   dur: [хв для кожного рівня] або одне число. */
window.DATA = {
  bookingUrl: "https://n1382674.alteg.io/company/1317753/personal/menu?o=",

  levels: [
    { name: "Барбер", note: "Впевнені базові стрижки і борода за найкращою ціною." },
    { name: "ТОП барбер", note: "Досвідчені майстри: складні форми, королівське гоління, біозавивка." },
    { name: "Бренд барбер", note: "Обличчя DIVISION. Найвищий рівень і найбільше відгуків." }
  ],

  categories: [
    { id: "hair", name: "Стрижки" },
    { id: "beard", name: "Борода і гоління" },
    { id: "combo", name: "Комплекси" },
    { id: "extra", name: "Додатково" }
  ],

  services: [
    { cat: "hair", name: "Чоловіча стрижка", dur: 60, price: [750, 850, 950], hit: true },
    { cat: "hair", name: "Стрижка машинкою", dur: [45, 60, 45], price: [650, 750, 850] },
    { cat: "hair", name: "Подовжена стрижка", dur: 75, price: [850, 950, 1050] },
    { cat: "hair", name: "Дитяча стрижка", dur: [60, 45, 45], price: [650, 750, 850] },

    { cat: "beard", name: "Стрижка бороди", dur: 45, price: [550, 650, 750] },
    { cat: "beard", name: "Королівське гоління", dur: 30, price: [null, 750, 850] },
    { cat: "beard", name: "Гоління електробритвою", dur: [30, 20, 20], price: [450, 500, 550] },
    { cat: "beard", name: "Стрижка вусів", dur: [15, 10, 10], price: [250, 300, 350] },

    { cat: "combo", name: "Чоловіча стрижка + борода", dur: 90, price: [1200, 1400, 1600], hit: true },
    { cat: "combo", name: "Стрижка машинкою + борода", dur: 75, price: [1100, 1300, 1500] },

    { cat: "extra", name: "Камуфлювання волосся", note: "голова або борода", dur: [40, 30, 30], price: [650, 750, 850] },
    { cat: "extra", name: "Біозавивка", dur: 120, price: [null, 4000, 4500] },
    { cat: "extra", name: "Укладка", dur: [20, 15, 15], price: [300, 350, 400] },
    { cat: "extra", name: "Воскова депіляція", dur: null, price: [100, 100, 100] }
  ],

  barbers: [
    { name: "Євгеній", level: 2, photo: "img/yevhen.jpg", reviews: 52 },
    { name: "Тетяна", level: 1, photo: "img/tetiana.jpg", reviews: 32 },
    { name: "Валерія", level: 0, photo: "img/valeriia.jpg", reviews: 4, english: true, small: true }
  ]
};
