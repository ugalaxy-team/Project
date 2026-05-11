import type { CustomField } from "../pages/RegistrationPage/types";

export type TournamentStatus =
  | "draft"
  | "registration"
  | "running"
  | "finished";
export type TagType = "accent" | "light" | "pink" | "primary";

export interface Tag {
  label: string;
  type: TagType;
}

export interface Tournament {
  id: number;
  title: string;
  status: TournamentStatus;
  tags: Tag[];
  desc: string;
  deadline: string;
  max: number;
  teams: number;
  minMembers?: number;
  maxMembers?: number;
  customFields?: CustomField[];
}

const RAW_DATA: Omit<Tournament, "id">[] = [
  {
    title: "Турнір бравл старс",
    desc: "Бла-бла-бла, леон бравл старс, мільйон гемів і т.д. БАГААААААААТО ТЕКСТУУУУУУУУУУУУУУУ",
    status: "running",
    deadline: "20 Квітня",
    max: 30,
    teams: 15,
    tags: [
      { label: "Битва", type: "accent" },
      { label: "Екшин", type: "pink" },
    ],
    minMembers: 1,
    maxMembers: 3,
    customFields: [
      {
        id: "telegram",
        label: "Контактний Telegram",
        placeholder: "@username",
        required: true,
      },
      {
        id: "brawl_tag",
        label: "Тег гравця Brawl Stars",
        placeholder: "#XXXXXXXX",
        required: true,
      },
    ],
  },
  {
    title: "24 години челендж",
    desc: "Любите поїсти? Ми пропонуємо турнір, протягом 24 годин ви повинні з'їсти 100 пачок картоплі фрі.",
    status: "registration",
    deadline: "25 Квітня",
    max: 10,
    teams: 2,
    tags: [
      { label: "Їжа", type: "primary" },
      { label: "Макдональдс", type: "light" },
    ],
    minMembers: 1,
    maxMembers: 1,
    customFields: [
      {
        id: "allergies",
        label: "Харчові алергії",
        placeholder: "Немає",
        required: false,
      },
    ],
  },
  {
    title: "Бокс у костюмах динозаврів",
    desc: "Звичайні бойові мистецтва це надто серйозно. А от вийти на ринг, будучи двометровим надувним тиранозавром весело, вхвххв",
    status: "registration",
    deadline: "1 Травня",
    max: 8,
    teams: 5,
    tags: [
      { label: "Спорт", type: "primary" },
      { label: "T-Rex", type: "accent" },
    ],
    minMembers: 1,
    maxMembers: 2,
    customFields: [
      {
        id: "telegram",
        label: "Telegram капітана",
        placeholder: "@rex",
        required: true,
      },
      {
        id: "suit_size",
        label: "Розмір костюма",
        placeholder: "S, M, L, XL",
        required: true,
      },
    ],
  },
  {
    title: "Забіг синіх їжаків",
    desc: "Одягаємо колючі сині перуки, червоні кросівки і біжимо на впередки, збираючи розкидані металеві кільця. Головне правило - не врізатися в дерева на надзвуковій швидкості, на страховку грошей нема.",
    status: "running",
    deadline: "10 Травня",
    max: 50,
    teams: 45,
    tags: [
      { label: "Біг", type: "accent" },
      { label: "Розваги", type: "light" },
    ],
    minMembers: 1,
    maxMembers: 4,
  },
  {
    title: "Екстремальний продаж",
    desc: "Ви на міському ярмарку. Ваша мета - продати багато плетених вушиків за дві години людям, які прийшли 'просто подивитися'. Дозволено використовувати будь-які методи переконання.",
    status: "finished",
    deadline: "15 Травня",
    max: 20,
    teams: 20,
    tags: [
      { label: "Бізнес", type: "primary" },
      { label: "Нерви", type: "pink" },
    ],
  },
  {
    title: "Лабораторія геніальних сестер",
    desc: "Вас замикають у кімнаті з купою незрозумілих хімікатів, дивними винаходами та собакою, що розмовляє. Завдання: зробити зілля перетворення на халка і втекти",
    status: "registration",
    deadline: "22 Травня",
    max: 5,
    teams: 3,
    tags: [
      { label: "Хімія", type: "pink" },
      { label: "Веселощі", type: "accent" },
    ],
  },
  {
    title: "Ідей більше нема",
    desc: "Ех, мені лінь далі думати, просто текст на відчепись, аби було гарно і красиво, усьо",
    status: "finished",
    deadline: "30 Травня",
    max: 1,
    teams: 1,
    tags: [
      { label: "Ідеї", type: "light" },
      { label: "Думи", type: "light" },
    ],
  },
];

export const TOURNAMENTS_DATA: Tournament[] = Array.from(
  { length: 35 },
  (_, index) => {
    const baseCard = RAW_DATA[index % RAW_DATA.length];

    const defaultMin = baseCard.minMembers || 1;
    const defaultMax = baseCard.maxMembers || 5;
    const defaultCustomFields: CustomField[] = baseCard.customFields || [
      {
        id: "organization",
        label: "Навчальний заклад / Організація",
        placeholder: "ЧПФК, КНУ...",
        required: false,
      },
      {
        id: "telegram",
        label: "Контактний Telegram",
        placeholder: "@username",
        required: true,
      },
    ];

    return {
      ...baseCard,
      id: index + 1,
      title: `${baseCard.title} #${index + 1}`,
      minMembers: defaultMin,
      maxMembers: defaultMax,
      customFields: defaultCustomFields,
    };
  },
);
