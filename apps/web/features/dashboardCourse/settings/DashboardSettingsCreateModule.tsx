import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";
import { AxiosError } from "axios";
import { PackagePlus } from "lucide-react";
import { toast } from "sonner";

const moduleSchema = z.object({
  name: z.string().min(3, "Název musí mít alespoň 3 znaky"),
  description: z.string().optional(),
});

type ModuleFormValues = z.infer<typeof moduleSchema>;

const DashboardSettingsCreateModule = () => {
  const routeData = useCourseAddress();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
  });

  const onSubmit = async (data: ModuleFormValues) => {
    try {
      await CoursesApi.modules.post(routeData.courseUuid, {
        name: data.name.trim(),
        description: data.description?.trim() || "",
      });

      toast.success("Modul vytvořen");
      reset();
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(
        error.response?.data?.message || "Nepodařilo se vytvořit modul",
      );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PackagePlus /> Vytvořit modul
        </Button>
      </DialogTrigger>

      <DialogContent className="w-112 p-6 flex flex-col gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <DialogTitle className="text-2xl font-bold">
            Vytvořit nový modul
          </DialogTitle>

          <section className="flex flex-col gap-1">
            <Label className="font-medium">Název modulu</Label>
            <Input placeholder="Zadejte název modulu" {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </section>

          <section className="flex flex-col gap-1">
            <Label className="font-medium">Popisek</Label>
            <Textarea
              placeholder="Krátký popisek modulu"
              {...register("description")}
              className="h-20 resize-none"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </section>

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Zrušit</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit">Vytvořit</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardSettingsCreateModule;
