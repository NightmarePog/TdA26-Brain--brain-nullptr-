"use client";
import AppCard, { AppCardType } from "@/components/cards/appCard";
import { Button } from "@/components/ui/button";
import NotFound from "@/components/ui/errorComponents";
import { Input } from "@/components/ui/input";
import { CoursesApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DashboardPage = () => {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const { isPending, error, data } = useQuery({
    queryKey: ["allCourses"],
    queryFn: CoursesApi.getAll,
  });

  const routeToCourse = (uuid: string) => {
    router.push("dashboard/" + uuid);
  };

  if (error) return <p>nastala chyba: {error.message}</p>;
  if (isPending) return <p>načítaní...</p>;

  const filtered = data!.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <div className="flex justify-center p-5">
        <Input
          placeholder="Vyhledávat..."
          className="w-100"
          type="search"
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
      </div>
      <div>
        {filtered.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2 my-2 w-full overflow-hidden">
            {/*remapping because the input is diffrent than output */}
            {filtered.map((item) => (
              <AppCard
                key={item.uuid}
                buttonLabel="Začít"
                appCard={{
                  title: item.name,
                  description: item.description,
                  key: item.uuid,
                  previewImg: "/tda.png",
                }}
              >
                <Button onClick={() => routeToCourse(item.uuid)}>
                  upravit
                </Button>
              </AppCard>
            ))}
          </div>
        ) : (
          <NotFound />
        )}
      </div>
    </>
  );
};

export default DashboardPage;
