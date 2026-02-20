import { ReactNode } from "react";

interface InfoLabelProps {
  children: ReactNode;
}

const InfoLabel = ({ children }: InfoLabelProps) => {
  return <div className="flex py-2 gap-1 text-gray-400">{children}</div>;
};

export default InfoLabel;
