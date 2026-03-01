import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Course } from "@/types/api/courses";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import DashboardCourseCreate from "../dashboard/dashboardCourseCreate";

interface CoursesFilteringProps {
  data: Course[];
  children: (filteredData: Course[]) => React.ReactNode;
  canAdd?: boolean;
}

const CoursesFiltering = ({
  data,
  children,
  canAdd = false,
}: CoursesFilteringProps) => {
  const [search, setSearch] = useState("");

  const filtered = data.filter((course) =>
    course.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex justify-center gap-2 items-center">
        <div className="w-80 flex">
          <Field className="border-4 border-secondary rounded-xl">
            <InputGroup>
              <InputGroupInput
                placeholder="Vyhledávat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <InputGroupAddon align="inline-end">
                <Search />
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </div>
        {canAdd && <DashboardCourseCreate />}
      </div>

      {children(filtered)}
    </div>
  );
};

export default CoursesFiltering;
