/* Налаштування майстерні. Для нового клієнта міняємо цей файл і data.js */
window.CONFIG = {
  name: "Bloom Lab",
  phone: "+380 44 000 47 47",
  instagram: "https://instagram.com/",
  telegram: "https://t.me/",
  viber: "viber://chat?number=%2B380440004747",
  address: "бульвар Лесі Українки, 20, Київ",
  mapQuery: "бульвар Лесі Українки 20, Київ",
  hours: "щодня 8:00–22:00",

  // Замовлення → Telegram (як у салоні).
  // orderEndpoint — свій проксі (Cloudflare Worker), щоб токен не лежав у коді.
  // Або для тесту: telegramBotToken + telegramChatId.
  // Якщо порожньо — демо-режим: показує успіх, нічого не надсилає.
  orderEndpoint: "",
  telegramBotToken: "",
  telegramChatId: "",

  freeDeliveryFrom: 3000,
  deliveryFrom: 8, deliveryTo: 22, slotHours: 2, daysAhead: 14
};
