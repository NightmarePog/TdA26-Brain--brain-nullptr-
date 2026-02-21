"use client";
import AppCard, { AppCardType } from "@/components/cards/appCard";
import { Button } from "@/components/ui/button";
import NotFound from "@/components/ui/errorComponents";
import { Input } from "@/components/ui/input";
import CoursesLayout from "@/features/newCourses/CoursesLayout";
import { CoursesApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CoursesPage = () => {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const { isPending, error, data } = useQuery({
    queryKey: ["allCourses"],
    queryFn: CoursesApi.getAll,
  });

  const routeToCourse = (uuid: string) => {
    router.push("courses/" + uuid);
  };

  if (error) return <p>nastala chyba: {error.message}</p>;
  if (isPending) return <p>načítaní...</p>;

  const filtered = data!.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );

  return <CoursesLayout />;
};

export default CoursesPage;
