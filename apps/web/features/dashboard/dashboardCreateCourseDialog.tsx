"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  theme: z.string().optional(),
  openedAt: z.string().optional(),
  closedAt: z.string().optional(),
  image: z
    .any()
    .refine(
      (files) => !files || files.length <= 1,
      "Pouze jeden soubor je povolen",
    )
    .optional(),
});

type FormValues = z.infer<typeof schema>;

export function DashboardCreateCourseDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      theme: "",
      openedAt: "",
      closedAt: "",
      image: undefined,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          theme: values.theme || "",
          openedAt: values.openedAt,
          closedAt: values.closedAt,
        }),
      });

      if (!res.ok) throw new Error("Chyba při vytváření kurzu");
      const course = await res.json();

      if (values.image?.[0]) {
        const formData = new FormData();
        formData.append("file", values.image[0]);

        const imgRes = await fetch(`/api/courses/${course.uuid}/image`, {
          method: "POST",
          body: formData,
        });

        if (!imgRes.ok) throw new Error("Nepodařilo se nahrát obrázek");
      }

      toast.success("Kurz úspešně vytvořen!");
      reset();
      setOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err);
        toast.error(err.message);
      } else {
        console.error(err);
        toast.error("Něco se pokazilo!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Vytořit kurz
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Vytořit kurz</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1">NÁzev</label>
            <Input {...register("name")} required />
          </div>

          <div>
            <label className="block mb-1">Popisek</label>
            <Textarea {...register("description")} />
          </div>

          <div>
            <label className="block mb-1">Začíná v:</label>
            <Input type="datetime-local" {...register("openedAt")} />
          </div>

          <div>
            <label className="block mb-1">Končí v:</label>
            <Input type="datetime-local" {...register("closedAt")} />
          </div>

          <div>
            <label className="block mb-1">Image</label>
            <Input type="file" accept="image/*" {...register("image")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
