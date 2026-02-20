import AppCard, { AppCardType } from "@/components/cards/appCard";

interface ModuleCard {
  name: string;
  description: string;
}

interface ModuleCardLayoutProps {
  cards: ModuleCard[];
}

const ModuleCardLayout = ({ cards }: ModuleCardLayoutProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const appCard: AppCardType = {
          title: card.name,
          description: card.description,
          key: index,
          previewImg: "https://avatar.vercel.sh/shadcn1",
        };

        return <AppCard key={index} appCard={appCard} />;
      })}
    </div>
  );
};

export default ModuleCardLayout;
