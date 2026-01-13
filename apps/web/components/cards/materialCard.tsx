import { Material } from "@/types/api/materials";
import AppCard, { AppCardType } from "./appCard";
import { useEffect, useMemo } from "react";
import { string } from "zod/v3";
import { Button } from "../ui/button";

interface MaterialCardProps {
  materials: Material[];
}

const MaterialCard = ({ materials }: MaterialCardProps) => {
  const formattedData = useMemo(() => {
    return materials.map((material) => {
      if (material.type === "url") {
        const formatted: AppCardType = {
          title: material.name,
          key: material.uuid,
          previewImg: `https://www.google.com/s2/favicons?sz=128&domain=${material.url}`,
          onClick: () => window.open(material.url, "_blank"),
          buttonLabel: "otevřít",
        };
        return formatted;
      }

      if (material.type === "file") {
        console.log("does this work");
        const formatted: AppCardType = {
          title: material.name,
          key: material.uuid,
          previewImg: "/tda.png",
          buttonLabel: "stáhnout",
          onClick: () => {
            const a = document.createElement("a");
            a.href = material.fileUrl;
            a.download = "";
            a.rel = "noopener";
            a.click();
          },
        };
        return formatted;
      }

      throw new Error(`invalid material type: ${material}`);
    });
  }, [materials]);
  return <AppCard appCards={formattedData} />;
};

export default MaterialCard;
