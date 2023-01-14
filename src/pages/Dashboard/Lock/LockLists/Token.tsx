import { promises } from "fs";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { SecondaryButton } from "../../../../components/common/Button";
import { Card } from "../../../../components/common/Card";
import { TokenLockLoader } from "../../../../components/common/CardLoader";
import { InputContainer, Input } from "../../../../components/common/Inputs";
import { Pagination } from "../../../../components/common/Pagination";
import Paginator from "../../../../components/common/Pagination/paginator";
import { Spinner } from "../../../../components/common/Spinner";
import { TabPanel, useTabs } from "../../../../components/common/Tabs";
import { TabSelector } from "../../../../components/common/Tabs/TabSelector";
import Connect from "../../../../components/Connect";
import { NoData } from "../../../../components/layout/NoData";
import { TokenLockerCard } from "../../../../components/layout/TokenLockerComponent/LockerCard";
import useConnection from "../../../../context/connectionContext/useConnection";
import useContracts from "../../../../context/contractContext/useContracts";
import { useAsync } from "../../../../hooks";
import { utilityFunctions } from "../../../../utils";
import { PrimaryButton } from "../../LaunchPad/Create";
import { tokenLocks } from "./demo-lock-data";

const TokenList = () => {
  const [selectedTab, setSelectedTab] = useTabs(["allLocks", "myLocks"]);
  const { web3, account, connectWallet, chainIdError } = useConnection();

  const { FireSalesLockerContract } = useContracts();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(6);
  const [locksLoading, setLocksLoading] = useState(false);
  const [locks, setLocks] = useState({
    status: "idle",
    error: "",
    data: [],
  });
  const [myLocks, setMyLocks] = useState({
    status: "idle",
    error: "",
    data: [],
  });
  useEffect(() => {
    // FireSalesLockerContract.events
    //   .LockCreated({ fromBlock: "earliest" }, () => "")
    //   .on("data", (data: any) => {
    //     console.log(data);
    //   })

    let type = web3.utils.sha3("token");

    const getTokenLocks = new Promise(async (resolve, reject) => {
      const events = await FireSalesLockerContract.getPastEvents(
        "LockCreated",
        {
          fromBlock: "earliest",
          filter: {
            _type: "0",
          },
        },
        (error: any, events: any) => {}
      );
      const functions: any = [];
      events.forEach((item: any) => {
        const getLockItem = new Promise(async (resolve, reject) => {
          console.log(item);
          let tokenAmount = item.returnValues.tokenAmount;
          let hash: any = await fetch(item.returnValues.hash);
          hash = await hash.json();
          console.log("hash", hash);
          let decimals = hash.decimals;

          tokenAmount = utilityFunctions().fromDecimals(tokenAmount, decimals);

          resolve({
            ...item.returnValues,
            tokenAmount,
            ...hash,
            unlockDate: parseInt(item.returnValues.unlockDate),
          });
        });

        functions.push(getLockItem);
      });

      const result = Promise.all(functions);
      console.log(result);
      resolve(result);
    });

    try {
      setLocks((prev: any) => {
        return {
          ...prev,
          status: "pending",
        };
      });
      getTokenLocks.then((res: any) => {
        console.log(res);
        setLocks((prev: any) => {
          return {
            ...prev,
            status: "resolved",
            data: res,
          };
        });
      });
    } catch (error) {
      console.log(error);
      setLocks((prev: any) => {
        return {
          ...prev,
          status: "rejected",
          error: "error",
        };
      });
    }
  }, []);

  useEffect(() => {
    if (myLocks.data.length > 0) return;
    if (selectedTab === "myLocks") {
      const getTokenLocks = new Promise(async (resolve, reject) => {
        const events = await FireSalesLockerContract.getPastEvents(
          "LockCreated",
          {
            fromBlock: "earliest",
            filter: {
              _type: "0",
              receiverAddress: account,
            },
          },
          (error: any, events: any) => {}
        );
        const functions: any = [];
        events.forEach((item: any) => {
          const getLockItem = new Promise(async (resolve, reject) => {
            console.log(item);
            let tokenAmount = item.returnValues.tokenAmount;
            let hash: any = await fetch(item.returnValues.hash);
            hash = await hash.json();
            console.log("hash", hash);
            let decimals = hash.decimals;

            tokenAmount = utilityFunctions().fromDecimals(
              tokenAmount,
              decimals
            );

            resolve({
              ...item.returnValues,
              tokenAmount,
              ...hash,
              unlockDate: parseInt(item.returnValues.unlockDate),
            });
          });

          functions.push(getLockItem);
        });

        const result = Promise.all(functions);

        console.log(result);

        resolve(result);
      });

      try {
        setMyLocks((prev: any) => {
          return {
            ...prev,
            status: "pending",
          };
        });
        getTokenLocks.then((res: any) => {
          console.log(res);
          setMyLocks((prev: any) => {
            return {
              ...prev,
              status: "resolved",
              data: res,
            };
          });
        });
      } catch (error) {
        console.log(error);
        setMyLocks((prev: any) => {
          return {
            ...prev,
            status: "rejected",
            error: "error",
          };
        });
      }
    }
  }, [account, selectedTab]);

  const toRender = useCallback(() => {
    if (!locks.data) return [];
    const startIndex = (currentPage - 1) * perPage;
    const endIndex =
      currentPage * perPage > locks.data.length
        ? locks.data.length
        : currentPage * perPage;
    console.log(
      startIndex,
      endIndex,
      [...locks.data].slice(startIndex, endIndex)
    );
    return [...locks.data].slice(startIndex, endIndex);
  }, [currentPage, perPage, locks]);

  const toRenderMine = useCallback(() => {
    if (!myLocks.data) return [];
    const startIndex = (currentPage - 1) * perPage;
    const endIndex =
      currentPage * perPage > myLocks.data.length
        ? myLocks.data.length
        : currentPage * perPage;
    console.log(
      startIndex,
      endIndex,
      [...myLocks.data].slice(startIndex, endIndex)
    );
    return [...myLocks.data].slice(startIndex, endIndex);
  }, [currentPage, perPage, myLocks]);

  return (
    <div>
      <div className="py-10">
        <h3 className="text-2xl md:text-3xl font-bold">Token Lockers 🔒</h3>
      </div>
      <nav className="flex mx-auto justify-center mb-8">
        <TabSelector
          isActive={selectedTab === "allLocks"}
          onClick={() => {
            setCurrentPage(1);
            setSelectedTab("allLocks");
          }}
        >
          All
        </TabSelector>
        <TabSelector
          isActive={selectedTab === "myLocks"}
          onClick={() => {
            setCurrentPage(1);
            setSelectedTab("myLocks");
          }}
        >
          My Lock
        </TabSelector>
      </nav>
      <Card className="mb-10">
        <InputContainer className="flex flex-col md:flex-row md:space-x-2">
          <Link className="hidden md:block" to="/app/token-lock">
            <SecondaryButton>Create Lock</SecondaryButton>
          </Link>
          <Input type="text" placeholder="Enter Token Address or Token Name" />
        </InputContainer>
      </Card>
      <div>
        <TabPanel hidden={selectedTab !== "allLocks"}>
          {locks.data.length === 0 && locks.status === "resolved" && <NoData />}
          {locks.status === "pending" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <TokenLockLoader />
              <TokenLockLoader />
              <TokenLockLoader />
            </div>
          )}
          {locks.status === "resolved" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {toRender().map((lock: any, index: any) => (
                  <Link
                    to={`/app/token-lockers/${lock.index}`}
                    key={lock.index}
                  >
                    <TokenLockerCard content={lock} />
                  </Link>
                ))}
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Pagination
                    currentPage={currentPage}
                    onPageClick={(page: any) => setCurrentPage(page.page)}
                    totalItems={locks.data.length}
                    totalPages={Math.ceil(locks.data.length / perPage)}
                    perPage={perPage}
                  ></Pagination>
                </div>
              </div>{" "}
            </>
          )}
        </TabPanel>

        <TabPanel hidden={selectedTab !== "myLocks"}>
          {(!account || chainIdError) && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Connect />
            </div>
          )}
          {myLocks.data.length === 0 &&
            myLocks.status === "resolved" &&
            account &&
            !chainIdError && <NoData />}
          {myLocks.status === "pending" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <TokenLockLoader />
              <TokenLockLoader />
              <TokenLockLoader />
            </div>
          )}
          {myLocks.status === "resolved" && account && !chainIdError && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {toRenderMine().map((lock: any, index: any) => (
                  <Link
                    to={`/app/token-lockers/${lock.index}`}
                    key={lock.index}
                  >
                    <TokenLockerCard content={lock} />
                  </Link>
                ))}
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Pagination
                    currentPage={currentPage}
                    onPageClick={(page: any) => setCurrentPage(page.page)}
                    totalItems={locks.data.length}
                    totalPages={Math.ceil(locks.data.length / perPage)}
                    perPage={perPage}
                  ></Pagination>
                </div>
              </div>{" "}
            </>
          )}
        </TabPanel>
      </div>
    </div>
  );
};

export default TokenList;
