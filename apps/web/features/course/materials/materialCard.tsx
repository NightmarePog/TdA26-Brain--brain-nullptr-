import { Material } from "@/types/api/materials";
import AppCard, { AppCardType } from "../../../components/cards/appCard";
import { useMemo } from "react";
import { Button } from "../../../components/ui/button";

interface MaterialCardProps {
  materials: Material[];
}

const MaterialCard = ({ materials }: MaterialCardProps) => {
  const formattedData = useMemo(() => {
    return materials.map((material) => {
      let card: AppCardType;

      if (material.type === "url") {
        card = {
          title: material.name,
          key: material.uuid,
          previewImg: `https://www.google.com/s2/favicons?sz=128&domain=${material.url}`,
          buttonLabel: "otevřít", // hlavní akce
        };
      } else if (material.type === "file") {
        card = {
          title: material.name,
          key: material.uuid,
          previewImg: "/tda.png",
          buttonLabel: "stáhnout", // hlavní akce
        };
      } else {
        throw new Error(`invalid material type: ${material}`);
      }

      return { material, card };
    });
  }, [materials]);

  const handleOpenUrl = (url: string) => {
    window.open(url, "_blank");
  };

  const handleDownloadFile = (fileUrl: string) => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = "";
    a.rel = "noopener";
    a.click();
  };

  return (
    <>
      {formattedData.map(({ material, card }) => (
        <AppCard appCard={card} key={card.title}>
          {material.type === "url" && (
            <Button onClick={() => handleOpenUrl(material.url)}>Otevřít</Button>
          )}
          {material.type === "file" && (
            <Button onClick={() => handleDownloadFile(material.fileUrl)}>
              Stáhnout
            </Button>
          )}
        </AppCard>
      ))}
    </>
  );
};

export default MaterialCard;
