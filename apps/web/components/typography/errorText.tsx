import { ReactNode } from "react";

interface ErrorLabelProps {
  children: ReactNode;
}

const ErrorLabel = ({ children }: ErrorLabelProps) => {
  return <p className="text-red-500 font-bold">{children}</p>;
};

export default ErrorLabel;
