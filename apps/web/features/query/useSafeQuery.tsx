import { MessageError } from "@/components/ui/errorComponents";
import { Spinner } from "@/components/ui/spinner";
import { QueryFunction, useQuery } from "@tanstack/react-query";

interface UseSafeQueryProps {
  queryKey: unknown[];
  queryFn: QueryFunction;
  enabled: boolean;
}

function useSafeQuery<TData>({
  queryKey,
  queryFn,
  enabled = true,
}: UseSafeQueryProps) {
  const { isLoading, isError, error, data } = useQuery({
    queryKey,
    queryFn,
    enabled,
  });

  if (isLoading) return <Spinner />;
  if (isError)
    return (
      <MessageError
        message={error instanceof Error ? error.message : "Neznámá chyba"}
      />
    );
  if (!data) return <MessageError message="Žádná data" />;

  return data as TData;
}

export default useSafeQuery;
