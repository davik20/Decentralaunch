import React, { useState, useEffect } from "react";
import { Card } from "../../../../../components/common/Card";
import {
  Input,
  InputContainer,
  InputError,
  InputHint,
  Label,
} from "../../../../../components/common/Inputs";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { PrimaryButton } from "../../../../../components/common/Button";
import AppSelect, {
  IOptions,
} from "../../../../../components/common/AppSelect";
import { DateTimePicker } from "../../../../../components/common/DateTimePicker";
import useContracts from "../../../../../context/contractContext/useContracts";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import {
  calculateDayDifference,
  calculateMinuteDifference,
  calculateMonthDifference,
} from "../../../../../utils";
import useAppState from "../../../../../context/appStateContext/useAppState";

const validationSchema = Yup.object().shape({
  preSaleRate: Yup.string().required("Presale rate is required"),
  softCap: Yup.string().required("Softcap is required"),
  hardCap: Yup.string().required("hardCap is required"),
  minimumLimit: Yup.string().required("Minimum contributing limit is required"),
  maximumLimit: Yup.string().required("Maximum contributing limit is required"),
  targetExchange: Yup.string().required("Select an exchange."),
  liquidityPercent: Yup.string().required("Liquidity percentage is required."),
  listingRate: Yup.string().required("Listing rate is required."),
  // liquidityLockUp: Yup.date()
  //   .required("Liquidity Lockup is required.")
  //   .min(Yup.ref("endDate"), "Liqudity Lockup date can't be before end date"),
  liquidityLockUp: Yup.string().required("Liquidity lock is required."),
  startDate: Yup.date()
    .required("Start date is required.")
    .min(new Date(), "Start time cannot be in the past"),
  endDate: Yup.date()
    .required("End date is required.")
    .min(Yup.ref("startDate"), "End date can't be before start date"),
});
const formOptions = { resolver: yupResolver(validationSchema) };

