import { MessageError } from "@/components/ui/errorComponents";
import { Spinner } from "@/components/ui/spinner";
import { QueryFunction, useQuery } from "@tanstack/react-query";
import { ReactNode } from "react";

interface UseSafeQueryProps {
  queryKey: unknown[];
  queryFn: QueryFunction;
  enabled: boolean;
}

interface UseSafeQueryReturn<TData> {
  queryStatus: "finished" | "loading" | "error";
  StatusElement: ReactNode | null;
  data: TData | null;
}

function useSafeQuery<TData>({
  queryKey,
  queryFn,
  enabled = true,
}: UseSafeQueryProps): UseSafeQueryReturn<TData> {
  const { isLoading, isError, error, data } = useQuery({
    queryKey,
    queryFn,
    enabled,
  });

  if (isLoading)
    return { queryStatus: "loading", StatusElement: <Spinner />, data: null };
  if (isError)
    return {
      queryStatus: "error",
      StatusElement: (
        <MessageError
          message={error instanceof Error ? error.message : "Neznámá chyba"}
        />
      ),
      data: null,
    };
  if (!data)
    return {
      queryStatus: "error",
      StatusElement: <MessageError message="Žádná data" />,
      data: null,
    };

  return {
    queryStatus: "finished",
    StatusElement: null,
    data: data as TData,
  };
}

export default useSafeQuery;
