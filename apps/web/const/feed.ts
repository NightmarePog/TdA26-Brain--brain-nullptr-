import { FeedItem } from "@/types/api/feed";

export const feedItems: FeedItem[] = [
  {
    uuid: "feed-001",
    type: "system",
    message: "Kvíz „Základy TypeScriptu“ byl úspěšně vytvořen.",
    edited: false,
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-01-10T08:00:00Z",
  },
  {
    uuid: "feed-002",
    type: "manual",
    message: "Přidal jsem novou otázku do kvízu React – základy.",
    edited: true,
    createdAt: "2025-01-10T09:15:00Z",
    updatedAt: "2025-01-10T09:20:00Z",
  },
  {
    uuid: "feed-003",
    type: "system",
    message: "Uživatel odeslal kvíz „JavaScript – základy“ (skóre 8/10).",
    edited: false,
    createdAt: "2025-01-10T10:30:00Z",
    updatedAt: "2025-01-10T10:30:00Z",
  },
  {
    uuid: "feed-004",
    type: "manual",
    message: "Opravil jsem překlep v otázce číslo 3.",
    edited: true,
    createdAt: "2025-01-10T11:45:00Z",
    updatedAt: "2025-01-10T11:50:00Z",
  },
  {
    uuid: "feed-005",
    type: "system",
    message: "Kvíz „Bezpečnost webu“ byl aktualizován.",
    edited: false,
    createdAt: "2025-01-10T13:00:00Z",
    updatedAt: "2025-01-10T13:00:00Z",
  },
];
