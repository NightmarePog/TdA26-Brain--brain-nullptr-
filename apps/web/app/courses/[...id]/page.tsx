"use client";
import { CoursesApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const Course = () => {
  const { id } = useParams<{ id: string }>();
  const { isPending, error, data } = useQuery({
    queryKey: ["course", id],
    queryFn: () => CoursesApi.get(id as string),
  });

  if (isPending) return <>pending - {id}</>;
  if (error)
    return (
      <>
        {error.message} - uuid: {id}
      </>
    );

  return <>{JSON.stringify(data)}</>;
};

export default Course;
