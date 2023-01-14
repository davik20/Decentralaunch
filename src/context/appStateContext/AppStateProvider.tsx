import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import toast from "react-hot-toast";
import { CURRENCIES, DEXES } from "../../constants";
import { utilityFunctions } from "../../utils";
import useConnection from "../connectionContext/useConnection";
import useContracts from "../contractContext/useContracts";
import { appStateContext } from "./useAppState";

interface Props {
  children: any;
}

type salesStateType = {
  error: string;
  status: string;
  data: any[];
};

const salesReducer = (
  prevState: any,
  { type, data = [] }: { type: string; data: any }
): salesStateType => {
  let newState: any;
  console.log(type);
  switch (type) {
    case "pending":
      newState = {
        ...prevState,
        error: "",
        status: "pending",
        data: [],
      };
      break;
    case "idle":
      {
        newState = {
          ...prevState,
          status: "idle",
        };
      }
      break;

    case "resolved":
      {
        newState = {
          ...prevState,
          error: "",
          status: "resolved",
          data: data,
        };
      }
      break;
    case "rejected":
      {
        newState = {
          ...prevState,
          status: "rejected",
          error: data.error,
        };
      }
      break;

    default:
      newState = { ...prevState };
      break;
  }

  return newState;
};

const getDexListForChain = (chainId: any) => {};

function AppStateProvider({ children }: Props): ReactElement {
  const { web3, chainId } = useConnection();

  console.log('chain id ', chainId)
  const { FireSalesLibraryContract } = useContracts();

  const [salesState, salesDispatch] = useReducer(salesReducer, {
    error: "",
    status: "idle",
    data: [],
  });

  const [mySalesState, mySalesDispatch] = useReducer(salesReducer, {
    error: "",
    status: "idle",
    data: [],
  });

  const [system, setSystem] = useState({
    // currency: CURRENCIES[chainId],
    numberDecimals: 1000,
    currency: CURRENCIES[chainId],
    mininimumLiquidityLockup: 1,
    targetDexList: DEXES[chainId],
    //  [
    //   {
    //     label: "Pancake Swap",
    //     value: [
    //       "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    //       "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    //       "0x0a180A76e4466bF68A7F86fB029BEd3cCcFaAac5"
    //     ], // [routerAddress, factoryAddress, wethAddress] ->
    //   },
    //   {
    //     label: "Bakery Swap",
    //     value: [
    //       "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    //       "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    //       "0x0a180A76e4466bF68A7F86fB029BEd3cCcFaAac5"
    //     ],
    //   },
    // ],
  });

  const [minimumAllowed, setMinimumAllowed] = useState({
    status: "pending",
    data: {
      minSoftCapPercent: 0,
      minDexLiquidityPercent: 0,
    },
    error: "",
  });

  useEffect(() => {
    const clearTerms = () => {
      localStorage.removeItem("termsAgreed");
      setTimeout(() => {
        clearTerms();
      }, 360000);
    };
    clearTerms();
  }, []);

  useEffect(() => {
    console.log(FireSalesLibraryContract, 'contract')
    if (FireSalesLibraryContract) {
      const getMinimumAllowed = async () => {
        setMinimumAllowed((prev: any) => ({
          status: "pending",
          error: "",
          data: {
            minSoftCapPercent: 0,
            minDexLiquidityPercent: 0,
          },
        }));
        try {
          const minSoftCapPercent = await FireSalesLibraryContract.methods
            .minSoftCapPercent()
            .call();
          const minDexLiquidityPercent = await FireSalesLibraryContract.methods
            .minDexLiquidityPercent()
            .call();

          let platformFee = await FireSalesLibraryContract.methods
            .platformFee()
            .call();

          platformFee = utilityFunctions().fromWei(platformFee);
          const platformTokenPercent = await FireSalesLibraryContract.methods
            .platformTokenPercent()
            .call();

          const waitTimeBeforeEmergencyWithdraw =
            await FireSalesLibraryContract.methods
              .waitTimeBeforeEmergencyWithdraw()
              .call();

          console.log(minDexLiquidityPercent);
          console.log('chain id ', chainId)
          setMinimumAllowed((prev: any) => ({
            ...prev,
            status: "resolved",
            error: "",
            data: {
              minSoftCapPercent,
              minDexLiquidityPercent,
              platformFee,
              platformTokenPercent,
              waitTimeBeforeEmergencyWithdraw,
            },
          }));
        } catch (error) {
          toast.error("Contract might not be deployed on current blockchain");
          console.log(error);
          setMinimumAllowed((prev: any) => ({
            ...prev,
            status: "rejected",
            error: "An error occurred",
          }));
        }
      };

      getMinimumAllowed();
    }

    return () => {
      console.log("switching off");
    };
  }, [FireSalesLibraryContract]);

  const value = useMemo(
    () => ({
      salesState,
      salesDispatch,
      system,
      mySalesState,
      mySalesDispatch,
      minimumAllowed,
    }),
    [salesState, salesDispatch, mySalesState, system, minimumAllowed]
  );

  return (
    <>
      {minimumAllowed.data && (
        <appStateContext.Provider value={value}>
          {children}
        </appStateContext.Provider>
      )}
    </>
  );
}

export default AppStateProvider;
