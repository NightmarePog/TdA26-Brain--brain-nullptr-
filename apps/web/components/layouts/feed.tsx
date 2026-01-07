import { Separator } from "../ui/separator";

interface FeedProps {
  author: string;
  message: string;
}

const Feed = ({ author, message }: FeedProps) => {
  return (
    <div className="w-full justify-center bg-secondary rounded-lg shadow-2xl p-6">
      <h2 className="text-lg font-semibold">{author}</h2>
      <p className="mt-2">{message}</p>
      <Separator className="my-4" />
    </div>
  );
};

export default Feed;
