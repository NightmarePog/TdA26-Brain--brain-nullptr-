import { Material } from "@/types/api/materials";

export const getMaterialDescription = (item: Material) => {
  const created = new Date(item.created_at);
  const updated = new Date(item.updated_at);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

  return `${item.description ?? "Bez popisu"}
  Vytvořeno: ${formatDate(created)}
Aktualizováno: ${formatDate(updated)}`;
};
