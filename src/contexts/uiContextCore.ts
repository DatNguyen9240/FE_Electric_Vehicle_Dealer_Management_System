import React from "react";

export type UiContextValue = {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  confirm: (message: string) => Promise<boolean>;
};

export const UiContext = React.createContext<UiContextValue | null>(null);

export const useUi = (): UiContextValue => {
  const ctx = React.useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
};

export default UiContext;
