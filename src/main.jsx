import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthProvider.jsx";

const queryClient = new QueryClient();

function Root() {
  const [Devtools, setDevtools] = useState(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      import('@tanstack/react-query-devtools').then((mod) => {
        setDevtools(() => mod.ReactQueryDevtools);
      });
    }
  }, []);

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
        {Devtools && <Devtools initialIsOpen={false} />}
      </QueryClientProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
