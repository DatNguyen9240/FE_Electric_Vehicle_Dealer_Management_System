import { createContext } from "react";

export interface TitleContextProps {
  title: string;
  setTitle: (title: string) => void;
}

export const TitleContext = createContext<TitleContextProps | undefined>(
  undefined
);
