import { Material } from "@/types/api/materials";
import AppCard, { AppCardType } from "./appCard";
import { useMemo } from "react";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface MaterialCardProps {
  materials: Material[];
  onDelete: () => void;
}

const DashboardMaterialCard = ({ materials, onDelete }: MaterialCardProps) => {
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Smazat</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Jste si jistý, že chcete pokračovat?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Změny jsou permanentní a jakýkoliv smazaný obsah již nelze
                  vrátit.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Zrušit</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>
                  Pokračovat
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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

export default DashboardMaterialCard;
