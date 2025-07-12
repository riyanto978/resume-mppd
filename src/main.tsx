import { createRoot } from "react-dom/client";
import "rsuite/dist/rsuite.min.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./components/geo.css";
import Wrapper from "./wrapper";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const route = createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Wrapper />
  </QueryClientProvider>
);
