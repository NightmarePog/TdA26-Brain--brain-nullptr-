import { ReactNode } from "react";
import Text from "@/components/ui/typography/text";

interface props {
  children?: ReactNode;
  className?: string;
}

const SectionTitle = ({ children, className }: props) => {
  return (
    <Text className={"text-2xl font-bold p-3" + className}>{children}</Text>
  );
};

export default SectionTitle;
