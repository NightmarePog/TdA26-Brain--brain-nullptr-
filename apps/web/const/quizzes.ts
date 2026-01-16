import { Quiz } from "@/types/api/quizzes";

export const quizzes: Quiz[] = [
  {
    uuid: "quiz1",
    title: "Obecné znalosti",
    description: "Test vašich znalostí z různých oblastí",
    attemptsCount: 0,
    updateCount: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        uuid: "q1",
        type: "singleChoice",
        question: "Jaké je hlavní město České republiky?",
        options: ["Praha", "Brno", "Ostrava", "Plzeň"],
        correctIndex: 0,
      },
      {
        uuid: "q2",
        type: "multipleChoice",
        question: "Které z těchto zvířat jsou savci?",
        options: ["Pes", "Kočka", "Krokodýl", "Velryba"],
        correctIndices: [0, 1, 3],
      },
      {
        uuid: "q3",
        type: "singleChoice",
        question: "Jaké je chemické značení vody?",
        options: ["H2O", "CO2", "O2", "NaCl"],
        correctIndex: 0,
      },
      {
        uuid: "q4",
        type: "multipleChoice",
        question: "Vyber planety sluneční soustavy:",
        options: ["Mars", "Měsíc", "Venuše", "Slunce"],
        correctIndices: [0, 2],
      },
      {
        uuid: "q5",
        type: "singleChoice",
        question: "Který jazyk je oficiální v Brazílii?",
        options: [
          "Španělština",
          "Portugalština",
          "Francouzština",
          "Angličtina",
        ],
        correctIndex: 1,
      },
    ],
    answers: [
      {
        uuid: "123e4567-e89b-12d3-a456-426614174000",
        quizUuid: "987e6543-e21b-12d3-a456-426614174999",
        userId: 1, // nepovinné, může být vynecháno
        score: 8,
        maxScore: 10,
        submittedAt: new Date().toISOString(), // aktuální čas ve formátu ISO
      },
    ],
  },
  {
    uuid: "quiz2",
    title: "Matematika a věda",
    description: "Test zaměřený na přírodní vědy a matematiku",
    attemptsCount: 0,
    updateCount: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        uuid: "q6",
        type: "multipleChoice",
        question: "Vyber prvky skupiny alkalických kovů:",
        options: ["Lithium", "Vápník", "Sodík", "Hořčík"],
        correctIndices: [0, 2],
      },
      {
        uuid: "q7",
        type: "singleChoice",
        question: "Kolik kontinentů je na Zemi?",
        options: ["5", "6", "7", "8"],
        correctIndex: 2,
      },
      {
        uuid: "q8",
        type: "multipleChoice",
        question: "Vyber hlavní barvy RGB modelu:",
        options: ["Červená", "Zelená", "Modrá", "Žlutá"],
        correctIndices: [0, 1, 2],
      },
      {
        uuid: "q9",
        type: "singleChoice",
        question: "Kdo napsal román '1984'?",
        options: [
          "George Orwell",
          "Aldous Huxley",
          "Jules Verne",
          "Leo Tolstoy",
        ],
        correctIndex: 0,
      },
      {
        uuid: "q10",
        type: "multipleChoice",
        question: "Které jazyky patří do skupiny germánských?",
        options: ["Angličtina", "Němčina", "Španělština", "Nizozemština"],
        correctIndices: [0, 1, 3],
      },
    ],
    answers: [],
  },
];
