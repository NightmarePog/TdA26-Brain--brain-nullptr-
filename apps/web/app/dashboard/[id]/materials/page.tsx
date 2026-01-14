"use client";
import DashboardMaterialCard from "@/components/cards/dashboardMaterialCard";
import MaterialCard from "@/components/cards/materialCard";
import { MessageError } from "@/components/ui/errorComponents";
import PageTitle from "@/components/ui/typography/pageTitle";
import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";
import { Material } from "@/types/api/materials";
import { useQuery } from "@tanstack/react-query";

const MaterialsPage = () => {
  const { courseUuid, addressingToUuid } = useCourseAddress();
  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["feed", addressingToUuid],
    queryFn: () => CoursesApi.materials.getAll(courseUuid),
  });
  if (isLoading) return <p>loading</p>;
  if (isError || !data) {
    return <MessageError message={error?.message || "neznámá chyba"} />;
  }

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
        <DashboardMaterialCard materials={data} />
      </div>
    </div>
  );
};

export default MaterialsPage;
