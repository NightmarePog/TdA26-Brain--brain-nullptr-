import { HttpError } from "@/components/ui/errorComponents";

const NotFound = () => {
  return (
    <div className="pt-40">
      <HttpError code={404} />
    </div>
  );
};

export default NotFound;
