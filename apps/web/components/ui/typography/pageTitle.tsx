import { ReactNode } from "react";
import Text from "@/components/ui/typography/text";

interface props {
  children?: ReactNode;
}

const PageTitle = ({ children }: props) => {
  return <Text className="text-3xl font-bold p-5">{children}</Text>;
};

export default PageTitle;
