import { ReactNode } from "react";
import Text from "@/components/ui/typography/text";

interface props {
  children?: ReactNode;
}

const SectionTitle = ({ children }: props) => {
  return <Text className="text-2xl font-bold p-3">{children}</Text>;
};

export default SectionTitle;
