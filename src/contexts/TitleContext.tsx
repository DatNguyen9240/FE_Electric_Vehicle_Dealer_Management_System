import React, { createContext, useContext, useState } from "react";

interface TitleContextProps {
  title: string;
  setTitle: (title: string) => void;
}

const TitleContext = createContext<TitleContextProps | undefined>(undefined);

export const useTitle = () => {
  const context = useContext(TitleContext);
  if (!context) throw new Error("useTitle must be used within TitleProvider");
  return context;
};

export const TitleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [title, setTitle] = useState("Dashboard");
  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      {children}
    </TitleContext.Provider>
  );
};
