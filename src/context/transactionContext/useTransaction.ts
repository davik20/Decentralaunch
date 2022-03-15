import React, { createContext, useContext } from "react";
import { transactionContextType } from "./types";

export const transactionContext = createContext<transactionContextType>({});

const useTransaction = () => {
  const context = useContext(transactionContext);
  if (!context) {
    throw new Error("You cannot use this outside of a Transaction Provider");
  }

  return useContext(transactionContext);
};

export default useTransaction;
