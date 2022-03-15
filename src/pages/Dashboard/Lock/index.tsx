import React, { useState, useEffect, useRef } from "react";
import { PrimaryButton, SafeButton } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import {
  Input,
  Label,
  InputContainer,
  InputError,
} from "../../../components/common/Inputs";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { DateTimePicker } from "../../../components/common/DateTimePicker";
import { successToast } from "../../../components/common/NotificationToast";
import { Badge } from "../../../components/common/Badge";
import { Alert } from "../../../components/common/Alerts";
import useContracts from "../../../context/contractContext/useContracts";
import useConnection from "../../../context/connectionContext/useConnection";
import toast from "react-hot-toast";
import addData, { formatNumber, utilityFunctions } from "../../../utils";
import { AppModal } from "../../../components/common/AppModal";
import UniswapV2Pair from "@uniswap/v2-core/build/UniswapV2Pair.json";
import {
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import { useApptheme } from "../../../components/AppThemeProvider";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { Box } from "@mui/system";
import {
  AccountBalanceWallet,
  AttachMoney,
  DonutLarge,
  KeyRounded,
  Lock,
} from "@mui/icons-material";
import { useSendTransaction } from "../../../hooks";
import { ClipLoader } from "react-spinners";
import { Spinner } from "../../../components/common/Spinner";
import AppSelect from "../../../components/common/AppSelect";
import App from "../../../App";
import Terms from "../../../components/Terms/Index";
import Connect from "../../../components/Connect";
import NumberFormat from "react-number-format";
import { useNavigate } from "react-router";

type TokenData = {
  tokenAddress?: string;
  token?: any;
  amount: number;
  lockTimeS?: number;
  decimals: string;
  balance: number;
  symbol?: string;
  tokenName?: string;
  totalSupply: number;
  lockAmount?: number;
  unlockDate?: string;
};

const tokenTypes = [
  { value: "token", label: "Token" },
  { value: "liquidity", label: "Liquidity" },
];
const validationSchema = Yup.object().shape({
  tokenAddress: Yup.string()
    .required("Token address is required")
    .length(42)
    .label("Token Address"),
  amount: Yup.string().required("Amount of token is required"),
  lockTime: Yup.date()
    .required("Start date is required.")
    .min(new Date(), "Lock time cannot be in the past"),
});
const formOptions = { resolver: yupResolver(validationSchema) };

const LockToken = () => {
  const { register, handleSubmit, setError, formState, control } =
    useForm(formOptions);
  const { TestTokenJson: ERC20, FireSalesLockerContract } = useContracts();
  const { web3, account, chainIdError } = useConnection();
  const { errors } = formState;
  const [loadingToken, setLoadingToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenData, setTokenData] = useState<TokenData>({
    decimals: "",
    balance: 0,
    amount: 0,
    totalSupply: 0,
  });
  const addressInputRef: any = useRef();
  const [selectedTokenType, setSelectedTokenType] = useState(tokenTypes[0]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { themeMode: theme } = useApptheme();

  const {
    transactionHelper: approvalHelper,
    transaction: approvalTransaction,
  } = useSendTransaction();

  const { transactionHelper: lockHelper, transaction: lockTransaction } =
    useSendTransaction();

  console.log(theme);

  const handleInput = (e: any) => {
    setTokenAddress(e.target.value);
    if (e.target.value.trim().length == 42) {
      console.log(e);
    }
  };

  const handleForm: SubmitHandler<any> = async (value) => {
    if (!account) return;

    // get values
    let { lockTime, amount, tokenAddress } = value;

    // validations
    if (Number.isNaN(parseInt(amount)))
      return toast.error("Insert a valid number");
    let lockTimeMs = new Date(lockTime).getTime();
    let lockTimeS = lockTimeMs / 1000;
    amount = parseInt(amount);

    // create new contract instance with tokenAddress and get details
    let result: any;
    if (selectedTokenType.value === "liquidity") {
      result = await parseLiquidityToken(UniswapV2Pair.abi, tokenAddress);
    } else if (selectedTokenType.value === "token") {
      result = await parseToken(ERC20.abi, tokenAddress);
    }

    let { data: tokenData, error } = result;

    if (!tokenData) return toast.error(error);
    tokenData = {
      ...tokenData,
      amount,
      tokenAddress,
      lockTimeS,
      unlockDate: lockTime.toString(),
    };
    setTokenData(tokenData);
    setShowModal(true);

    // get necessary details
  };

  const handleApproval = async () => {
    const callback = async () => {
      return tokenData.token.methods
        .approve(
          FireSalesLockerContract._address,
          utilityFunctions().toWei(9007199254740991)
        )
        .send({ from: account });
    };
    approvalHelper(callback);
  };

  const handleLockToken = async () => {
    if (tokenData.amount > tokenData.balance)
      return toast.error("Your balance is not enough");
    const amountToDecimals = utilityFunctions().toDecimals(
      tokenData.amount,
      tokenData.decimals
    );

    console.log(amountToDecimals);
    let tokenMetaData: any;
    if (selectedTokenType.value === "liquidity") {
      tokenMetaData = JSON.stringify({});
    } else {
      tokenMetaData = JSON.stringify({
        tokenName: tokenData.tokenName,
        tokenSymbol: tokenData.symbol,
        decimals: tokenData.decimals,
      });
    }

    let event: any;

    const callback = async () => {
      tokenMetaData = await addData(tokenMetaData);
      console.log("sale hash ", tokenMetaData);
      const toCall = async () => {
        const receipt = await FireSalesLockerContract.methods
          .createLockToken(
            tokenMetaData,
            selectedTokenType.value,
            amountToDecimals,
            tokenData.tokenAddress,
            account,
            tokenData.lockTimeS,
            tokenData.decimals
          )
          .send({ from: account });

        event = receipt.events.LockCreated;
      };
      return toCall();
    };

    try {
      await lockHelper(callback);
      navigate("/app/token-lockers/" + event.returnValues.tokenAddress);
    } catch (error) {
      console.log(error);
    }
  };

  const parseToken = async (abi: any, tokenAddress: string) => {
    try {
      setLoadingToken(true);
      const token = new web3.eth.Contract(abi, tokenAddress);
      let decimals = await token.methods.decimals().call();
      let balance = await token.methods.balanceOf(account).call();
      balance = utilityFunctions().fromDecimals(balance, decimals);
      let symbol = await token.methods.symbol().call();
      let tokenName = await token.methods.name().call();
      let totalSupply = await token.methods.totalSupply().call();
      console.log(totalSupply, decimals);
      totalSupply = utilityFunctions().fromDecimals(totalSupply, decimals);

      const obj: TokenData = {
        token,
        balance,
        decimals,
        symbol,
        tokenName,
        totalSupply,
        amount: 0,
      };

      setLoadingToken(false);

      return { data: obj, error: null };
    } catch (error) {
      setLoadingToken(false);
      return { data: null, error: "Token not found" };
    }
  };

  const parseLiquidityToken = async (abi: any, tokenAddress: string) => {
    try {
      setLoadingToken(true);

      const token: any = new web3.eth.Contract(abi, tokenAddress);
      const token0Address = await token.methods.token0().call();
      let decimals = await token.methods.decimals().call();
      let balance = await token.methods.balanceOf(account).call();
      balance = utilityFunctions().fromDecimals(balance, decimals);
      let symbol = await token.methods.symbol().call();
      let tokenName = await token.methods.name().call();
      let totalSupply = await token.methods.totalSupply().call();
      totalSupply = utilityFunctions().fromDecimals(totalSupply, decimals);

      const obj: TokenData = {
        token,
        balance,
        decimals,
        symbol,
        tokenName,
        totalSupply,
        amount: 0,
      };

      setLoadingToken(false);

      return { data: obj, error: null };
    } catch (error) {
      setLoadingToken(false);
      return { data: null, error: "Liquidity token not found" };
    }
  };

  return (
    <div>
      <AppModal modalIsOpen={showModal} closeModal={() => setShowModal(false)}>
        <Box
          sx={{ display: "flex", flexDirection: "column", padding: { xs: 2 } }}
        >
          <Box component="h3" sx={{ fontSize: 20 }}>
            Confirm
          </Box>
          <List sx={{ marginTop: 2 }}>
            <ListItem sx={{ color: theme.colors.primaryText }}>
              <ListItemIcon>
                <DriveFileRenameOutlineIcon
                  sx={{ color: theme.colors.primaryText }}
                />
              </ListItemIcon>

              <ListItemText
                sx={{
                  "> span": {
                    fontSize: 19,
                  },
                  color: theme.colors.primaryText,
                  "> p": {
                    color: theme.colors.primaryText,
                  },
                }}
                primary="Token Name"
                secondary={tokenData ? tokenData?.tokenName : ""}
              />
            </ListItem>
            <ListItem sx={{ color: theme.colors.primaryText }}>
              <ListItemIcon>
                <AttachMoney sx={{ color: theme.colors.primaryText }} />
              </ListItemIcon>

              <ListItemText
                sx={{
                  "> span": {
                    fontSize: 19,
                  },
                  color: theme.colors.primaryText,
                  "> p": {
                    color: theme.colors.primaryText,
                  },
                }}
                primary="Token Symbol"
                secondary={tokenData ? tokenData?.symbol : ""}
              />
            </ListItem>
            <ListItem sx={{ color: theme.colors.primaryText }}>
              <ListItemIcon>
                <DonutLarge sx={{ color: theme.colors.primaryText }} />
              </ListItemIcon>

              <ListItemText
                sx={{
                  "> span": {
                    fontSize: 19,
                  },
                  color: theme.colors.primaryText,
                  "> p": {
                    color: theme.colors.primaryText,
                  },
                }}
                primary="Total supply"
                secondary={tokenData ? formatNumber(tokenData.totalSupply) : ""}
              />
            </ListItem>
            <ListItem sx={{ color: theme.colors.primaryText }}>
              <ListItemIcon>
                <AccountBalanceWallet
                  sx={{ color: theme.colors.primaryText }}
                />
              </ListItemIcon>

              <ListItemText
                sx={{
                  "> span": {
                    fontSize: 19,
                  },
                  color: theme.colors.primaryText,
                  "> p": {
                    color: theme.colors.primaryText,
                  },
                }}
                primary="Your balance"
                secondary={tokenData ? formatNumber(tokenData.balance) : ""}
              />
            </ListItem>
            <ListItem sx={{ color: theme.colors.primaryText }}>
              <ListItemIcon>
                <Lock sx={{ color: theme.colors.primaryText }} />
              </ListItemIcon>

              <ListItemText
                sx={{
                  "> span": {
                    fontSize: 19,
                  },
                  color: theme.colors.primaryText,
                  "> p": {
                    color: theme.colors.primaryText,
                  },
                }}
                primary="Lock Amount"
                secondary={tokenData ? formatNumber(tokenData.amount) : ""}
              />
            </ListItem>
            <ListItem sx={{ color: theme.colors.primaryText }}>
              <ListItemIcon>
                <KeyRounded sx={{ color: theme.colors.primaryText }} />
              </ListItemIcon>

              <ListItemText
                sx={{
                  "> span": {
                    fontSize: 19,
                  },
                  color: theme.colors.primaryText,
                  "> p": {
                    color: theme.colors.primaryText,
                  },
                }}
                primary="Unlock date"
                secondary={tokenData ? tokenData?.unlockDate : ""}
              />
            </ListItem>
          </List>
          {approvalTransaction.status !== "resolved" && (
            <PrimaryButton
              onClick={handleApproval}
              style={{ marginTop: "2rem" }}
            >
              {approvalTransaction.status === "pending" ? (
                <Spinner width={30} height={30} />
              ) : (
                "Submit"
              )}
            </PrimaryButton>
          )}
          {approvalTransaction.status === "resolved" && (
            <PrimaryButton
              onClick={handleLockToken}
              style={{ marginTop: "2rem" }}
            >
              {lockTransaction.status === "pending" ? (
                <Spinner width={30} height={30} />
              ) : (
                "Create lock"
              )}
            </PrimaryButton>
          )}
        </Box>
      </AppModal>

      <div className="text-center font-bold text-2xl py-10">
        <h3>Token Locker</h3>
      </div>
      <div className="max-w-xl mx-auto">
        <Terms setShowContent={setShowContent} showContent={showContent} />
        {(!account || chainIdError) && showContent && <Connect />}
        {showContent && account && !chainIdError && (
          <Card>
            <form className="mt-5" onSubmit={handleSubmit(handleForm)}>
              <InputContainer>
                <Label htmlFor="tokenAddress">Token Type</Label>
                <AppSelect
                  onChange={(val) => {
                    setSelectedTokenType(val);
                  }}
                  value={selectedTokenType}
                  options={tokenTypes}
                  placeholder="Select token type"
                />
              </InputContainer>
              <InputContainer>
                <Label htmlFor="tokenAddress">Token Address</Label>
                <Input
                  type="text"
                  placeholder="Ex. 0x81507617417b71fC2d231F187bE4Bd919e572761"
                  {...register("tokenAddress")}
                  name="tokenAddress"
                />
                <InputError>{errors.tokenAddress?.message}</InputError>
              </InputContainer>
              <InputContainer>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  type="text"
                  placeholder="Ex. 1000"
                  {...register("amount")}
                  name="amount"
                />
                <InputError>{errors.amount?.message}</InputError>
              </InputContainer>
              <InputContainer>
                <Label htmlFor="lockTime">Lock Time (UTC)</Label>
                <Controller
                  control={control}
                  name="lockTime"
                  render={({ field: { onChange, value, ref } }) => (
                    <DateTimePicker
                      onChange={onChange}
                      value={value}
                      utc={true}
                      inputProps={{ placeholder: "Select Date" }}
                    />
                  )}
                />
                <InputError>{errors.lockTime?.message}</InputError>
              </InputContainer>
              <InputContainer className="text-center">
                <SafeButton
                  buttonProps={{ type: "submit" }}
                  Button={PrimaryButton}
                  text={
                    loadingToken ? (
                      <Spinner width={30} height={30} />
                    ) : (
                      "Lock Token"
                    )
                  }
                  callBack={() => console.log("")}
                ></SafeButton>
                {/* <PrimaryButton type="submit">Lock Token</PrimaryButton> */}
              </InputContainer>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LockToken;
