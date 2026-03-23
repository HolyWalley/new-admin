import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./lib/theme";
import { registerField, registerAction, registerPage } from "./lib/registry";
import "./app.css";

// Expose React and jsx-runtime globally for host app custom component scripts
window.React = React;
window.__jsxRuntime__ = jsxRuntime;
window.NewAdmin = { registerField, registerAction, registerPage };

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob("./pages/**/*.tsx", { eager: true });
    const page = pages[`./pages/${name}.tsx`];
    if (!page) {
      throw new Error(`Page not found: ${name}`);
    }
    return page;
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <ThemeProvider>
        <App {...props} />
      </ThemeProvider>
    );
  },
});
