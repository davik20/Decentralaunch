import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";

import { ClipLoader } from "react-spinners";
import styled from "styled-components";
import saleFuncs from "../../../../apis/sale";
import userFuncs from "../../../../apis/user";
import { Alert } from "../../../../components/common/Alerts";
import { AppModal } from "../../../../components/common/AppModal";
import {
  DangerButton,
  IconButton,
  SecondaryButton,
  WhitePaperButton,
} from "../../../../components/common/Button";

import { Card } from "../../../../components/common/Card";
import {
  Input,
  Label,
  InputContainer,
} from "../../../../components/common/Inputs";
import Connect from "../../../../components/Connect";
import StepForm from "../../../../components/layout/StepForm";
import Step from "../../../../components/layout/StepForm/step";
import Terms from "../../../../components/Terms/Index";
import useAppState from "../../../../context/appStateContext/useAppState";
import useConnection from "../../../../context/connectionContext/useConnection";
import useContracts from "../../../../context/contractContext/useContracts";
import { useSendTransaction } from "../../../../hooks";
import { formatNumber, utilityFunctions } from "../../../../utils";
import addData from "../../../../utils/getIPFS";

import {
  AdditionalInfo,
  DetailsSummary,
  LaunchInfo,
  VerifyToken,
} from "./StepsForms";

export interface FormInputType {
  tokenAddress?: string;
  tokenTotalSupply?: string;
  tokenName?: string;
  decimals: string;
  tokenSymbol?: string;
  userTokenBalance: number;
  totalSupply?: string;
  tokenContract?: any;
  selectedExchangeName?: string;
  selectedExchangeAddresses?: [string];
  endDate?: any;
  startDate?: any;
  hardCap: string;
  softCap: string;
  liquidityLockUp?: any;
  liquidityPercent: string;
  listingRate: string;
  maximumLimit?: string;
  minimumLimit?: string;
  preSaleRate: string;

  projectName?: string;
  description?: string;
  discord?: string;
  facebook?: string;
  github?: string;
  logoUrl?: string;
  reddit?: string;
  telegram?: string;
  twitter?: string;
  updates?: string;
  website?: string;
  totalSellingAmount?: string;
}

