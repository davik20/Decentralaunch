import React from "react";
import styled, { Interpolation } from "styled-components";
import { FormInputType } from "..";
import {
  PrimaryButton,
  SafeButton,
} from "../../../../../components/common/Button";
import { Card } from "../../../../../components/common/Card";
import useAppState from "../../../../../context/appStateContext/useAppState";
import { formatNumber } from "../../../../../utils";

export interface ItemsContainerProps {
  style?: Interpolation<React.CSSProperties>;
}

const ItemsContainer = styled.div.attrs<ItemsContainerProps>(() => ({
  className: `grid grid-cols-2 w-full my-3 py-2 text-sm`,
}))<ItemsContainerProps>`
  ${({ style }) => style};
  border-bottom: 1px solid ${(props) => props.theme.colors.primaryText}30;
`;

export const DetailsSummary = ({
  moveToPrevious,
  submitFormData,
  formInput,
}: {
  moveToPrevious?: () => void;
  submitFormData?: () => void;
  formInput?: FormInputType;
}) => {
  const { system } = useAppState();
  const getUTCDate = (seconds: any) => {
    const dateMS = seconds * 1000;
    var date = new Date(dateMS);
    var date_utc = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    );

    console.log(date, date_utc);
    return new Date(date).toString();
  };
  return (
    <Card>
      {formInput?.totalSellingAmount && (
        <ItemsContainer>
          <p>Total Selling Amount</p>
          <p>{formatNumber(formInput?.totalSellingAmount)}</p>
        </ItemsContainer>
      )}
      {formInput?.preSaleRate && (
        <ItemsContainer>
          <p>Presale Rate</p>
          <p>
            {formInput?.preSaleRate} {formInput.tokenSymbol} per{" "}
            {system.currency}
          </p>
        </ItemsContainer>
      )}
      {formInput?.listingRate && (
        <ItemsContainer>
          <p>Listing Rate</p>
          <p>
            {formInput?.listingRate} {formInput.tokenSymbol} per{" "}
            {system.currency}
          </p>
        </ItemsContainer>
      )}
      {formInput?.softCap && (
        <ItemsContainer>
          <p>Soft Cap</p>
          <p>
            {formInput?.softCap} {system.currency}
          </p>
        </ItemsContainer>
      )}
      {formInput?.hardCap && (
        <ItemsContainer>
          <p>Hard Cap</p>
          <p>
            {formInput?.hardCap} {system.currency}
          </p>
        </ItemsContainer>
      )}
      {formInput?.minimumLimit && (
        <ItemsContainer>
          <p>Minimum Buy</p>
          <p>
            {formInput?.minimumLimit} {system.currency}
          </p>
        </ItemsContainer>
      )}
      {formInput?.maximumLimit && (
        <ItemsContainer>
          <p>Maximum Buy</p>
          <p>
            {formInput?.maximumLimit} {system.currency}
          </p>
        </ItemsContainer>
      )}
      {formInput?.liquidityPercent && (
        <ItemsContainer>
          <p>Liquidity Percentage</p>
          <p>{formInput?.liquidityPercent}%</p>
        </ItemsContainer>
      )}
      {formInput?.liquidityLockUp && (
        <ItemsContainer>
          <p>Liquidity unlock date</p>
          <p>{getUTCDate(formInput?.liquidityLockUp)} </p>
        </ItemsContainer>
      )}
      {formInput?.startDate && (
        <ItemsContainer>
          <p>Start Date</p>
          <p>{getUTCDate(formInput?.startDate)?.toString()}</p>
        </ItemsContainer>
      )}
      {formInput?.endDate && (
        <ItemsContainer>
          <p>End Date</p>
          <p>{getUTCDate(formInput?.endDate)?.toString()}</p>
        </ItemsContainer>
      )}
      {formInput?.website && (
        <ItemsContainer>
          <p>Website</p>
          <p>{formInput?.website}</p>
        </ItemsContainer>
      )}
      {formInput?.twitter && (
        <ItemsContainer>
          <p>Twitter</p>
          <p>{formInput?.twitter}</p>
        </ItemsContainer>
      )}
      {formInput?.facebook && (
        <ItemsContainer>
          <p>Facebook</p>
          <p>{formInput?.facebook}</p>
        </ItemsContainer>
      )}
      {formInput?.github && (
        <ItemsContainer>
          <p>Github</p>
          <p>{formInput?.github}</p>
        </ItemsContainer>
      )}
      {formInput?.reddit && (
        <ItemsContainer>
          <p>Reddit</p>
          <p>{formInput?.reddit}</p>
        </ItemsContainer>
      )}
      {formInput?.telegram && (
        <ItemsContainer>
          <p>Telegram</p>
          <p>{formInput?.telegram}</p>
        </ItemsContainer>
      )}
      {formInput?.discord && (
        <ItemsContainer>
          <p>Discord</p>
          <p>{formInput?.discord}</p>
        </ItemsContainer>
      )}
      {formInput?.description && (
        <ItemsContainer>
          <p>Project Description</p>
          <p>{formInput?.description}</p>
        </ItemsContainer>
      )}
      {formInput?.updates && (
        <ItemsContainer>
          <p>Participants Update</p>
          <p>{formInput?.updates}</p>
        </ItemsContainer>
      )}
      <ItemsContainer style={{ borderColor: "transparent", marginTop: "3rem" }}>
        <div>
          <PrimaryButton size="small" onClick={moveToPrevious}>
            Previous
          </PrimaryButton>
        </div>
        <div className="text-right ml-2">
          <SafeButton
            Button={PrimaryButton}
            callBack={submitFormData}
            text="Submit"
            buttonProps={{ size: "small" }}
          />
        </div>
      </ItemsContainer>
    </Card>
  );
};
