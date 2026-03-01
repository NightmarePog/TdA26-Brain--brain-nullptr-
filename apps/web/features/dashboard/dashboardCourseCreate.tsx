"use client";

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
import { CourseCreateRequest } from "@/types/api/courses";

/* ============================= */
/* Schema */
/* ============================= */

const formSchema = z
  .object({
    title: z
      .string()
      .min(3, "Název musí být delší jak 3 znaky")
      .max(32, "Název může mít maximálně 32 znaků"),

    description: z.string().max(350, "Popisek může mít maximálně 350 znaků."),

    since: z.coerce
      .date()
      .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
        message: "Začátek musí být vyplněn",
      }),

    until: z.coerce
      .date()
      .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
        message: "Konec musí být vyplněn",
      }),
  })
  .refine((data) => data.until > data.since, {
    message: "Konec musí být později než začátek",
    path: ["until"],
  });

type FormSchema = typeof formSchema;
type FormInput = z.input<FormSchema>;
type FormValues = z.output<FormSchema>;

/* ============================= */
/* Component */
/* ============================= */

const DashboardCourseCreate = () => {
  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      since: "",
      until: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (formData) => {
    const payload: CourseCreateRequest = {
      name: formData.title,
      description: formData.description,
      openedAt: formData.since.toISOString() || "",
      closedAt: formData.until.toISOString() || "",
    };

    toast.promise(CoursesApi.post(payload), {
      loading: "Vytvářím kurz...",
      success: "Kurz úspěšně vytvořen!",
      error: "Něco se pokazilo!",
      position: "bottom-right",
    });

    form.reset();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#91F5AD] text-black p-2 hover:bg-[#91F5AD]/70">
          Vytvořit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <form onSubmit={form.handleSubmit(() => onSubmit)}>
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
              <Label htmlFor="until">Konec</Label>
              <Input
                type="datetime-local"
                id="until"
                {...form.register("until")}
              />
              {form.formState.errors.until && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.until.message}
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
