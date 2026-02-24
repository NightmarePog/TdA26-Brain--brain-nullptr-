import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BaseCardHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const BaseCardHeader = ({
  title,
  description,
  children,
}: BaseCardHeaderProps) => {
  return (
    <>
      <CardHeader>
        {children}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </>
  );
};
