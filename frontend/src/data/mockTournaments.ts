export type TournamentStatus = "registration" | "active" | "completed";
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
}

const RAW_DATA: Omit<Tournament, "id">[] = [
  {
    title: "Турнір бравл старс",
    desc: "Бла-бла-бла, леон бравл старс, мільйон гемів і т.д. БАГААААААААТО ТЕКСТУУУУУУУУУУУУУУУ",
    status: "active",
    deadline: "20 Квітня",
    max: 30,
    teams: 15,
    tags: [
      { label: "Битва", type: "accent" },
      { label: "Екшин", type: "pink" },
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
  },
  {
    title: "Забіг синіх їжаків",
    desc: "Одягаємо колючі сині перуки, червоні кросівки і біжимо на впередки, збираючи розкидані металеві кільця. Головне правило - не врізатися в дерева на надзвуковій швидкості, на страховку грошей нема.",
    status: "active",
    deadline: "10 Травня",
    max: 50,
    teams: 45,
    tags: [
      { label: "Біг", type: "accent" },
      { label: "Розваги", type: "light" },
    ],
  },
  {
    title: "Екстремальний продаж",
    desc: "Ви на міському ярмарку. Ваша мета - продати багато плетених вушиків за дві години людям, які прийшли 'просто подивитися'. Дозволено використовувати будь-які методи переконання.",
    status: "completed",
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
    status: "completed",
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

    return {
      ...baseCard,
      id: index + 1,
      title: `${baseCard.title} #${index + 1}`,
    };
  },
);
