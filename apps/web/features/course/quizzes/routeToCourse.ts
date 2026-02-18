import { useRouter } from "next/router";

export const useRouteToCourse = () => {
  const router = useRouter();

  return (uuid: string) => {
    router.push("courses/" + uuid);
  };
};
