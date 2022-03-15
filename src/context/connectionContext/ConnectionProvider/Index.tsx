import React, {
  ReactElement,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import { LoadingIndicator } from "react-select/dist/declarations/src/components/indicators";
import { useWeb3 } from "../../../hooks";
import { sanitize, windowObj } from "../../../utils";
import { connectionContext } from "../useConnection";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import { DEFAULT_RPC_URL } from "../../../constants";
import userFuncs from "../../../apis/user";

function ConnectionProvider({ children }: { children: any }): ReactElement {
  const [provider, setProvider] = useState<null | any>(null);
  const { addUser } = userFuncs();
  const [state, setState] = useState<any>();

  const { web3, appProviderURI, chainId, chainIdError } = useWeb3(provider);
  const [account, setAccount] = useState<string | null>(null);

  const [connectModalOpen, setConnectModalOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("isConnected") === "true") {
      if (!account) {
        console.log("account", account);
        connectWallet("injected", false);
      }
      console.log(account);
    }
  }, []);

  const connectWallet = useCallback(
    async (walletType: any, shouldToast: any = true) => {
      if (walletType === "walletConnect") {
        try {
          const provider: any = new WalletConnectProvider({
            infuraId: sanitize(process.env.REACT_APP_INFURA_KEY),
          });
          await provider.enable();
          //  Get Accounts
          const web3 = new Web3(provider);
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);

          setProvider(provider);
          await addUser(accounts[0]);
        } catch (error) {
          console.log("Connection failed");
        }
      } else if (walletType === "injected") {
        if (windowObj.ethereum) {
          try {
            // get chainId and accounts
            await windowObj.ethereum.enable();
            const web3 = new Web3(windowObj.ethereum);
            const chainId = await web3.eth.getChainId();

            const accounts = await web3.eth.getAccounts();
            setAccount(accounts[0]);
            await addUser(accounts[0]);
            setProvider(null);
            localStorage.setItem("isConnected", "true");
            if (shouldToast) {
              toast.success("Connected successfully");
            }
          } catch (error) {
            // show user rejected error
            toast.error("User rejected connection");
          }
        } else {
          // show no provider message
          toast.error("Please use a metamask enabled wallet");
        }
      }
    },
    [web3]
  );

  const disconnectWallet = useCallback(async () => {
    setAccount(null);
    localStorage.removeItem("isConnected");
    setProvider(null);
    toast.success("Wallet disconnected");
  }, []);

  const value = React.useMemo(() => {
    return {
      web3,
      appProviderURI,
      account,
      chainId,
      chainIdError,
      connectWallet,
      disconnectWallet,
      connectModalOpen,
      setConnectModalOpen,
    };
  }, [web3, appProviderURI, account, chainId, chainIdError, connectModalOpen]);

  const shouldReturn = (): boolean => {
    if (web3 && appProviderURI && chainId) {
      return true;
    } else {
      return false;
    }
  };

  console.log(web3, appProviderURI, chainId);
  return (
    <connectionContext.Provider value={value}>
      {shouldReturn() ? children : <div>Loading</div>}
    </connectionContext.Provider>
  );
}

export default ConnectionProvider;
