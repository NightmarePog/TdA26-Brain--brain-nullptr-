"use client";
import AppCard, { AppCardType } from "@/components/ui/appCard";
import PageTitle from "@/components/ui/typography/pageTitle";

const MaterialsPage = () => {
  return (
    <div>
      <PageTitle>Materiály</PageTitle>
      <div className="flex flex-wrap justify-center m-10">
        <AppCard
          appCards={new Array(10).fill(":3").map((item, index) => {
            const remap: AppCardType = {
              title: item,
              key: index,
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
