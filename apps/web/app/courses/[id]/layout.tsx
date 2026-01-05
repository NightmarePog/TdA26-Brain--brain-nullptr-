"use client";
import { CoursesConstLastViewed } from "@/const/courses";
import CourseSidebar from "@/components/layouts/courseSidebar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SidebarProvider } from "@/components/ui/sidebar";

const formSchema = z.object({
  name: z.string().min(1, "Zadejte název"),
  description: z.string().min(1, "zadej popisek"),
});

const DashboardPage = ({ children }: { children: React.ReactNode }) => {
  const { id } = useParams<{ id: string }>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  //const { isPending, isError, error, data } = useQuery({
  //  queryKey: ["course", id],
  //  queryFn: () => CoursesApi.get(id as string),
  //  enabled: !!id,
  //});
  const data = CoursesConstLastViewed[0];
  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name,
        description: data.description,
      });
    }
  }, [data, form]);

  //if (isPending) return <>pending</>;
  //if (isError) return <>{error.message}</>;

  return (
    <SidebarProvider>
      <CourseSidebar />
      {children}
    </SidebarProvider>
  );
};

export default DashboardPage;
