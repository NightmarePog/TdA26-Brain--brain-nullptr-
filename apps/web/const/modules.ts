import { ModulesRecieve } from "@/types/api/modules";

export const modules: ModulesRecieve = {
  courseName: "Začátky něčeho idk",
  description:
    "tohle je hrozně epický kurz takže ho mega užívej protože víc epickej kurz už nezažiješ :3",
  count: 4,
  modules: [
    {
      uuid: "a1f3c9e2-7b4d-4c2a-9f01-1234567890ab",
      name: "Úvod do TypeScriptu",
      description: "Základy typového systému, rozhraní a generika.",
      idx: 1,
      state: "open",
      createdAt: "2026-02-01T08:00:00.000Z",
      updatedAt: "2026-02-10T10:15:00.000Z",
      updateCount: 2,
    },
    {
      uuid: "b2e4d8f1-6c3a-4d5b-8e02-2345678901bc",
      name: "Pokročilé typy",
      description: "Union, intersection, utility typy a infer.",
      idx: 2,
      state: "open",
      createdAt: "2026-02-02T09:30:00.000Z",
      updatedAt: "2026-02-12T14:45:00.000Z",
      updateCount: 3,
    },
    {
      uuid: "c3d5e7a9-5b2c-4e6d-9f03-3456789012cd",
      name: "Práce s API",
      description: "Fetch, axios, validace dat a error handling.",
      idx: 3,
      state: "closed",
      createdAt: "2026-02-03T11:00:00.000Z",
      updatedAt: "2026-02-15T16:20:00.000Z",
      updateCount: 5,
    },
    {
      uuid: "d4e6f8b0-4a1d-4f7e-0a04-4567890123de",
      name: "Testování aplikace",
      description: "Unit testy, integrace a mocking.",
      idx: 4,
      state: "open",
      createdAt: "2026-02-04T13:15:00.000Z",
      updatedAt: "2026-02-18T09:05:00.000Z",
      updateCount: 1,
    },
  ],
};
