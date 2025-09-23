import { useContext } from "react";
import { TitleContext } from "./context";

export const useTitle = () => {
  const context = useContext(TitleContext);
  if (!context) throw new Error("useTitle must be used within TitleProvider");
  return context;
};
