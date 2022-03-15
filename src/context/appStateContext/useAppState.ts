import React, { createContext, useContext } from "react";

type AppStateContextType = {
  salesState?: any;
  salesDispatch?: any;
  system?: any;
  mySalesState?: any;
  mySalesDispatch?: any;
  minimumAllowed?: any;
};

export const appStateContext = createContext<AppStateContextType>({});

const useAppState = () => {
  const context = useContext(appStateContext);
  if (!context) {
    throw new Error(
      "You cannot use UseContracts outside of its context provider"
    );
  }
  return context;
};

export default useAppState;
