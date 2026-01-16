"use client";
import AppCard from "@/components/cards/appCard";
import { Button } from "@/components/ui/button";
import NotFound from "@/components/ui/errorComponents";
import { Input } from "@/components/ui/input";
import { CoursesApi } from "@/lib/api";
import { CourseCreateRequest } from "@/types/api/courses";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus } from "phosphor-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const DashboardPage = () => {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState<CourseCreateRequest>({
    name: "",
    description: "",
  });

  const { isPending, error, data, refetch } = useQuery({
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

  const createNewCourse = async () => {
    try {
      const promise = CoursesApi.post(newCourse);

      toast.promise(promise, {
        loading: "Vytvářím kurz…",
        success: () => "Kurz vytvořen!",
        error: (err: Error) => `Chyba: ${err.message}`,
      });

      const result = await promise;

      setIsModalOpen(false);
      setNewCourse({ name: "", description: "" });
      routeToCourse(result.uuid);
    } catch (err) {}
  };

  return (
    <>
      <div className="flex justify-center p-5 gap-2">
        <Input
          placeholder="Vyhledávat..."
          className="w-100"
          type="search"
          onChange={(e) => setQuery(e.target.value)}
        />

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              přidat
              <Plus />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Vytvořit nový kurz</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Název kurzu</Label>
                <Input
                  id="title"
                  value={newCourse.name}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Popis kurzu</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createNewCourse}>Vytvořit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        {filtered.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2 my-2 w-full overflow-hidden">
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
