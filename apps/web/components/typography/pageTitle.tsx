import { ReactNode } from "react";
import Text from "@/components/typography/text";

interface props {
  children?: ReactNode;
  className?: string;
}

const PageTitle = ({ children, className }: props) => {
  return <Text className={`text-3xl font-bold ${className}`}>{children}</Text>;
};

export default PageTitle;
