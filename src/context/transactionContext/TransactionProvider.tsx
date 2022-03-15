import { time } from "console";
import React, { ReactElement, useCallback } from "react";
import toast from "react-hot-toast";
import { transactionContext } from "./useTransaction";

interface Props {
  children: any;
}

function TransactionProvider({ children }: Props): ReactElement {
  const sendTransaction = useCallback((callback: any) => {
    let timeOut = toast.loading("loading");
    callback();
    setTimeout(() => {
      toast.dismiss(timeOut);
    }, 10000);
  }, []);

  return (
    <transactionContext.Provider value={{ sendTransaction }}>
      {children}
    </transactionContext.Provider>
  );
}

export default TransactionProvider;
