import moment from "moment";
import React, { Fragment, useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router";
import { Avatar } from "../../../../components/common/Avatar";
import { Badge } from "../../../../components/common/Badge";
import { PrimaryButton } from "../../../../components/common/Button";
import { Card, CardHeader } from "../../../../components/common/Card";
import { Countdown } from "../../../../components/common/CountdownTimer";
import { SocialIcons } from "../../../../components/common/Icons";
import {
  Input,
  InputContainer,
  InputHint,
} from "../../../../components/common/Inputs";
import { Progress } from "../../../../components/common/Progress";
import { LaunchInfoText } from "../../../../components/layout/LaunchComponent";
import { ChartJs } from "../../../../components/layout/LaunchComponent/Chart";
import useConnection from "../../../../context/connectionContext/useConnection";
import useContracts from "../../../../context/contractContext/useContracts";
import {
  useAsync,
  useContractCreator,
  useSendTransaction,
} from "../../../../hooks";
import { formatNumber, reformer, utilityFunctions } from "../../../../utils";
import { lists, ListsType } from "./demo-data";
import { saleObj } from "./types";
import FireSalesSale from "../../../../contracts/FireSalesSale.json";
import toast from "react-hot-toast";

import { Poll } from "@mui/icons-material";
import useAppState from "../../../../context/appStateContext/useAppState";
import Terms from "../../../../components/Terms/Index";
import Connect from "../../../../components/Connect";
import { useApptheme } from "../../../../components/AppThemeProvider";
import saleFuncs from "../../../../apis/sale";

const LaunchPadDetails = () => {
  const { addBuyToSale } = saleFuncs();
  const params = useParams();
  const [poolAmount, setPoolAmount] = useState("");
  const { themeMode } = useApptheme();
  const { FireSalesRouterContract } = useContracts();
  const { connectWallet, web3, account, chainIdError } = useConnection();
  const { system, minimumAllowed } = useAppState();
  const [showContent, setShowContent] = useState(false);
  const [lockedLiquidityAddress, setLockedLiqudityAddress] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

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
    tokensClaimable: number;
    bnbClaimable: number;
  }>({
    amountRaised: 0,
    progress: 0,
    tokensClaimable: 0,
    bnbClaimable: 0,
  });

  const {
    transactionHelper: buyTransactionHelper,
    transaction: buyTransaction,
  } = useSendTransaction();
  const {
    transactionHelper: claimTransactionHelper,
    transaction: claimTransaction,
  } = useSendTransaction();
  const {
    transactionHelper: finalizeTransactionHelper,
    transaction: finalizeTransaction,
  } = useSendTransaction();
  const {
    transactionHelper: emergencyWithdrawTransactionHelper,
    transaction: emergencyWithdrawTransaction,
  } = useSendTransaction();

  const isMounted = useRef(false);
  const startInterval = useRef<any>(null);
  const endInterval = useRef<any>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (startInterval.current) {
        clearInterval(startInterval.current);
      }
      if (endInterval.current) {
        clearInterval(endInterval.current);
      }
    };
  }, []);

  let pool: { data: saleObj; status: string; error: string } = useAsync(
    () => {
      if (params && params.id) {
        const id = params.id;
        if (id.trim().length === 42) {
          return async () => {
            const result = await FireSalesRouterContract.methods
              .getSaleByAddress(id)
              .call();
            const obj = await reformer(result);
            console.log(obj);
            return obj;
          };
        } else {
          return async () => {
            const result = await FireSalesRouterContract.methods
              .getSaleByIndex(id)
              .call();
            const obj = await reformer(result);
            console.log(obj);
            return obj;
          };
        }
      }
    },
    { data: { progress: 0, presaleRate: "0" }, status: "idle", error: "" },
    [params]
  );

  const presaleContract = useMemo(() => {
    const _presaleContract = useContractCreator(
      web3,
      FireSalesSale,
      pool?.data?.presaleAddress
    );
    return _presaleContract;
  }, [pool?.data?.presaleAddress]);

  useEffect(() => {
    if (
      presaleContract._address &&
      pool.data &&
      minimumAllowed.status === "resolved"
    ) {
      // subscribe to events
      presaleContract.events
        .TokensBought()
        .on("connected", function (subscriptionId: any) {
          console.log(subscriptionId);
        })
        .on("data", function (event: any) {
          let progress = 0;
          const amountRaised = parseFloat(
            utilityFunctions().fromWei(event.returnValues.amountRaised)
          );
          const tokensClaimable = parseFloat(
            utilityFunctions().fromWei(event.returnValues.tokensClaimable)
          );

          if (pool.data.hardCap) {
            progress = (amountRaised / pool?.data?.hardCap) * 100;
            setSaleProgress((prev: any) => {
              return {
                ...prev,
                progress,
                amountRaised,
                tokensClaimable,
              };
            });
          }
        });

      // get amount raised and consequently progress of the sale
      presaleContract.methods
        .amountRaised()
        .call()
        .then((result: any) => {
          const amountRaised: number = parseFloat(
            utilityFunctions().fromWei(result)
          );
          let progress = 0;
          console.log(amountRaised);
          if (pool.data.hardCap) {
            progress = (amountRaised / pool?.data?.hardCap) * 100;
            setSaleProgress((prev) => ({
              ...prev,
              amountRaised,
              progress,
            }));
          }
        });

      updateState();
    }

    return () => {};
  }, [presaleContract, pool.data, minimumAllowed]);

  useEffect(() => {
    // get claimableTokens and liquidityAddress
    updateUI();
  }, [account, presaleContract._address, pool.data]);

  const updateUI = () => {
    if (account && presaleContract._address && pool.status === "resolved") {
      presaleContract.methods
        .ClaimableTokens(account)
        .call()
        .then((result: any) => {
          const claimableTokens: number = parseFloat(
            utilityFunctions().fromDecimals(result, pool.data.tokenDecimals)
          );
          setSaleProgress((prev) => ({
            ...prev,
            tokensClaimable: claimableTokens,
          }));
        });
      presaleContract.methods
        .ClaimableBNB(account)
        .call()
        .then((result: any) => {
          const claimableTokens: number = parseFloat(
            utilityFunctions().fromWei(result)
          );
          setSaleProgress((prev) => ({
            ...prev,
            bnbClaimable: claimableTokens,
          }));
        });
      presaleContract.methods
        .lockedLiquidityaddress()
        .call()
        .then((result: any) => {
          setLockedLiqudityAddress(result);
        });
    }
  };

  const updateState = () => {
    getCurrentState().then((result: any) => {
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
    setTimeout(() => {
      updateState();
    }, 1000);
  };

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
        Date.now() >= pool.data.startTime * 1000 &&
        Date.now() <= pool.data.endTime * 1000
      ) {
        return true;
      } else {
        return false;
      }
    };

    let isSuccessful: boolean = checkIfSuccessful[isSuccessfulNum.toString()];

    let isEnded = await presaleContract.methods.isEnded().call();
    const isEndedFunc = () => {
      if (Date.now() > pool.data.endTime * 1000 || isEnded == true) {
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
        now - pool.data.endTime >
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

  const handleBuy = async () => {
    if (!poolAmount) {
      return toast("Input a value");
    }
    if (!saleState.isRunning) {
      toast.error("Presale is not active");
      return;
    }
    if (account) {
      try {
        const callBack = async () => {
          return presaleContract.methods.buy().send({
            value: utilityFunctions().toWei(poolAmount),
            from: account,
          });
        };
        const result = await buyTransactionHelper(callBack);
        await addBuyToSale(
          pool.data.presaleAddress,
          account,
          poolAmount,
          system.currency
        );
        console.log(result);
        updateUI();
      } catch (error) {
        console.log(error);
      }
    } else {
      toast.error("Connect your wallet to participate");
    }
  };

  const handleFinalize = async () => {
    if (account) {
      try {
        const callBack = async () => {
          return presaleContract.methods.finalize().send({ from: account });
        };
        const result = claimTransactionHelper(
          callBack,
          "Finalizing presale",
          "Presale has been finalized successfully"
        );
        updateUI();
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    } else {
      toast.error("Connect your wallet to participate");
    }
  };
  const handleClaim = async () => {
    if (account) {
      try {
        const callBack = async () => {
          return presaleContract.methods.claim().send({ from: account });
        };
        const result = await claimTransactionHelper(
          callBack,
          "Claiming in progress",
          "Claiming successful"
        );
        console.log(result);
        setSaleProgress((prev) => ({
          ...prev,
          tokensClaimable: 0,
        }));
        updateUI();
      } catch (error) {
        console.log(error);
      }
    } else {
      toast.error("Connect your wallet to participate");
    }
  };
  const handleWithdrawTokens = async () => {
    if (account) {
      try {
        const callBack = async () => {
          return presaleContract.methods.claim().send({ from: account });
        };
        const result = claimTransactionHelper(
          callBack,
          "Claiming in progress",
          "Claiming successful"
        );
        console.log(result);
        setSaleProgress((prev) => ({
          ...prev,
          tokensClaimable: 0,
        }));
      } catch (error) {
        console.log(error);
      }
    } else {
      toast.error("Connect your wallet to participate");
    }
  };

  const handleEmergencyWithdrawBNB = async () => {
    if (account) {
      try {
        const callBack = async () => {
          return presaleContract.methods
            .emergencyWithdraw()
            .send({ from: account });
        };
        const result = await claimTransactionHelper(
          callBack,
          "Withdrawal in progress",
          "Withdrawal successful"
        );
        console.log(result);
        setSaleProgress((prev) => ({
          ...prev,
          tokensClaimable: 0,
        }));
        updateUI();
      } catch (error) {
        console.log(error);
      }
    } else {
      toast.error("Connect your wallet to participate");
    }
  };

  if (pool.error) {
    console.log(pool.error);
    return (
      <div
        style={{ textAlign: "center", marginTop: "2rem", fontSize: "1.5rem" }}
      >
        {" "}
        Pool does not exist
      </div>
    );
  }

  return (
    <>
      <Terms showContent={showContent} setShowContent={setShowContent} />
      {(!account || chainIdError) && showContent && <Connect />}

      {showContent && account && !chainIdError && (
        <Fragment>
          {pool.status === "resolved" && (
            <div className="flex flex-col md:flex-row space-y-5 md:space-y-0 space-x-0 md:space-x-5 pt-16 relative">
              <Card
                style={{ height: "fit-content" }}
                className="w-full md:w-1/3 md:sticky md:top-1"
              >
                <div className="flex justify-between items-center">
                  <div className="pb-8">
                    {/* <Badge size="1.3rem" color="primary">
                      ${pool.data.tokenSymbol}
                    </Badge> */}
                  </div>
                </div>

                {saleState.isEnded ? (
                  <div className="text-center pb-5">Presale Ended</div>
                ) : saleState.saleStatus.toLowerCase() === "upcoming" ? (
                  <div className="text-center pb-5">
                    PreSale starts in{" "}
                    <Countdown eventTime={pool.data.startTime} />
                  </div>
                ) : (
                  <div className="text-center pb-5">
                    Presale ending in{" "}
                    <Countdown eventTime={pool.data.endTime} />
                  </div>
                )}
                <div className="mb-8">
                  <Progress type="line" percent={saleProgress.progress} />
                  <div className="flex justify-between">
                    <p>
                      {formatNumber(saleProgress.amountRaised) || 0}{" "}
                      {system.currency}
                    </p>
                    <p>
                      {formatNumber(pool.data.hardCap)} {system.currency}
                    </p>
                  </div>
                </div>
                <InputContainer>
                  <Input
                    required
                    name="poolAmount"
                    type="number"
                    onChange={(e) => setPoolAmount(e.target.value)}
                    placeholder={`1 ${system.currency} = ${pool.data.presaleRate} ${pool.data.tokenSymbol}`}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <InputHint style={{ marginTop: "0.9rem" }}>
                      Soft Cap :{" "}
                      <span style={{ color: themeMode.colors.primaryText }}>
                        {pool?.data?.softCap} {system.currency}
                      </span>{" "}
                      | Hard Cap:{" "}
                      <span style={{ color: themeMode.colors.primaryText }}>
                        {pool.data.hardCap} {system.currency}
                      </span>
                    </InputHint>
                    <InputHint
                      style={{ marginTop: "0.5rem", marginBottom: "1.3rem" }}
                    >
                      Min Buy:
                      <span style={{ color: themeMode.colors.primaryText }}>
                        {" "}
                        {pool?.data?.minBuy} {system.currency}
                      </span>
                      | Max Buy:{" "}
                      <span style={{ color: themeMode.colors.primaryText }}>
                        {pool.data.maxBuy} {system.currency}
                      </span>
                    </InputHint>
                  </div>
                </InputContainer>
                {!account && (
                  <InputContainer className="text-right mb-5">
                    <PrimaryButton onClick={() => connectWallet()}>
                      Connect Wallet
                    </PrimaryButton>
                  </InputContainer>
                )}
                {account &&
                  pool.data.saleCreator?.toLowerCase() !==
                    account?.toLowerCase() && (
                    <InputContainer className="text-right mb-5">
                      {saleState.isRunning && !saleState.isEnded && (
                        <PrimaryButton onClick={() => handleBuy()}>
                          Buy
                        </PrimaryButton>
                      )}
                      {saleState.isEnded &&
                        saleState.saleStatus != "Failed" &&
                        !saleState.isFinalized &&
                        !saleState.timeExceedsLimit && (
                          <PrimaryButton
                            onClick={() =>
                              toast.error("Wait for sale to be finalized")
                            }
                            style={{ color: "gray" }}
                          >
                            <span
                              style={{
                                fontWeight: "100",
                                fontSize: ".8rem",
                                marginLeft: ".8rem",
                              }}
                            >
                              <span
                                style={{ fontSize: "1rem", fontWeight: "bold" }}
                              >
                                Claim:{" "}
                              </span>{" "}
                              {formatNumber(saleProgress.tokensClaimable)}{" "}
                              {pool.data.tokenSymbol}{" "}
                            </span>
                          </PrimaryButton>
                        )}
                      {saleState.isFinalized && !saleState.timeExceedsLimit && (
                        <PrimaryButton onClick={() => handleClaim()}>
                          Claim
                          <span
                            style={{
                              fontWeight: "100",
                              fontSize: ".8rem",
                              marginLeft: ".8rem",
                            }}
                          >
                            {pool.data.tokenSymbol}{" "}
                            {saleProgress.tokensClaimable}
                          </span>
                        </PrimaryButton>
                      )}
                      {saleState.isEnded && !saleState.isSuccessful && (
                        <PrimaryButton
                          onClick={() => handleEmergencyWithdrawBNB()}
                        >
                          Emergency Withdraw
                          <span
                            style={{
                              fontWeight: "100",
                              fontSize: ".8rem",
                              marginLeft: ".8rem",
                            }}
                          ></span>
                        </PrimaryButton>
                      )}
                      {saleState.isSuccessfulButNotFinalizedAfterMinWaitTime && (
                        <PrimaryButton
                          onClick={() => handleEmergencyWithdrawBNB()}
                        >
                          Emergency Withdraw
                          <span
                            style={{
                              fontWeight: "100",
                              fontSize: ".8rem",
                              marginLeft: ".8rem",
                            }}
                          ></span>
                        </PrimaryButton>
                      )}
                    </InputContainer>
                  )}
                {pool.data.saleCreator?.toLowerCase() ===
                  account?.toLowerCase() && (
                  <InputContainer className="text-right mb-5">
                    {saleState.isRunning && !saleState.isEnded && (
                      <PrimaryButton onClick={() => handleBuy()}>
                        Buy
                      </PrimaryButton>
                    )}
                    {saleState.isSuccessful &&
                      !saleState.isFinalized &&
                      !saleState.timeExceedsLimit && (
                        <PrimaryButton onClick={() => handleFinalize()}>
                          Finalize
                        </PrimaryButton>
                      )}
                    {saleState.isEnded && !saleState.isSuccessful && (
                      <>
                        {/* <PrimaryButton onClick={() => handleWithdrawTokens()}>
                          Withdraw Tokens
                        </PrimaryButton> */}
                        {/* <PrimaryButton
                          onClick={() => handleEmergencyWithdrawBNB()}
                        >
                          Emergency Withdraw
                          <span
                            style={{
                              fontWeight: "100",
                              fontSize: ".8rem",
                              marginLeft: ".8rem",
                            }}
                          ></span>
                        </PrimaryButton> */}
                      </>
                    )}
                    {saleState.isSuccessfulButNotFinalizedAfterMinWaitTime && (
                      <>
                        {/* <PrimaryButton onClick={() => handleWithdrawTokens()}>
                          Withdraw Tokens
                        </PrimaryButton> */}
                      </>
                    )}
                  </InputContainer>
                )}
                {saleState.isFinalized && lockedLiquidityAddress && (
                  <InputContainer className="text-right">
                    <PrimaryButton
                      onClick={() =>
                        navigate(`/app/token-lockers/${lockedLiquidityAddress}`)
                      }
                    >
                      View Locked Liquidity
                    </PrimaryButton>{" "}
                  </InputContainer>
                )}
                {saleProgress.bnbClaimable > 0 && (
                  <div className="text-right">
                    <Badge color="green">
                      Amount Contributed: {saleProgress.bnbClaimable}{" "}
                      {system.currency}
                    </Badge>
                  </div>
                )}
              </Card>
              <div className="w-full md:w-2/3">
                <Card style={{ position: "relative" }}>
                  {/* <div
                    onClick={() => toast.success("Sale link copied")}
                    style={{
                      position: "absolute",
                      right: ".3rem",
                      top: ".1rem",
                    }}
                  >
                    <SocialIcons>
                      <i className="las la-external-link-alt sm"></i>
                    </SocialIcons>
                  </div> */}
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Avatar
                        src={pool.data?.logoUrl}
                        alt={pool.data?.tokenName}
                        onError={(e: any) =>
                          (e.target.src =
                            "data:image/jpeg;base64,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")
                        }
                      />
                      <CardHeader>{pool.data?.projectName}</CardHeader>
                    </div>
                    <div>
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
                  </div>
                  {/* Description */}
                  <div className="py-4">
                    <p className="opacity-80">{pool.data.description}</p>
                    <div className="flex space-x-2 pt-4">
                      {pool.data.facebook && (
                        <SocialIcons
                          href={"https://" + pool.data.facebook}
                          target="_blank"
                        >
                          <i className="lab la-facebook"></i>
                        </SocialIcons>
                      )}
                      {pool.data.twitter && (
                        <SocialIcons href={"https://" + pool.data.twitter}>
                          <i className="lab la-twitter"></i>
                        </SocialIcons>
                      )}
                      {pool.data.telegram && (
                        <SocialIcons href={"https://" + pool.data.telegram}>
                          <i className="lab la-telegram"></i>
                        </SocialIcons>
                      )}
                      {pool.data.website && (
                        <SocialIcons href={"https://" + pool.data.website}>
                          <i className="las la-link"></i>
                        </SocialIcons>
                      )}
                      {pool.data.github && (
                        <SocialIcons href={"https://" + pool.data.github}>
                          <i className="lab la-github"></i>
                        </SocialIcons>
                      )}
                      {pool.data.reddit && (
                        <SocialIcons href={"https://" + pool.data.reddit}>
                          <i className="lab la-reddit"></i>
                        </SocialIcons>
                      )}
                    </div>
                  </div>
                  <div className="pt-8">
                    <hr />
                    <CardHeader className="py-2">Pool Details</CardHeader>
                    <hr />
                    <div className="space-y-5 pt-8">
                      <LaunchInfoText>
                        PreSale Address: <span>{pool.data.presaleAddress}</span>
                      </LaunchInfoText>
                      <LaunchInfoText>
                        Token Address: <span>{pool.data.tokenAddress}</span>
                      </LaunchInfoText>
                      <LaunchInfoText>
                        Token Name: <span>{pool.data.tokenName}</span>
                      </LaunchInfoText>

                      <LaunchInfoText>
                        Token Symbol: <span>{pool.data.tokenSymbol}</span>
                      </LaunchInfoText>

                      <LaunchInfoText>
                        Token Decimal: <span>{pool.data.tokenDecimals}</span>
                      </LaunchInfoText>
                      <LaunchInfoText>
                        Total Supply:{" "}
                        <span>{formatNumber(pool.data.tokenTotalSupply)}</span>
                      </LaunchInfoText>
                      <LaunchInfoText>
                        Tokens For Presale:{" "}
                        <span>{formatNumber(pool.data.tokensForPresale)}</span>
                      </LaunchInfoText>
                      <LaunchInfoText>
                        Soft Cap:{" "}
                        <span>
                          {formatNumber(pool.data.softCap)} {system.currency}
                        </span>
                      </LaunchInfoText>
                      <LaunchInfoText>
                        Hard Cap:{" "}
                        <span>
                          {formatNumber(pool.data.hardCap)} {system.currency}
                        </span>
                      </LaunchInfoText>
                    </div>
                  </div>
                </Card>
                <Card className="mt-5">
                  <CardHeader>Metrics</CardHeader>
                  <div className="pt-8">
                    <ChartJs poolDetails={pool.data} />
                  </div>
                </Card>
              </div>
            </div>
          )}
        </Fragment>
      )}
    </>
  );
};

export default LaunchPadDetails;
