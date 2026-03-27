
  import React from "react";
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import faviconUrl from "./assests/favicon.png?url";
  import "./index.css";
  import "./styles/globals.css";

  const existingFavicon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
  const faviconLink = existingFavicon ?? document.createElement("link");
  faviconLink.rel = "icon";
  faviconLink.type = "image/png";
  faviconLink.href = faviconUrl;
  if (!existingFavicon) document.head.appendChild(faviconLink);

  createRoot(document.getElementById("root")!).render(<App />);
  