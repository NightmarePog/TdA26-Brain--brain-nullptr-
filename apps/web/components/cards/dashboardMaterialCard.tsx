import { Material } from "@/types/api/materials";
import AppCard, { AppCardType } from "./appCard";
import { useMemo } from "react";
import { Button } from "../ui/button";

interface MaterialCardProps {
  materials: Material[];
}

const DashboardMaterialCard = ({ materials }: MaterialCardProps) => {
  const formattedData = useMemo(() => {
    return materials.map((material) => {
      let card: AppCardType;

      if (material.type === "url") {
        card = {
          title: material.name,
          key: material.uuid,
          previewImg: `https://www.google.com/s2/favicons?sz=128&domain=${material.url}`,
          buttonLabel: "otevřít", // hlavní akce k materiálu
        };
      } else if (material.type === "file") {
        card = {
          title: material.name,
          key: material.uuid,
          previewImg: "/tda.png",
          buttonLabel: "stáhnout", // hlavní akce k materiálu
        };
      } else {
        throw new Error(`invalid material type: ${material}`);
      }

      return { material, card };
    });
  }, [materials]);

  const handleEdit = (material: Material) => {
    console.log("Změnit materiál:", material);
    // tady může být modal, redirect, cokoliv dalšího
  };

  return (
    <>
      {formattedData.map(({ material, card }) => (
        <AppCard appCard={card} key={card.title}>
          {/* Změnit je teď jen přes button */}
          <Button onClick={() => handleEdit(material)}>Změnit</Button>
        </AppCard>
      ))}
    </>
  );
};

export default DashboardMaterialCard;
