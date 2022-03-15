import React, { useState, useRef, useEffect } from "react";
import { Card } from "../../../../../components/common/Card";
import {
  Input,
  InputContainer,
  InputError,
  Label,
} from "../../../../../components/common/Inputs";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  PrimaryButton,
  SafeButton,
} from "../../../../../components/common/Button";
import toast from "react-hot-toast";

import useConnection from "../../../../../context/connectionContext/useConnection";
import { utilityFunctions } from "../../../../../utils";
import useTransaction from "../../../../../context/transactionContext/useTransaction";
import { useSendTransaction } from "../../../../../hooks";
import useContracts from "../../../../../context/contractContext/useContracts";

const validationSchema = Yup.object().shape({
  tokenAddress: Yup.string()
    .length(42)
    .required("Address is required")
    .label("Token Address"),
});
const formOptions = { resolver: yupResolver(validationSchema) };

export const VerifyToken = ({
  moveToNext,
  sendFormData,
}: {
  moveToNext: () => void;
  sendFormData: (data: any) => void;
}) => {
  const { web3, account } = useConnection();

  const isMounted = useRef(false);
  const { TestTokenJson: ERC20 } = useContracts();
  const { sendTransaction } = useTransaction();

  const { connectWallet } = useConnection();
  const { register, handleSubmit, setError, formState } = useForm(formOptions);
  const { errors } = formState;
  const [tokenMetaData, setTokenMetaData] = useState<{
    balance: number;
    name?: string;
    symbol?: string;
    decimals?: string;
  }>({
    name: "",
    symbol: "",
    balance: 0,
    decimals: "",
  });

  const handleTokenValidation: SubmitHandler<any> = async (value) => {
    try {
      if (!account) {
        // toast.error("Please connect your wallet");
        connectWallet();
        return;
      }

      if (
        !tokenMetaData.decimals ||
        !tokenMetaData.name ||
        !tokenMetaData.symbol
      ) {
        return;
      }

      // check blockchain to see if token exists
      const tokenContract = new web3.eth.Contract(
        ERC20.abi,
        value.tokenAddress.trim()
      );

      const balanceWei = await tokenContract.methods.balanceOf(account).call();

      const balance = utilityFunctions().fromDecimals(
        balanceWei,
        tokenMetaData.decimals
      );

      const totalSupplyWei = await tokenContract.methods.totalSupply().call();
      const totalSupply = utilityFunctions().fromDecimals(
        totalSupplyWei,
        tokenMetaData.decimals
      );
      const result = {
        ...value,
        userTokenBalance: balance,
        tokenName: tokenMetaData.name,
        tokenSymbol: tokenMetaData.symbol,
        decimals: tokenMetaData.decimals,
        tokenTotalSupply: totalSupply,
        tokenContract,
      };
      sendFormData(result);

      moveToNext();
    } catch (error) {
      console.log(error);
      toast.error("Input a valid token address");
    }
  };

  const getTokenMetaData = async (tokenAddress: string) => {
    if (tokenAddress.trim().length === 42) {
      if (!web3.utils.isAddress(tokenAddress.trim())) {
        return toast.error("Invalid token address");
      }
      try {
        const tokenContract = new web3.eth.Contract(
          ERC20.abi,
          tokenAddress.toUpperCase()
        );

        console.log(tokenContract);
        const name = await tokenContract.methods.name().call();
        const symbol = await tokenContract.methods.symbol().call();

        const decimals = await tokenContract.methods.decimals().call();
        console.log(name, symbol, decimals);
        let balance = "0";
        if (account) {
          const balanceWei = await tokenContract.methods
            .balanceOf(account)
            .call();
          balance = utilityFunctions().fromDecimals(balanceWei, decimals);
        }

        setTokenMetaData((prev: any) => ({
          ...prev,
          decimals,
          name,
          symbol,
          balance: parseInt(balance),
        }));
      } catch (error) {
        console.log(error);
        setTokenMetaData({
          decimals: "",
          name: "",
          symbol: "",
          balance: 0,
        });

        return toast.error("Invalid token address");
      }
    } else {
      setTokenMetaData({
        decimals: "",
        name: "",
        symbol: "",
        balance: 0,
      });
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(handleTokenValidation)}>
        <InputContainer>
          <Label htmlFor="tokenAddress">Token Address</Label>
          <Input
            placeholder="Ex. 0x81507617417b71fC2d231F187bE4Bd919e572761"
            type="text"
            {...register("tokenAddress")}
            onChange={(e: any) => {
              getTokenMetaData(e.target.value);
            }}
            name="tokenAddress"
          />
          <InputError>{errors.tokenAddress?.message}</InputError>
        </InputContainer>
        {tokenMetaData.symbol && tokenMetaData.name && (
          <>
            {" "}
            <InputContainer>
              <Label htmlFor="tokenAddress">Token Name</Label>
              <Input
                disabled
                placeholder=""
                type="text"
                value={tokenMetaData.name}
              />
            </InputContainer>
            <InputContainer>
              <Label htmlFor="tokenAddress">Token Symbol</Label>
              <Input
                disabled
                placeholder=""
                type="text"
                value={tokenMetaData.symbol}
              />
            </InputContainer>
            <InputContainer>
              <Label htmlFor="tokenAddress">Decimals</Label>
              <Input
                disabled
                placeholder=""
                type="text"
                value={tokenMetaData.decimals}
              />
            </InputContainer>
          </>
        )}

        <InputContainer className="text-right">
          <SafeButton
            Button={PrimaryButton}
            text="Next"
            buttonProps={{ size: "small", type: "submit" }}
            callBack={() => ""}
          />
        </InputContainer>
      </form>
    </Card>
  );
};
