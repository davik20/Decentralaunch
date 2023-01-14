import moment from "moment";
import web3 from "web3";
import InuLogo from "../assets/images/inu-logo.jpg";
import { saleObj } from "../pages/Dashboard/LaunchPad/Lists/types";
import {create} from "ipfs-http-client";

export const etherMap: any = {
  18: "ether",
  15: "finney",
  12: "szabo",
  9: "gwei",
  6: "mwei",
  3: "kwei",
};

export const shortenAddress = (address: string): string => {
  let start = address.substring(0, 6);
  let end = address.substring(address.length - 1 - 3, address.length);
  const result = `${start}....${end}`;
  return result;
};
export const formatTimeStamp = (date: string) =>
  parseInt(moment(date).format("x"), 10);

export const formatNumberToCurrencyString = (number: number) =>
  new Intl.NumberFormat().format(number);

export const windowObj: any = { ...window };

export const reformer = async (sale: any) => {
  // get metaData from saleHash uri
  //code

  return new Promise(async (resolve, reject) => {
    const newObj: saleObj = {
      startTime: 0,
      endTime: 0,
      totalSupply: 0,
      tokenTotalSupply: "0",
      tokenSaleAmount: 0,
      presaleRate: "0",
    };

    console.log(sale);

    newObj.saleIndex = sale.saleIndex;
    // newObj.logoUrl = InuLogo;

    newObj.softCap = parseFloat(utilityFunctions().fromWei(sale.saleCaps[0]));
    newObj.hardCap = parseFloat(utilityFunctions().fromWei(sale.saleCaps[1]));
    newObj.progress = 0;
    newObj.saleCreator = sale.saleCreator;
    newObj.startTime = sale.saleTimes[0];
    newObj.endTime = sale.saleTimes[1];
    console.log(newObj.startTime);
    newObj.presaleRate = sale.presaleRate;
    newObj.presaleAddress = sale.saleAddress;
    newObj.tokenAddress = sale.token;
    newObj.dexListingPercent = parseFloat(sale.dexListingPercent);
    newObj.liquidityLockupTime = sale.liquidityLockupTime;
    newObj.amountRaised = 0;
    newObj.minBuy = parseFloat(
      utilityFunctions().fromDecimals(sale.buyLimits[0], sale.decimals)
    );
    newObj.maxBuy = parseFloat(
      utilityFunctions().fromDecimals(sale.buyLimits[1], sale.decimals)
    );

    let saleHash = await fetch(sale.saleHash);
    saleHash = await saleHash.json();

    console.log("sale hash", saleHash);

    console.log(newObj);

    resolve({ ...newObj, ...saleHash });
  });
};

export const utilityFunctions = () => {
  const toWei = (value: any) => {
    let amount = value;
    if (typeof amount === "number") {
      amount = amount.toString();
    }
    return web3.utils.toWei(amount, "ether");
  };
  const fromWei = (value: any) => {
    let amount = value;
    if (typeof amount === "number") {
      amount = amount.toString();
    }

    return web3.utils.fromWei(amount, "ether");
  };

  const toDecimals = (value: any, decimals: string) => {
    console.log(etherMap[decimals]);
    let amount = value;
    if (typeof amount === "number") {
      amount = amount.toString();
    }
    return web3.utils.toWei(amount, etherMap[decimals]);
  };
  const fromDecimals = (value: any, decimals: any) => {
    console.log(etherMap[decimals]);
    let amount = value;
    if (typeof amount === "number") {
      amount = String(amount);
    }
    return web3.utils.fromWei(amount, etherMap[decimals]);
  };

  const fromUtf8 = (string: string) => web3.utils.fromUtf8(string);
  const toUtf8 = (string: string) => web3.utils.toUtf8(string);

  return {
    toWei,
    fromWei,
    toDecimals,
    fromDecimals,
    fromUtf8,
    toUtf8,
  };
};

export const calculateMinuteDifference = (
  startDate: number,
  endDate: number
): number => {
  return (endDate - startDate) / 60;
};
export const calculateDayDifference = (
  startDate: number,
  endDate: number
): number => {
  return (endDate - startDate) / (24 * 60 * 60);
};
export const calculateMonthDifference = (
  startDate: number,
  endDate: number
): number => {
  return (endDate - startDate) / (24 * 60 * 60) / 30;
};

export const sanitize = (str: string | any) => {
  let sanitized = str.split("").map((e: any, i: any, array: any) => {
    if (i === 0 || i === array.length - 1) {
      return " ";
    } else {
      return e;
    }
  });
  return sanitized.join("").trim();
};

/* Create an instance of the client */
// create();



const client = create({ url: "https://ipfs.infura.io:5002/api/v0" });

const addData = (data: any) => {
  console.log("adding");
  console.log(data);
  return new Promise((resolve, reject) => {
    client
      .add(data)
      .then((added) => {
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        console.log(added);
        resolve(url);
      })
      .catch((err) => reject(err));
  });
};

export const formatNumber = (number: any) => {
  let num = number;
  if (num) {
    if (typeof num === "string") {
      num = parseInt(num);
    }
    return num.toLocaleString(navigator.language, {
      minimumFractionDigits: 2,
    });
  }
};

export default addData;
