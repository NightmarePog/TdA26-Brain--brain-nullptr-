import { Input } from "@/components/ui/input";

interface CourseSearchBarProps {
  search: (query: string) => void;
}

const CourseSearchBar = ({ search }: CourseSearchBarProps) => {
  return (
    <div className="flex justify-center p-5">
      <Input
        placeholder="Vyhledávat..."
        className="w-100"
        type="search"
        onChange={(e) => {
          search(e.target.value);
        }}
      />
    </div>
  );
};
