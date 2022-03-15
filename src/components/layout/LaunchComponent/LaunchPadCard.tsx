import React, { useState, useEffect, Fragment, useMemo } from "react";
import { LaunchInfoText } from ".";
import useContracts from "../../../context/contractContext/useContracts";
import { ListsType } from "../../../pages/Dashboard/LaunchPad/Lists/demo-data";
import { Avatar } from "../../common/Avatar";
import { Badge } from "../../common/Badge";
import { SecondaryButton } from "../../common/Button";
import { Card, CardHeader, CardSubHeader, CardBody } from "../../common/Card";
import { Progress } from "../../common/Progress";
import Truncate from "../../common/Truncate";
import InuLogo from "../../../assets/images/inu-logo.jpg";
import { LaunchPadLoader } from "../../common/CardLoader";
import { formatNumber, reformer, utilityFunctions } from "../../../utils/index";
import { useAsync, useContractCreator } from "../../../hooks";
import FireSalesSale from "../../../contracts/FireSalesSale.json";
import useConnection from "../../../context/connectionContext/useConnection";
import useAppState from "../../../context/appStateContext/useAppState";
import { Countdown } from "../../common/CountdownTimer";
import toast from "react-hot-toast";

export const LaunchPadCard = ({ saleAddress }: { saleAddress: string }) => {
  console.log("saleAddress ", saleAddress);

  const { FireSalesRouterContract } = useContracts();
  const { web3 } = useConnection();
  const { system, minimumAllowed } = useAppState();
  const [saleState, setSaleState] = useState(() => {
    return {
      isPending: true,
      isRunning: false,
      isEnded: false,
      isSuccessful: false,
      isFinalized: false,
      isSuccessfulButNotFinalizedAfterMinWaitTime: false,
      saleStatus: "",
      timeExceedsLimit: false,
    };
  });
  const [saleProgress, setSaleProgress] = useState<{
    amountRaised: number;
    progress: number;
  }>({
    amountRaised: 0,
    progress: 0,
  });

  const presaleContract = useMemo(() => {
    const _presaleContract = useContractCreator(
      web3,
      FireSalesSale,
      saleAddress
    );
    return _presaleContract;
  }, [saleAddress]);

  const sale: { data: any; status: string; error: string } = useAsync(
    () => {
      return async () => {
        const result = await FireSalesRouterContract.methods
          .getSaleByAddress(saleAddress)
          .call();
        const obj = await reformer(result);
        return obj;
      };
    },
    { data: { progress: 0 }, status: "idle", error: "" },
    []
  );

  useEffect(() => {
    // get claimableTokens and liquidityAddress
    if (!presaleContract || !sale.data) return;
    presaleContract.methods
      .amountRaised()
      .call()
      .then((result: any) => {
        const amountRaised: number = parseFloat(
          utilityFunctions().fromWei(result)
        );
        let progress = 0;
        console.log(amountRaised);
        if (sale.data.hardCap) {
          progress = (amountRaised / sale?.data?.hardCap) * 100;
          setSaleProgress((prev) => ({
            ...prev,
            amountRaised,
            progress,
          }));
        }
      });
  }, [presaleContract._address, sale.data]);

  useEffect(() => {
    console.log(presaleContract, "presale contract");
    if (presaleContract._address && sale.data) {
      presaleContract.methods
        .amountRaised()
        .call()
        .then((result: any) => {
          const amountRaised: number = parseInt(
            utilityFunctions().fromWei(result)
          );
          let progress = 0;
          console.log(amountRaised);
          if (sale?.data?.hardCap) {
            progress = (amountRaised / sale?.data?.hardCap) * 100;
            setSaleProgress({
              amountRaised,
              progress,
            });
          }
        });
    }

    return () => {};
  }, [presaleContract, sale.data]);

  useEffect(() => {
    if (sale.data && presaleContract && minimumAllowed) {
      getCurrentState().then((result: any) => {
        console.log(result);
        const [
          isRunning,
          isSuccessful,
          isEnded,
          isFinalized,
          isSuccessfulButNotFinalizedAfterMinWaitTime,
          saleStatus,
          timeExceedsLimit,
        ] = result;
        setSaleState((prev) => ({
          ...prev,
          isRunning,
          isSuccessful,
          isEnded,
          isFinalized,
          isSuccessfulButNotFinalizedAfterMinWaitTime,
          saleStatus,
          timeExceedsLimit,
        }));
      });
    }
  }, [sale.data, presaleContract, minimumAllowed]);

  const getCurrentState = async () => {
    const checkIfSuccessful: any = {
      "0": false,
      "1": true,
    };

    let isSuccessfulNum: string = await presaleContract.methods
      .saleStatus()
      .call();

    let saleIsRunning = (): boolean => {
      if (
        Date.now() >= sale.data.startTime * 1000 &&
        Date.now() <= sale.data.endTime * 1000
      ) {
        return true;
      } else {
        return false;
      }
    };

    let isSuccessful: boolean = checkIfSuccessful[isSuccessfulNum.toString()];

    let isEnded = await presaleContract.methods.isEnded().call();
    const isEndedFunc = () => {
      if (Date.now() > sale.data.endTime * 1000 || isEnded == true) {
        return true;
      } else {
        return false;
      }
    };
    const isFinalized = await presaleContract.methods.isFinalized().call();
    let saleStatus;

    const checkIfTimeExceedsLimit = (): boolean => {
      const now = Date.now() / 1000;
      if (
        now - sale.data.endTime >
        parseInt(minimumAllowed.data.waitTimeBeforeEmergencyWithdraw)
      ) {
        return true;
      } else {
        return false;
      }
    };

    const timeExceedsLimit = checkIfTimeExceedsLimit();

    // console.log(
    //   minimumAllowed,
    //   timeExceedsLimit,
    //   minimumAllowed.data.waitTimeBeforeEmergencyWithdraw
    // );

    const checkIfIsSuccessfulButNotFinalizeAfterSetTime = (): boolean => {
      if (isSuccessful && !isFinalized && timeExceedsLimit) {
        return true;
      } else {
        return false;
      }
    };

    const isSuccessfulButNotFinalizedAfterMinWaitTime: boolean =
      checkIfIsSuccessfulButNotFinalizeAfterSetTime();

    if (saleIsRunning() && !isEndedFunc()) {
      saleStatus = "Active";
    } else if (isEndedFunc() && !isSuccessful) {
      saleStatus = "Failed";
    } else if (isEndedFunc() && isFinalized) {
      saleStatus = "Finalized";
    } else if (isEndedFunc() && timeExceedsLimit) {
      saleStatus = "Failed";
    } else if (isSuccessfulButNotFinalizedAfterMinWaitTime) {
      saleStatus = "Failed";
    } else if (isEndedFunc() && isSuccessful) {
      saleStatus = "Successful";
    } else {
      saleStatus = "Upcoming";
    }

    return [
      saleIsRunning(),
      isSuccessful,
      isEndedFunc(),
      isFinalized,

      isSuccessfulButNotFinalizedAfterMinWaitTime,
      saleStatus,
      timeExceedsLimit,
    ];
  };

  return (
    <Fragment>
      {sale.status === "resolved" && (
        <Card className="launch-card">
          <div className="flex justify-between items-center">
            <Avatar
              alt="LOGO"
              src={sale.data.logoUrl}
              onError={(e: any) =>
                (e.target.src =
                  "data:image/jpeg;base64,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")
              }
            />{" "}
            <Badge
              color={
                saleState.saleStatus === "Upcoming"
                  ? "warn"
                  : saleState.saleStatus === "Active"
                  ? "green"
                  : saleState.saleStatus === "Successful"
                  ? "green"
                  : "secondary"
              }
            >
              {saleState.saleStatus}
            </Badge>
          </div>
          <div className="mt-3">
            <CardHeader>{sale.data.projectName ?? "Pilarin"}</CardHeader>
            <CardSubHeader>${sale.data.tokenSymbol}</CardSubHeader>
            <CardBody>
              <Truncate
                className="opacity-80 "
                text={sale.data.description}
                length={150}
              />
              <div className="mt-10 space-y-2">
                <LaunchInfoText>
                  Soft Cap:{" "}
                  <span>
                    {formatNumber(sale.data.softCap)} {system.currency}
                  </span>
                </LaunchInfoText>
                <LaunchInfoText>
                  Hard Cap:{" "}
                  <span>
                    {formatNumber(sale.data.hardCap)} {system.currency}
                  </span>
                </LaunchInfoText>
                <LaunchInfoText>
                  Price:{" "}
                  <span>
                    1 {system.currency}= {sale.data.presaleRate}{" "}
                    {sale.data.tokenSymbol}
                  </span>
                </LaunchInfoText>
                <LaunchInfoText>
                  Starts In:{" "}
                  <span>
                    {" "}
                    <Countdown eventTime={sale.data.startTime} /> days
                  </span>
                </LaunchInfoText>
                <div className="pb-5">
                  <p className="text-right font-bold my-2">
                    {saleProgress.progress}%
                  </p>
                  <Progress
                    type="line"
                    percent={saleProgress.progress}
                    strokeWidth={2}
                    trailWidth={2}
                  />
                  <div className="flex justify-between font-bold opacity-80 mt-2">
                    <p>
                      {formatNumber(saleProgress.amountRaised) || 0}{" "}
                      {system.currency}
                    </p>
                    <p>
                      {formatNumber(sale.data.hardCap)} {system.currency}
                    </p>
                  </div>
                </div>
                <hr />
                <div className="pt-5">
                  {/* <SecondaryButtƒon className="pointer-events-none" size="small">
                    Requires KYC
                  </SecondaryButtƒon> */}
                </div>
              </div>
            </CardBody>
          </div>
        </Card>
      )}
      {sale.status === "pending" && <LaunchPadLoader />}
    </Fragment>
  );
};
