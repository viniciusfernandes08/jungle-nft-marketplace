import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { Providers } from "@/app/providers";
import { enableMocking } from "@/app/enable-mocking";
import { router } from "@/app/router";
import { setupSessionExpiry } from "@/app/session-expiry";

import "@/index.css";

setupSessionExpiry();

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </StrictMode>,
  );
});
