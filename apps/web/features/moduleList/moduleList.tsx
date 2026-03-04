import { ReactNode } from "react";

interface ModuleList {
  children: ReactNode;
}

const ModuleList = ({ children }: ModuleList) => {
  return <div>{children}</div>;
};

export default ModuleList;
