import { Material } from "@/types/api/materials";

const materials: Material[] = [
  {
    uuid: "1a2b3c",
    name: "Úvodní prezentace",
    description: "Prezentace k prvnímu kurzu",
    fileUrl: "/materials/intro-presentation.pdf",
    mimeType: "application/pdf",
    sizeBytes: 204800,
    created_at: "2026-01-01T10:00:00Z",
    updated_at: "2026-01-01T12:00:00Z",
    updateCount: 1,
  },
  {
    uuid: "2b3c4d",
    name: "Oficiální dokumentace Reactu",
    description: "Link na oficiální web Reactu",
    url: "https://reactjs.org/docs/getting-started.html",
    faviconUrl: "https://reactjs.org/favicon.ico",
    created_at: "2026-01-02T09:30:00Z",
    updated_at: "2026-01-02T09:30:00Z",
    updateCount: 0,
  },
  {
    uuid: "3c4d5e",
    name: "Cvičební soubor",
    description: "Ukázkový CSV soubor pro cvičení",
    fileUrl: "/materials/exercise.csv",
    mimeType: "text/csv",
    sizeBytes: 10240,
    created_at: "2026-01-03T14:15:00Z",
    updated_at: "2026-01-03T15:00:00Z",
    updateCount: 2,
  },
  {
    uuid: "4d5e6f",
    name: "Video tutorial",
    description: "Krátké video vysvětlující koncepty",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    faviconUrl: "https://www.youtube.com/s/desktop/6c9b3a57/img/favicon.ico",
    created_at: "2026-01-04T08:00:00Z",
    updated_at: "2026-01-04T08:30:00Z",
    updateCount: 1,
  },
  {
    uuid: "5e6f7g",
    name: "Šablona projektu",
    fileUrl: "/materials/project-template.zip",
    mimeType: "application/zip",
    sizeBytes: 512000,
    created_at: "2026-01-05T11:45:00Z",
    updated_at: "2026-01-05T12:00:00Z",
    updateCount: 0,
  },
];

export default materials;
