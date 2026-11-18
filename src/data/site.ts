// Факти клієнта для головної: тільки з veon/client.json (company.contacts, socials, facts W-F…).
export interface Phone { display: string; href: string; note: string; }

export const brand = "Zapchasti.kiev.ua";
export const legal = "ФОП Лагута С. В.";

export const phones: Phone[] = [
  { display: "(044) 408-57-51", href: "tel:+380444085751", note: "міський" },
  { display: "(095) 882-00-19", href: "tel:+380958820019", note: "Vodafone" },
  { display: "(098) 404-47-80", href: "tel:+380984044780", note: "Київстар" },
  { display: "(063) 678-95-40", href: "tel:+380636789540", note: "lifecell" },
];
export const mainPhone = phones[0];

export const viber = { display: "(099) 200-85-99", href: "viber://chat?number=%2B380992008599" };
export const telegram = { display: "@Zapchasti_Kiev_Ua", href: "https://t.me/Zapchasti_Kiev_Ua" };
export const email = "email@zapchasti.kiev.ua";
export const facebook = "https://www.facebook.com/zapchasti.kiev.ua";
export const promReviews = "https://prom.ua/opinions/list/65999";
export const promShop = "https://prom.ua/c65999-zapchastinacom.html";

export const address = {
  street: "пров. Радищева, 3",
  office: "офіс 229, 2-й поверх",
  city: "03124 Київ",
  map: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Київ, провулок Радищева, 3"),
};

export const hours = [
  { days: "Пн–Пт", time: "9:00–18:30" },
  { days: "Сб", time: "10:00–13:00" },
];
export const hoursLine = "Пн–Пт 9:00–18:30, Сб 10:00–13:00";

const requestBody = [
  "Марка і модель:",
  "Рік випуску:",
  "VIN (якщо є):",
  "Код або назва деталі:",
  "Самовивіз у Києві чи доставка (місто, відділення Нової пошти):",
  "Телефон для зв'язку:",
].join("\n");
export const mailRequest =
  `mailto:${email}?subject=${encodeURIComponent("Запит на запчастину")}&body=${encodeURIComponent(requestBody)}`;

export const nav = [
  { id: "order", label: "Як замовити" },
  { id: "range", label: "Асортимент" },
  { id: "sto", label: "Для СТО" },
  { id: "terms", label: "Умови" },
  { id: "about", label: "Про нас" },
  { id: "contacts", label: "Контакти" },
];

export const soon = "Розділ у розробці";
