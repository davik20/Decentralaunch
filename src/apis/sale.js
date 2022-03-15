import {
  getDoc,
  setDoc,
  collection,
  addDoc,
  where,
  query,
  getDocs,
  updateDoc,
  arrayUnion,
  doc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { getIdByParams, getItemsByParams, getItemByParams } from "./utils";

const saleRef = collection(db, "sales");
const sale = () => {
  const getSalesByChainId = async (chainId) => {
    const sales = await getItemsByParams(saleRef, "chainId", chainId);
    return sales;
  };

  const getSaleByAddress = async (saleAddress) => {
    const sales = await getItemByParams(saleRef, "saleAddress", saleAddress);
    return sales;
  };

  const addSale = async (
    saleCreator,
    saleAddress,
    saleName,
    tokenAddress,
    presaleRate,
    listingRate,
    tokensForPresale,
    tokensForListing,
    saleHash,
    chainId,
    softCap,
    hardCap,
    liquidityLockup,
    liquidityPercent,
    minimumLimit,
    maximumLimit,
    participants = [],
    isTrending = false,
    isKyced = false
  ) => {
    const id = await getIdByParams(saleRef, "saleAddress", saleAddress);
    if (id) return console.log("sale already exists");
    addDoc(saleRef, {
      saleCreator,
      saleAddress,
      saleName,
      tokenAddress,
      presaleRate,
      listingRate,
      tokensForPresale,
      tokensForListing,
      saleHash,
      chainId,
      softCap,
      hardCap,
      liquidityLockup,
      liquidityPercent,
      minimumLimit,
      maximumLimit,
      participants,
      isTrending,
      isKyced,
    });
  };

  const setSaleToTrending = async (saleAddress) => {
    const id = await getIdByParams(saleRef, "saleAddress", saleAddress);
    if (!id) return console.log("This sale does not exist");
    updateDoc(doc(saleRef, id), {
      isTrending: true,
    });
  };
  const setSaleToKyced = async (saleAddress) => {
    const id = await getIdByParams(saleRef, "saleAddress", saleAddress);
    if (!id) return console.log("This sale does not exist");
    updateDoc(doc(saleRef, id), {
      isKyced: true,
    });
  };

  const addBuyToSale = async (
    saleAddress,
    userAddress,
    buyAmount,
    currency
  ) => {
    const id = await getIdByParams(saleRef, "saleAddress", saleAddress);
    if (!id) return console.log("This sale does not exist");
    updateDoc(doc(saleRef, id), {
      participants: arrayUnion({ userAddress, buyAmount, currency }),
    });
  };

  return {
    addSale,
    setSaleToTrending,
    getSalesByChainId,
    getSaleByAddress,
    setSaleToKyced,
    addBuyToSale,
  };
};

export default sale;
