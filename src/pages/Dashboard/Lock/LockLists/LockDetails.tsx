import { ContentCopy } from "@mui/icons-material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  PrimaryButton,
  SafeButton,
} from "../../../../components/common/Button";
import {
  Card,
  CardHeader,
  CardSubHeader,
} from "../../../../components/common/Card";
import { Countdown } from "../../../../components/common/CountdownTimer";
import { Spinner } from "../../../../components/common/Spinner";
import { LaunchInfoText } from "../../../../components/layout/LaunchComponent";
import useConnection from "../../../../context/connectionContext/useConnection";
import useContracts from "../../../../context/contractContext/useContracts";
import { useAsync } from "../../../../hooks";
import {
  formatNumber,
  formatTimeStamp,
  utilityFunctions,
} from "../../../../utils";
import { tokenLocks } from "./demo-lock-data";
import UniswapV2Pair from "@uniswap/v2-core/build/UniswapV2Pair.json";
import ERC20 from "../../../../contracts/ERC20.json";

import Connect from "../../../../components/Connect";
import useAppState from "../../../../context/appStateContext/useAppState";
import toast from "react-hot-toast";

const LockDetails = () => {
  const { FireSalesLockerContract } = useContracts();
  const { id } = useParams();
  const { account, connectWallet, web3, chainIdError } = useConnection();
  const { system } = useAppState();

  const [lock, setLock] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState("_");
  const callback = useCallback(async () => {
    if (id) {
      console.log(id);
      const getLockById = async () => {
        const lock = await FireSalesLockerContract.methods.getLock(id).call();
        console.log(lock);
        let hash = await fetch(lock.hash);
        if (lock._type === "token") {
          hash = await hash.json();
        }

        return { ...lock, ...hash };
      };
      const getLockByAddress = async () => {
        const lock = await FireSalesLockerContract.methods
          .getLockByAddress(id)
          .call();
        let hash = await fetch(lock.hash);
        hash = await hash.json();
        return { ...lock, ...hash };
      };

      if (id.toString().trim().length === 42) {
        console.log("davik");
        const result = await getLockByAddress();
        console.log("result", result);
        return result;
      } else {
        return getLockById();
      }
    }
  }, [id]);

  let {
    data: lockDetail,
    error,
    status,
  } = useAsync(
    () => {
      if (!id) {
        return;
      }
      return callback;
    },
    {},
    [callback]
  );

  console.log("lockDetail", lockDetail);

  useEffect(() => {
    if (lockDetail && lockDetail._type === "liquidity") {
      const getTokenSymbol = async () => {
        const pairContract = new web3.eth.Contract(
          UniswapV2Pair.abi,
          lockDetail.tokenAddress
        );

        const tokenAddress = await pairContract.methods.token0().call();

        const tokenContract = new web3.eth.Contract(ERC20.abi, tokenAddress);

        const tokenSymbol = await tokenContract.methods.symbol().call();
        // const tokenName = await tokenContract.methods.name()

        return tokenSymbol;
      };
      getTokenSymbol().then((name) => setSymbol(name));
    }
  }, [lockDetail]);

  const unlockToken = async (id: any) => {
    if (account !== lockDetail.receiverAddress) return;
    if (parseInt(lockDetail.tokenAmount) < 1)
      return toast.error("There is nothing to unlock");
    if (Date.now() / 1000 <= parseInt(lockDetail.unlockDate)) {
      console.log("less");
      return toast.error("Unlock date not reached");
    }

    setLoading(true);

    FireSalesLockerContract.methods
      .unlockToken(id)
      .send({ from: account })
      .then((res: any) => {
        console.log(res);
        setLoading(false);
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
      });
  };

  lockDetail = useMemo(() => {
    if (status !== "resolved") return;

    return {
      ...lockDetail,

      tokenAmount: utilityFunctions().fromDecimals(
        lockDetail.tokenAmount,
        lockDetail.decimals
      ),
    };
  }, [lockDetail]);

  return (
    <>
      {(!account || chainIdError) && <Connect />}
      {account && !chainIdError && (
        <>
          {status === "pending" && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                height: "70vh",
                alignItems: "center",
              }}
            >
              <Spinner />
            </div>
          )}
          <div className="flex flex-col md:flex-row space-y-5 md:space-y-0 space-x-0 md:space-x-5 pt-20">
            {/* <Card
        style={{ height: 'fit-content' }}
        className="w-full md:w-1/3 md:sticky md:top-1"
      >
        <CardSubHeader>{lock.tokenSymbol} Records</CardSubHeader>
      </Card> */}

            {status === "resolved" && (
              <Card className="w-full md:w-2/3 mx-auto">
                <div className="mb-8">
                  <h3 className="pb-3 font-bold">Lock Info</h3>
                  <hr />
                </div>
                <div className="space-y-4">
                  <LaunchInfoText>
                    Locker Address: <span>{lockDetail.receiverAddress}</span>
                  </LaunchInfoText>
                  <LaunchInfoText>
                    Token Address: <span>{lockDetail.tokenAddress}</span>
                  </LaunchInfoText>
                  {/* <LaunchInfoText>
                Token Name: <span>{lockDetail.tokenName}</span>
              </LaunchInfoText>
              <LaunchInfoText>
                Token Symbol: <span>{lockDetail.tokenSymbol}</span>
              </LaunchInfoText> */}
                  <LaunchInfoText>
                    Amount Locked:{" "}
                    <span>
                      {formatNumber(lockDetail.tokenAmount)}{" "}
                      {lockDetail._type === "liquidity"
                        ? `${symbol}/
                      ${system.currency}`
                        : lockDetail.tokenSymbol}
                    </span>
                  </LaunchInfoText>
                  {/* <LaunchInfoText>
              Total Locks: <span>{lockDetail.totalLocks}</span>
            </LaunchInfoText> */}
                  <LaunchInfoText>
                    Lock Timer: <Countdown eventTime={lockDetail.unlockDate} />
                  </LaunchInfoText>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  {!account && (
                    <PrimaryButton
                      onClick={connectWallet}
                      style={{ marginTop: "2.5rem" }}
                    >
                      Connect Wallet
                    </PrimaryButton>
                  )}
                  {account && (
                    <PrimaryButton
                      onClick={() => unlockToken(id)}
                      style={{ marginTop: "2.5rem" }}
                    >
                      {loading ? <Spinner width={30} height={30} /> : "Unlock"}
                    </PrimaryButton>
                  )}
                </div>
              </Card>
            )}
            {status === "reject" && <div> Lock not found </div>}
          </div>
        </>
      )}
    </>
  );
};

export default LockDetails;
