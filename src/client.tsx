import { StartClient } from "@tanstack/react-start/client";

import { hydrateRoot } from "react-dom/client";
import { StrictMode } from "react";
import { createRouter } from "./router";

console.log("src/client.tsx: Starting hydration...");

window.addEventListener("error", (event) => {
  console.error("GLOBAL CLIENT ERROR:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("UNHANDLED REJECTION:", event.reason);
});

const router = createRouter();

  hydrateRoot(
    document,
    <StrictMode>
      {/* @ts-ignore */}
      <StartClient router={router} />
    </StrictMode>,
  );

console.log("src/client.tsx: Hydration call completed.");

