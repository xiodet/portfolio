/* Налаштування салону. Для нового клієнта міняємо тільки цей файл і data.js */
window.CONFIG = {
  name: "Mila Beauty Studio",

  // Контакти (для концепту — умовні)
  phone: "+380 44 000 12 34",
  instagram: "https://instagram.com/",
  telegram: "https://t.me/",
  viber: "viber://chat?number=%2B380440001234",

  // Карта (Google Maps, без ключа)
  mapQuery: "вулиця Анни Ахматової 30, Київ",

  // Запис → Telegram.
  // Варіант 1 (рекомендовано для реального клієнта): свій проксі (Cloudflare Worker),
  //   щоб токен бота не лежав у коді сторінки. Вкажіть його адресу в bookingEndpoint.
  // Варіант 2 (швидко, для тесту): прямо токен бота і chat_id.
  // Якщо нічого не вказано — форма працює в демо-режимі (показує успіх, нічого не надсилає).
  bookingEndpoint: "",
  telegramBotToken: "",
  telegramChatId: "",

  // Графік для вибору часу
  hours: { weekday: [9, 20], sunday: [10, 18] },
  slotStepMin: 60,
  daysAhead: 14
};
