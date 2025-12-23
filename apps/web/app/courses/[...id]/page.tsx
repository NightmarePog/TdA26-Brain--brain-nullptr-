"use client";
import { CoursesApi } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Zadejte název"),
  description: z.string().min(1, "zadej popisek"),
});

const DashboardPage = () => {
  const { id } = useParams<{ id: string }>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { isPending, isError, error, data } = useQuery({
    queryKey: ["course", id],
    queryFn: () => CoursesApi.get(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name,
        description: data.description,
      });
    }
  }, [data, form]);

  if (isPending) return <>pending</>;
  if (isError) return <>{error.message}</>;

  return <form></form>;
};

export default DashboardPage;
