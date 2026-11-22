/* Налаштування барбершопу. Для нового клієнта міняємо цей файл і data.js */
window.CONFIG = {
  name: "Ferrum Barbershop",

  // Контакти (для концепту — умовні)
  phone: "+380 44 000 19 19",
  instagram: "https://instagram.com/",
  telegram: "https://t.me/",
  viber: "viber://chat?number=%2B380440001919",
  address: "Оболонський проспект, 26, Київ",
  addressNote: "5 хвилин пішки від метро «Оболонь», вхід з боку двору",
  mapQuery: "Оболонський проспект 26, Київ",
  hoursText: "щодня 10:00–21:00",

  // Запис → Telegram.
  // Варіант 1 (для реального клієнта): свій проксі (Cloudflare Worker), щоб токен бота
  //   не лежав у коді сторінки. Вкажіть його адресу в bookingEndpoint.
  // Варіант 2 (швидко, для тесту): токен бота і chat_id.
  // Якщо нічого не вказано — демо-режим (показує успіх, нічого не надсилає).
  bookingEndpoint: "",
  telegramBotToken: "",
  telegramChatId: "",

  // Графік для вибору часу
  open: 10, close: 21,   // години
  stepMin: 30,           // крок сітки часу
  daysAhead: 14
};
