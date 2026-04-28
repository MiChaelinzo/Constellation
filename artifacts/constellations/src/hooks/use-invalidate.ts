import { QueryClient } from "@tanstack/react-query";
import {
  getListEntriesQueryKey,
  getGetSkyQueryKey,
  getGetCalendarQueryKey,
  getGetInsightsQueryKey,
  getListRecentEntriesQueryKey
} from "@workspace/api-client-react";

export function invalidateAllQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
  queryClient.invalidateQueries({ queryKey: getGetSkyQueryKey() });
  queryClient.invalidateQueries({ queryKey: getGetCalendarQueryKey({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 }) });
  queryClient.invalidateQueries({ queryKey: getGetInsightsQueryKey() });
  queryClient.invalidateQueries({ queryKey: getListRecentEntriesQueryKey() });
}
