import React, { useEffect, useRef, useState } from "react";
import Web3 from "web3";
import { windowObj } from "../utils";

import detectEthereumProvider from "@metamask/detect-provider";
import toast from "react-hot-toast";
import {
  ALLOWEDCHAINIDS,
  DEFAULT_CHAIN_ID,
  DEFAULT_RPC_URL,
} from "../constants";

const getWeb3 = async (provider: string | null = null) => {
  let appProviderURI: any;

  let web3: any = null;
  let chainId = null;
  let chainIdError = false;
  if (windowObj.ethereum && !provider) {
    appProviderURI = await detectEthereumProvider();
    web3 = new Web3(appProviderURI);
    chainId = await web3.eth.getChainId();

    console.log(chainId);

    if (!ALLOWEDCHAINIDS.includes(chainId)) {
      web3 = new Web3(DEFAULT_RPC_URL);
      console.log(web3);
      chainId = DEFAULT_CHAIN_ID;
      chainIdError = true;
    }
  } else if (provider) {
    console.log(provider);
    appProviderURI = provider;

    web3 = new Web3(appProviderURI);
    console.log(web3);
    chainId = await web3.eth.getChainId();

    console.log("chainId", chainId);
    if (!ALLOWEDCHAINIDS.includes(chainId)) {
      web3 = new Web3(DEFAULT_RPC_URL);
      console.log(web3);
      chainId = DEFAULT_CHAIN_ID;
      chainIdError = true;
    }

    console.log(chainId);
  } else {
    console.log(provider);
    appProviderURI = DEFAULT_RPC_URL;

    web3 = new Web3(appProviderURI);
    console.log(web3);
    chainId = await web3.eth.getChainId();

    chainIdError = false;

    // if(!ALLOWEDCHAINIDS.includes(chainId)){

    //   web3 = new Web3(DEFAULT_RPC_URL);
    //   console.log(web3)
    //   chainId = DEFAULT_CHAIN_ID
    //   chainIdError = true

    // }
  }

  return {
    web3,
    appProviderURI,
    chainId,
    chainIdError,
  };
};

export const useWeb3 = (provider?: string) => {
  const [state, setState] = useState<any>({
    web3: null,
    appProviderURI: null,
    chainId: null,
    chainIdError: false,
  });

  useEffect(() => {
    getWeb3(provider).then((result) => {
      setState(result);
    });
  }, [provider]);

  return state;
};

export const useContractCreator = (
  web3: any,
  JsonInterface: any,
  defaultAddress: any = ""
) => {
  if (defaultAddress) {
    try {
      const contract = new web3.eth.Contract(JsonInterface.abi, defaultAddress);

      return contract;
    } catch (error) {
      alert(error);
    }
  } else {
    const id: any = Object.keys(JsonInterface.networks)[0];
    console.log(id, JsonInterface, JsonInterface.networks);
    const address = JsonInterface.networks[id]?.address;

    const contract = new web3.eth.Contract(JsonInterface.abi, address);
    console.log(address, contract);

    return contract;
  }
};

export const useAsync = (
  asyncCallBack: any,
  initialState: any,
  dependencies: any[]
) => {
  const [state, setState] = useState<{
    data: any;
    status: string;
    error: string;
  }>({ ...initialState, data: null, status: "idle", error: "" });

  React.useEffect(() => {
    const promise = asyncCallBack();

    if (!promise) return;

    setState((prev: any) => {
      return {
        ...prev,
        status: "pending",
        data: null,
      };
    });

    console.log(promise);

    promise()
      .then((result: any) => {
        console.log("result");
        setState((prev: any) => {
          return {
            ...prev,
            status: "resolved",
            data: result,
            error: "",
          };
        });
      })
      .catch((error: any) => {
        setState((prev: any) => {
          return {
            ...prev,
            status: "rejected",
            data: null,
            error: error,
          };
        });
      });
  }, [...dependencies]);

  return { ...state };
};

export const useSendTransaction = () => {
  const [transaction, setTransaction] = useState<{
    status: string;
    error: any;
  }>({
    status: "idle",
    error: "",
  });

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const transactionHelper = async (
    callBack: any,
    pendingMsg: string = "Transacton in progress",
    successMsg: string = "Transaction successful",
    errorMsg: string = "An error occurred"
  ) => {
    let loading = toast.loading(pendingMsg);
    setTimeout(() => {
      toast.dismiss(loading);
    }, 15000);

    try {
      setTransaction((prev) => {
        return {
          ...prev,
          status: "pending",
          error: "",
        };
      });

      const result = await callBack();
      toast.dismiss(loading);
      toast.success(successMsg);
      if (isMounted) {
        setTransaction((prev) => {
          return {
            ...prev,
            status: "resolved",
            error: "",
          };
        });
      }
      return result;
    } catch (error) {
      if (isMounted) {
        setTransaction((prev: any) => {
          return {
            ...prev,
            status: "rejected",
            error: error,
          };
        });
      }

      toast.dismiss(loading);
      toast.error(errorMsg);
      throw error;
    }
  };

  return { transactionHelper, transaction };
};
