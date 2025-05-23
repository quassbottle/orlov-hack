import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
      <ToastContainer />
    </StrictMode>
  );
});