export const LaunchInfo = ({
  moveToNext,
  moveToPrevious,
  sendFormData,
}: {
  moveToNext: () => void;
  moveToPrevious: () => void;
  sendFormData: (form: any) => void;
}) => {
  const { system, minimumAllowed } = useAppState();

  const [selectedExchange, setSelectedExchange] = useState<IOptions>({
    label: "",
    value: "",
  });
  const { register, handleSubmit, setError, formState, control } =
    useForm(formOptions);
  const { errors } = formState;

  const handleForm: SubmitHandler<any> = async (value) => {
    // checks

    const liquidtyPercent = parseFloat(value.liquidityPercent);
    const softCap = parseFloat(value.softCap);
    const hardCap = parseFloat(value.hardCap);
    const minimumLimit = parseFloat(value.minimumLimit);
    const maximumLimit = parseFloat(value.maximumLimit);
    const presaleRate = parseFloat(value.preSaleRate);
    const listingRate = parseFloat(value.listingRate);

    console.log(softCap, hardCap, presaleRate, listingRate);

    try {
      // check softcap percent
      if (presaleRate <= 0 || listingRate <= 0)
        return toast.error("Value cannot be less than zero.");
      if (softCap >= hardCap) {
        toast.error(
          `Soft cap must be less than hard cap : ${minimumAllowed.data.minSoftCapPercent}.`
        );
        throw new Error(
          `Softcap cannot be greater than hard cap: ${minimumAllowed.data.minSoftCapPercent}.`
        );
      }

      if (minimumLimit > maximumLimit)
        return toast.error(
          "Minimum buy amount cannot be greater than Maximum buy amount."
        );

      if (isNaN(presaleRate) || isNaN(listingRate))
        return toast.error("Value not a number");
      let softCapPercentOfHardCap = (value.softCap / value.hardCap) * 100;
      softCapPercentOfHardCap = Math.ceil(softCapPercentOfHardCap);

      if (softCapPercentOfHardCap < minimumAllowed.data.minSoftCapPercent) {
        toast.error(
          `Softcap percent is less than allowed : ${minimumAllowed.data.minSoftCapPercent}`
        );
        throw new Error(
          `Softcap perent is less than allowed : ${minimumAllowed.data.minSoftCapPercent}`
        );
      }

      // check liquidity percent
      if (liquidtyPercent < minimumAllowed.data.minDexLiquidityPercent) {
        toast.error(
          `Liquidity percent is less than allowed : ${minimumAllowed.data.minDexLiquidityPercent}`
        );
        throw new Error(
          `Liquidity percent is less than allowed : ${minimumAllowed.data.minDexLiquidityPercent}`
        );
      }

      const liquidityLockUpMs = new Date(value.liquidityLockUp).getTime();
      const liquidityLockUp = Math.ceil(liquidityLockUpMs / 1000);

      const startTimeMs = new Date(value.startDate).getTime();
      const startDate = Math.ceil(startTimeMs / 1000);

      const endTimeMs = new Date(value.endDate).getTime();
      const endDate = Math.ceil(endTimeMs / 1000);

      /// calculate if lockupTime is greater than minimum required days after listing

      const startMinuteDifference = calculateMinuteDifference(
        Date.now() / 1000,
        startDate
      );

      // if (startMinuteDifference < 10) {
      //   toast.error(
      //     `start time must be at least 10 minutes after current time`
      //   );
      //   throw new Error(
      //     "Start time must be at least 10 minutes after current time"
      //   );
      // }
      const salePeriodMinuteDifference = calculateMinuteDifference(
        startDate,
        endDate
      );
      if (salePeriodMinuteDifference < 10) {
        toast.error(`End time must be at least 10 minutes after start time`);
        throw new Error(
          "End time must be at least 10 minutes after start time"
        );
      }

      const monthDifference = calculateMonthDifference(
        endDate,
        liquidityLockUp
      );
      console.log(monthDifference, "month different");
      if (monthDifference < 1) {
        toast.error(
          `Liquidity lockup period must be at least for ${system.mininimumLiquidityLockup} Month`
        );
        throw new Error(
          `Liquidity lockup period must be at least for  ${system.mininimumLiquidityLockup} Month`
        );
      }

      const updatedValue = {
        ...value,
        startDate,
        endDate,
        liquidityLockUp,
        selectedExchangeAddresses: selectedExchange.value,
        selectedExchangeName: selectedExchange.label,
      };

      sendFormData(updatedValue);
      moveToNext();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card>
      {minimumAllowed.status === "pending" && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ClipLoader color="white" />
        </div>
      )}
      {minimumAllowed.status === "resolved" && (
        <form onSubmit={handleSubmit(handleForm)}>
          <InputContainer>
            <Label htmlFor="preSaleRate">Presale Rate</Label>
            <Input
              placeholder="Ex. 500"
              {...register("preSaleRate")}
              name="preSaleRate"
            />
            <InputError>{errors.preSaleRate?.message}</InputError>
            <InputHint>
              If I spend 1 {system.currency}, how many tokens will I receive?
            </InputHint>
          </InputContainer>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputContainer>
              <Label htmlFor="softCap">Softcap</Label>
              <Input
                // type="number"
                placeholder="Soft Cap Ex. 20"
                {...register("softCap")}
                name="softCap"
              />
              <InputError>{errors.softCap?.message}</InputError>
              <InputHint>
                Softcap must be &gt;= {minimumAllowed.data.minSoftCapPercent}%
                of Hardcap!
              </InputHint>
            </InputContainer>
            <InputContainer>
              <Label htmlFor="hardCap">Hardcap</Label>
              <Input
                placeholder="Hard Cap Ex. 40"
                type="number"
                {...register("hardCap")}
                name="hardCap"
              />
              <InputError>{errors.hardCap?.message}</InputError>
            </InputContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputContainer>
              <Label htmlFor="minimumLimit">Minimum Contribution Limit</Label>
              <Input
                type="number"
                placeholder="Ex. 0.1"
                {...register("minimumLimit")}
                name="minimumLimit"
              />
              <InputError>{errors.minimumLimit?.message}</InputError>
              <InputHint>
                Enter the minimum and maximum amounts each wallet can contribute
              </InputHint>
            </InputContainer>
            <InputContainer>
              <Label htmlFor="maximumLimit">Maximum Contribution Limit</Label>
              <Input
                placeholder="Ex. 10"
                type="number"
                {...register("maximumLimit")}
                name="maximumLimit"
              />
              <InputError>{errors.maximumLimit?.message}</InputError>
            </InputContainer>
          </div>

          <InputContainer>
            <Label htmlFor="targetExchange">Select Target Exchange</Label>
            <Controller
              control={control}
              name="targetExchange"
              render={({ field: { onChange, value, ref } }) => (
                <AppSelect
                  inputRef={ref}
                  options={system.targetDexList}
                  value={system.targetDexList.find(
                    (c: any) => c.label === value
                  )}
                  onChange={(val) => {
                    setSelectedExchange(val);
                    onChange(val.label);
                  }}
                  placeholder="Select Exchange"
                  isSearchable={false}
                />
              )}
            />
            <InputError>{errors.targetExchange?.message}</InputError>
          </InputContainer>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputContainer>
              <Label htmlFor="liquidityPercent">
                {selectedExchange?.label} Liquidity (%)
              </Label>
              <Input
                placeholder="Ex. 60"
                type="number"
                {...register("liquidityPercent")}
                name="liquidityPercent"
              />
              <InputError>{errors.liquidityPercent?.message}</InputError>
              <InputHint>
                Enter the percentage of raised funds that should be allocated to{" "}
                {selectedExchange?.label}
                Liquidity on (Min {minimumAllowed.data.minDexLiquidityPercent}
                %, Max 100%)
              </InputHint>
            </InputContainer>
            <InputContainer>
              <Label htmlFor="listingRate">
                {selectedExchange?.label} Listing Rate
              </Label>
              <Input
                placeholder="Ex. 400"
                {...register("listingRate")}
                name="listingRate"
              />
              <InputError>{errors.listingRate?.message}</InputError>
              <InputHint>
                Enter the BakerySwap listing price: (If I buy 1{" "}
                {system.currency} worth on BakerySwap how many tokens do I get?
                Usually this amount is lower than presale rate to allow for a
                higher listing price on BakerySwap)
              </InputHint>
            </InputContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputContainer>
              <Label htmlFor="startDate">Start Date (UTC)</Label>
              <Controller
                control={control}
                name="startDate"
                render={({ field: { onChange, value, ref } }) => (
                  <DateTimePicker
                    onChange={onChange}
                    value={value}
                    utc={true}
                  />
                )}
              />
              <InputError>{errors.startDate?.message}</InputError>
            </InputContainer>
            <InputContainer>
              <Label htmlFor="endDate">End Date (UTC)</Label>
              <Controller
                control={control}
                name="endDate"
                render={({ field: { onChange, value, ref } }) => (
                  <DateTimePicker
                    onChange={onChange}
                    value={value}
                    utc={true}
                  />
                )}
              />
              <InputError>{errors.endDate?.message}</InputError>
            </InputContainer>
          </div>
          <InputContainer>
            <Label htmlFor="liquidityLockUp">Liquidity Lockup</Label>
            {/* <Input
              placeholder="Ex. 10"
              type="number"
              {...register("liquidityLockUp")}
              name="liquidityLockUp"
            /> */}
            <Controller
              control={control}
              name="liquidityLockUp"
              render={({ field: { onChange, value, ref } }) => (
                <DateTimePicker onChange={onChange} value={value} utc={true} />
              )}
            />
            <InputError>{errors.liquidityLockUp?.message}</InputError>
          </InputContainer>

          <InputContainer className="flex justify-between">
            <PrimaryButton size="small" type="button" onClick={moveToPrevious}>
              Previous
            </PrimaryButton>
            <PrimaryButton size="small" type="submit">
              Next
            </PrimaryButton>
          </InputContainer>
        </form>
      )}
    </Card>
  );
};
