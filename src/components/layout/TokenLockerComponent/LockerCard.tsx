import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import useConnection from "../../../context/connectionContext/useConnection";
import useContracts from "../../../context/contractContext/useContracts";
import { useAsync } from "../../../hooks";
import { TokenLocksType } from "../../../pages/Dashboard/Lock/LockLists/demo-lock-data";
import {
  formatNumber,
  formatTimeStamp,
  utilityFunctions,
} from "../../../utils";
import { Card, CardBody, CardHeader } from "../../common/Card";
import { TokenLockLoader } from "../../common/CardLoader";
import { Countdown } from "../../common/CountdownTimer";
import UniswapV2Pair from "@uniswap/v2-core/build/UniswapV2Pair.json";
import ERC20 from "../../../contracts/ERC20.json";
import useAppState from "../../../context/appStateContext/useAppState";
import { ClipLoader } from "react-spinners";
import { util } from "prettier";

const TokenText = styled.div.attrs(() => ({
  className: `space-x-3 flex flex-wrap items-center text-sm font-bold mb-3`,
}))`
  i {
    font-size: 1.5rem;
  }
`;

export const TokenLockerCard = ({ content }: { content: any }) => {
  console.log(content);

  const { FireSalesLockerContract } = useContracts();
  const { web3, account } = useConnection();
  const [symbol, setSymbol] = useState("");
  const { system } = useAppState();
  const [lock, setLock] = useState({
    data: [],
    error: "",
    status: "idle",
  });

  const callback = useCallback(async () => {
    return FireSalesLockerContract.methods.getLock(content.index).call();
  }, [content.index]);

  let {
    data: lockDetail,
    error,
    status,
  } = useAsync(
    () => {
      if (!content.index) {
        return;
      }
      return callback;
    },
    {},
    [callback]
  );

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

        return tokenSymbol;
        // return "ada"
      };
      getTokenSymbol().then((name) => setSymbol(name));
    }
  }, [lockDetail]);

  // const metadata = JSON.parse(content.hash);

  let metadata = { tokenSymbol: "" };
  if (content._type == 0) {
    metadata = content.hash;
  }

  return (
    <>
      {status === "pending" && <TokenLockLoader />}
      {status == "resolved" && (
        <Card className="launch-card text-sm">
          <CardHeader></CardHeader>
          <CardBody className="font-bold text-base">
            <TokenText>
              <i className="las la-calendar-alt"></i>{" "}
              <p>
                {content.tokenName}
                {content._type == 0
                  ? metadata?.tokenSymbol
                  : `${symbol}/${system.currency}`}
              </p>
            </TokenText>
            <TokenText>
              <i className="las la-calendar-alt"></i>{" "}
              <p>{new Date(content.unlockDate * 1000).toDateString()}</p>
            </TokenText>
            <TokenText>
              <i className="las la-hourglass-half"></i>
              <Countdown eventTime={content.unlockDate} />
            </TokenText>
            <TokenText>
              <i className="las la-business-time"></i>{" "}
              <p>
                {formatNumber(content.tokenAmount)}{" "}
                {content._type == 0
                  ? content?.tokenSymbol
                  : `${symbol}/${system.currency}`}
              </p>
            </TokenText>
          </CardBody>
        </Card>
      )}
    </>
  );
};
