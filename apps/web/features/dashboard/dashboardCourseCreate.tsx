/**
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { FieldGroup, Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroupTextarea } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { CoursesApi } from "@/lib/api";
import useCourseAddress from "@/hooks/useCourseAddress";
import { CourseCreateRequest } from "@/types/api/courses";


const formSchema = z.object({
  title: z
    .string()
    .min(3, "Název musí být delší jak 3 znaky")
    .max(32, "Název může mít maximálně 32 znaků"),

  description: z.string().max(350, "Popisek může mít maximálně 350 znaků."),

  since: z.coerce
    .date()
    .refine((val) => !isNaN(val.getTime()), {
      message: "Začátek musí být vyplněn",
    })
    .refine((val) => val > new Date(), {
      message: "Začátek kurzu musí být v budoucnosti",
    }),

  time: z.coerce
    .number()
    .min(5, { message: "Kurz musí trvat alespoň 5 minut" }),

  image: z
    .any()
    .refine((files) => files?.length === 1, "Obrázek je povinný")
    .refine(
      (files) => files?.[0]?.type?.startsWith("image/"),
      "Soubor musí být obrázek",
    ),
});

type FormSchema = typeof formSchema;
type FormInput = z.input<FormSchema>;
type FormValues = z.output<FormSchema>;


const DashboardCourseCreate = () => {
  const [open, setOpen] = useState(false);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      since: "",
      time: 0,
      image: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (formData) => {
    const multipart = new FormData();

    multipart.append("name", formData.title);
    multipart.append("description", formData.description);
    multipart.append("openedAt", formData.since.toISOString());
    multipart.append("courseTime", formData.time.toString());
    multipart.append("image", formData.image[0]);

    try {
      const data: CourseCreateRequest = {
        name: formData.title,
        description: formData.description,
        openedAt: formData.since.toISOString(),
        courseTime: formData.time,
        // obrázek nelze přímo uložit, můžeš tu dát URL pokud ji máš
        // image: imageUrl
      };

      await CoursesApi.post();

      toast.success("Kurz úspěšně vytvořen!", {
        position: "bottom-right",
      });

      form.reset();
      setOpen(false); // zavře dialog jen při úspěchu
    } catch {
      toast.error("Něco se pokazilo!", {
        position: "bottom-right",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#91F5AD] text-black p-2 hover:bg-[#91F5AD]/70">
          Vytvořit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Vytvořit nový kurz</DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <Label htmlFor="title">Název</Label>
              <Input
                id="title"
                placeholder="Nový kurz"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </Field>

            <Field>
              <Label htmlFor="description">Popisek</Label>
              <InputGroupTextarea
                id="description"
                className="min-h-50 border rounded-xl"
                placeholder="Zde napiš shrnutí kurzu..."
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </Field>

            <Field>
              <Label htmlFor="since">Začátek</Label>
              <Input
                type="datetime-local"
                id="since"
                {...form.register("since")}
              />
              {form.formState.errors.since && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.since.message}
                </p>
              )}
            </Field>

            <Field>
              <Label htmlFor="time">Délka kurzu v minutách</Label>
              <Input
                type="number"
                id="time"
                min={0}
                {...form.register("time")}
              />
              {form.formState.errors.time && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.time.message}
                </p>
              )}
            </Field>

            <Field>
              <Label htmlFor="image">Náhledový obrázek</Label>
              <Input
                type="file"
                id="image"
                accept="image/*"
                {...form.register("image")}
              />
              {form.formState.errors.image && (
                <p className="text-red-500 text-sm mt-1">
                  {String(form.formState.errors.image.message)}
                </p>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Zpátky
              </Button>
            </DialogClose>
            <Button type="submit">Vytvořit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardCourseCreate;
**/
