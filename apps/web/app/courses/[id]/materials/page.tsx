"use client";
import AppCard, { AppCardType } from "@/components/ui/appCard";
import PageTitle from "@/components/ui/typography/pageTitle";
import materials from "@/const/material";
import { Material } from "@/types/api/materials";

const MaterialsPage = () => {
  const getDescription = (item: Material) => {
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

  return (
    <div>
      <PageTitle>Materiály</PageTitle>
      <div className="flex flex-wrap justify-center m-10">
        <AppCard
          appCards={materials.map((materialItem) => {
            const remap: AppCardType = {
              title: materialItem.name,
              description: getDescription(materialItem),
              key: materialItem.uuid,
              previewImg: "/tda.png",
              onClick: () => null,
            };
            return remap;
          })}
        />
      </div>
    </div>
  );
};

export default MaterialsPage;