const CreateLaunchpad = () => {
  const navigate = useNavigate();
  const { addSale } = saleFuncs();
  const { addSaleToUser } = userFuncs();
  const { system, minimumAllowed } = useAppState();
  const { chainId } = useConnection();
  const [activeStep, setActiveStep] = useState(1);
  const [showContent, setShowContent] = useState(false);
  const [formInput, setFormInput] = useState<FormInputType>({
    softCap: "0",
    userTokenBalance: 0,
    hardCap: "0",
    preSaleRate: "0",
    liquidityPercent: "0",
    listingRate: "0",
    decimals: "0",
  });

  const {
    transactionHelper: createSaleHelper,
    transaction: createSaleTransaction,
  } = useSendTransaction();
  const {
    transactionHelper: approvalHelper,
    transaction: approvalTransaction,
  } = useSendTransaction();

  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [tokens, setTokens] = useState<{
    tokenFee: number;
    tokensForSale: number;
    tokensForLiquidity: number;
    totalTokens: number;
  }>({
    tokenFee: 0,
    tokensForSale: 0,
    tokensForLiquidity: 0,
    totalTokens: 0,
  });
  const { FireSalesRouterContract } = useContracts();
  const { account } = useConnection();

  const moveToNext = () => setActiveStep(activeStep + 1);
  const moveToPrevious = () => {
    setActiveStep(activeStep - 1);
  };
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

  const isMounted = useRef(false);

  useEffect(() => {
    setTimeout(() => {
      toast(
        "For special tokens, please make sure all token fees and burns are switched off for the duration of this presale."
      );
    }, 2000);
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const submitFormData = async () => {
    // Make Http Request With The Complete Form Input
    //This method is called from the details summary page.

    let loading;
    try {
      // loading = toast.loading("Transaction in progress");

      const softCap = utilityFunctions().toWei(formInput?.softCap);
      const hardCap = utilityFunctions().toWei(formInput?.hardCap);
      const min = utilityFunctions().toWei(formInput?.minimumLimit);
      const max = utilityFunctions().toWei(formInput?.maximumLimit);

      // calculate total number of tokens required for the sale

      const percentLiquidity =
        (parseFloat(formInput?.liquidityPercent) / 100) *
        parseFloat(formInput?.hardCap);

      const tokensForSale =
        parseFloat(formInput?.hardCap) * parseFloat(formInput?.preSaleRate);

      const tokensForLiquidity =
        percentLiquidity * parseFloat(formInput?.listingRate);

      // remember to get token fee here
      const tokenFee =
        (parseFloat(minimumAllowed.data.platformTokenPercent) / 100) *
        tokensForSale;

      // exploit check
      const tokenExploitCheck = (1 / 100) * tokensForSale;

      const totalTokens =
        tokensForLiquidity + tokensForSale + tokenFee + tokenExploitCheck;
      console.log(totalTokens);
      setTokens((prev: any) => {
        return {
          tokenFee,
          tokensForSale,
          tokensForLiquidity,
          totalTokens: totalTokens,
        };
      });
      setModalIsOpen(true);

      console.log(formInput);
    } catch (error) {
      console.log(error);
      toast.error("An error occurred");
      toast.dismiss(loading);
    }
  };

  const handleSaleApproval = async () => {
    if (formInput.decimals) {
      const tokensConverted = utilityFunctions().toDecimals(
        tokens.totalTokens,
        formInput.decimals
      );
      try {
        const callBack = () => {
          return formInput.tokenContract.methods
            .approve(
              FireSalesRouterContract._address,
              utilityFunctions().toWei(9007199254740991)
            )
            .send({
              from: account,
            });
        };

        const res = await approvalHelper(callBack);
        if (isMounted.current == true) {
          setIsApproved(true);
        }

        console.log(res);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleSaleCreation = async () => {
    // Make Http Request With The Complete Form Input
    //This method is called from the details summary page.

    let infoHash: any = JSON.stringify({
      projectName: formInput?.projectName,
      description: formInput?.description,
      discord: formInput?.discord,
      facebook: formInput?.facebook,
      github: formInput?.github,
      logoUrl: formInput?.logoUrl,
      reddit: formInput?.reddit,
      telegram: formInput?.telegram,
      twitter: formInput?.twitter,
      updates: formInput?.updates,
      website: formInput?.website,
      tokenDecimals: formInput?.decimals,
      tokensForPresale: tokens.tokensForSale,
      tokensForLiquidity: tokens.tokensForLiquidity,
      tokenSymbol: formInput.tokenSymbol,
      tokenName: formInput.tokenName,
      tokenTotalSupply: formInput.tokenTotalSupply,
      selectedExchangeName: formInput.selectedExchangeName,
    });

    let loading;
    try {
      if (formInput?.userTokenBalance < tokens.totalTokens) {
        return toast.error("Your token balance is not enough");
      }
      const softCap = utilityFunctions().toWei(formInput?.softCap);
      const hardCap = utilityFunctions().toWei(formInput?.hardCap);
      const min = utilityFunctions().toWei(formInput?.minimumLimit);
      const max = utilityFunctions().toWei(formInput?.maximumLimit);
      const presaleRate =
        parseFloat(formInput.preSaleRate) * system.numberDecimals;
      const listingRate =
        parseFloat(formInput.listingRate) * system.numberDecimals;
      if (parseInt(formInput.decimals) === 0) {
        return;
      }

      let event: any;
      const callBack = async () => {
        infoHash = await addData(infoHash);
        console.log("sale hash ", infoHash);
        const toCall = async () => {
          const receipt = await FireSalesRouterContract.methods
            .createSale(
              infoHash,
              formInput?.tokenAddress,
              presaleRate,
              [min, max],
              [
                softCap,
                hardCap,
                utilityFunctions().toDecimals(
                  tokens.totalTokens,
                  formInput.decimals
                ),
              ],
              [formInput?.startDate, formInput?.endDate],
              formInput?.liquidityLockUp,
              listingRate,
              formInput?.liquidityPercent,
              formInput?.decimals,
              formInput.selectedExchangeAddresses
            )
            .send({
              from: account,
              value: utilityFunctions().toWei(minimumAllowed.data.platformFee),
            });
          event = receipt.events.SaleCreated;
          // await addSale(
          //   account,
          //   event.returnValues.newSaleAddress,
          //   formInput.projectName,
          //   formInput.tokenAddress,
          //   formInput.preSaleRate,
          //   formInput.listingRate,
          //   tokens.tokensForSale,
          //   tokens.tokensForLiquidity,
          //   infoHash,
          //   chainId,
          //   formInput.softCap,
          //   formInput.hardCap,
          //   formInput.liquidityLockUp,
          //   formInput.liquidityPercent,
          //   formInput.minimumLimit,
          //   formInput.maximumLimit
          // );
          // await addSaleToUser(account, {
          //   saleName: formInput.projectName,
          //   saleAddress: event.returnValues.newSaleAddress,
          // });
        };
        return toCall();
      };

      const res = await createSaleHelper(callBack);

      console.log(res);
      navigate("/app/launchpad/lists/" + event.returnValues.newSaleAddress);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Terms showContent={showContent} setShowContent={setShowContent} />
      {showContent && (
        <div>
          <div className="py-10">
            <h3 className="font-bold text-3xl">Create Launchpad</h3>
          </div>
          {!account && <Connect />}
          <AppModal modalIsOpen={modalIsOpen} closeModal={() => ""}>
            <div>
              <ModalTitle>
                <h1>Review</h1>
              </ModalTitle>
              <ModalHeader>
                <h1>
                  Review your details below then press submit to create your
                  presale on DecentraLaunch Platform! Or go back to edit the
                  information.
                  <p>
                    <span>Warning:</span> This information cannot be changed
                    after sale creation!
                  </p>
                </h1>
              </ModalHeader>
              <ModalBody>
                <span>Note:</span> You will need atleast{" "}
                <span>
                  {formatNumber(tokens.totalTokens)} {formInput.tokenSymbol}{" "}
                  tokens
                </span>{" "}
                ({formatNumber(tokens.tokensForSale)} for Presale,{" "}
                {formatNumber(tokens.tokensForLiquidity)} for{" "}
                {formInput.selectedExchangeName} Listing and {tokens.tokenFee}{" "}
                for platform fees and an extra 1% to avoid issues due to fees or
                exploits) in your wallet to start this sale.
              </ModalBody>
              <ModalFooter>
                <DangerButton
                  onClick={() => {
                    setIsApproved(false);
                    setModalIsOpen(false);
                  }}
                  style={{ marginRight: "2rem" }}
                >
                  Go back
                </DangerButton>
                {!isApproved && (
                  <PrimaryButton onClick={() => handleSaleApproval()}>
                    {approvalTransaction.status === "pending" ? (
                      <ClipLoader color="white" />
                    ) : (
                      "Approve"
                    )}
                  </PrimaryButton>
                )}
                {isApproved && (
                  <PrimaryButton onClick={() => handleSaleCreation()}>
                    {createSaleTransaction.status === "pending" ? (
                      <ClipLoader color="white" />
                    ) : (
                      "Transfer Tokens"
                    )}
                  </PrimaryButton>
                )}
              </ModalFooter>
            </div>
          </AppModal>
          {account && (
            <StepForm activeStep={activeStep}>
              <Step label="Verify Token" icon={<i className="las la-flag"></i>}>
                <VerifyToken
                  moveToNext={moveToNext}
                  sendFormData={(verifyData) =>
                    setFormInput((prevState) => ({
                      ...prevState,
                      ...verifyData,
                    }))
                  }
                />
              </Step>
              <Step
                label="Launchpad Information"
                icon={<i className="las la-rocket"></i>}
              >
                <LaunchInfo
                  moveToNext={moveToNext}
                  moveToPrevious={moveToPrevious}
                  sendFormData={(launchData) => {
                    console.log(launchData);
                    setFormInput((prev: any) => {
                      return {
                        ...prev,
                        ...launchData,
                      };
                    });
                    // setFormInput((prevState) => ({ ...prevState, ...launchData }));
                  }}
                />
              </Step>
              <Step
                label="Additional Information"
                icon={<i className="las la-building"></i>}
              >
                <AdditionalInfo
                  moveToNext={moveToNext}
                  moveToPrevious={moveToPrevious}
                  sendFormData={(additionalData) =>
                    setFormInput((prevState) => ({
                      ...prevState,
                      ...additionalData,
                    }))
                  }
                />
              </Step>
              <Step
                label="Review Details"
                icon={<i className="las la-check"></i>}
              >
                <DetailsSummary
                  formInput={formInput}
                  submitFormData={submitFormData}
                  moveToPrevious={moveToPrevious}
                />
              </Step>
            </StepForm>
          )}
        </div>
      )}
    </>
  );
};

export default CreateLaunchpad;

interface IButton {
  className?: string;
  size?: "small" | "medium" | "large";
}

export const PrimaryButton = styled.button.attrs<IButton>(() => ({
  className: `flex justify-center items-center shadow-md`,
}))<IButton>`
  background: ${(props) => props.theme.colors.primaryBlue};
  min-width: ${(props) =>
    props.size === "small"
      ? "100px"
      : props.size === "medium"
      ? "120px"
      : "150px"};
  color: #ffffff;
  border: 2px solid ${(props) => props.theme.colors.primaryBlue};
  border-radius: 7px;
  padding: ${(props) =>
    props.size === "small"
      ? "8px 10px"
      : props.size === "large"
      ? "12px 14px"
      : "10px 12px"};
  font-weight: bold;
  transition: all 0.3s ease;
  display: inline-block;
  outline: none;
  font-size: ${(props) =>
    props.size === "small"
      ? "0.8rem"
      : props.size === "large"
      ? "1.5rem"
      : "1rem"};

  &:disabled {
    cursor: wait;
  }
`;

const ModalTitle = styled.div`
  > h1 {
    font-size: 30px;
    text-align: center;
    font-weight: bold;
  }
`;
const ModalHeader = styled.div`
  padding-top: 1rem;
  > h1 {
    font-size: 18px;
    color: ${(props) => props.theme.colors.primaryText};
    text-align: center;
    font-weight: bold;
    > p {
      display: block;

      > span {
        color: ${(props) => props.theme.colors.primaryRed};
      }
    }
  }
`;

const ModalBody = styled.p`
  margin-top: 2rem;
  text-align: center;
  > span {
    color: ${(props) => props.theme.colors.primaryRed};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3.5rem;
  display: flex;
`;
