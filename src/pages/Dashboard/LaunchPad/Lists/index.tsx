import React, { useCallback, useEffect, useState } from "react";
import { Card } from "../../../../components/common/Card";
import { Link, useSearchParams } from "react-router-dom";
import { LaunchPadCard } from "../../../../components/layout/LaunchComponent/LaunchPadCard";
import { lists } from "./demo-data";
import { Input, InputContainer } from "../../../../components/common/Inputs";
import { useParams, useLocation } from "react-router-dom";
import {
  PrimaryButton,
  SecondaryButton,
} from "../../../../components/common/Button";
import { LaunchpadFilter } from "../../../../components/layout/LaunchComponent/LaunchpadFilter";
import { TabSelector } from "../../../../components/common/Tabs/TabSelector";
import { TabPanel, useTabs } from "../../../../components/common/Tabs";
import { NoData } from "../../../../components/layout/NoData";
import { LaunchPadLoader } from "../../../../components/common/CardLoader";
import useAppState from "../../../../context/appStateContext/useAppState";
import useContracts from "../../../../context/contractContext/useContracts";
import { Pagination } from "../../../../components/common/Pagination";
import useConnection from "../../../../context/connectionContext/useConnection";
import { useApptheme } from "../../../../components/AppThemeProvider";
import { reformer } from "../../../../utils";
import Connect from "../../../../components/Connect";
import Web3 from "web3";

const LaunchpadLists = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const tabToShow =
    query.get("crf") === "mypools"
      ? ["myPools", "allPools"]
      : ["allPools", "myPools"];
  console.log(query.get("crf"));
  const [filterOption, setFilterOption] = useState<string>("");
  const [selectedTab, setSelectedTab] = useTabs(tabToShow);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(6);
  const { FireSalesRouterContract } = useContracts();
  const { account, chainIdError, web3 } = useConnection();
  const { themeMode } = useApptheme();
  const [search, setSearch] = useState({
    toSearch: false,
    searchText: "",
    searchResult: null,
    searchStatus: "idle",
    searchError: "",
  });
  // console.log(FireSalesRouterContract);
  const { salesState, salesDispatch, mySalesState, mySalesDispatch } =
    useAppState();

  useEffect(() => {
    salesDispatch({ type: "pending" });

    FireSalesRouterContract.methods
      .getAllSales()
      .call()
      .then((result: any) => {
        const reformer = async (saleAddress: any) => {
          return new Promise(async (resolve, reject) => {
            const saleObj: any = await FireSalesRouterContract.methods
              .getSaleByAddress(saleAddress)
              .call();
            resolve({
              saleAddress: saleObj.saleAddress,
              saleIndex: saleObj.saleIndex,
            });
          });
        };
        const promises = result.map((saleAddress: any) => {
          return reformer(saleAddress);
        });

        Promise.all(promises).then((result) => {
          salesDispatch({ type: "resolved", data: result });
        });
      })
      .catch((error: any) => {
        alert("an error occurred");
        salesDispatch({ type: "rejected", data: [] });
      });
  }, []);

  useEffect(() => {
    if (account && selectedTab === "myPools") {
      mySalesDispatch({ type: "pending" });
      FireSalesRouterContract.methods
        .getAllUserSales(account)
        .call()
        .then((result: any) => {
          const reformer = async (saleAddress: any) => {
            return new Promise(async (resolve, reject) => {
              const saleObj: any = await FireSalesRouterContract.methods
                .getSaleByAddress(saleAddress)
                .call();
              resolve({
                saleAddress: saleObj.saleAddress,
                saleIndex: saleObj.saleIndex,
              });
            });
          };
          const promises = result.map((saleAddress: any) => {
            return reformer(saleAddress);
          });

          Promise.all(promises).then((result) => {
            mySalesDispatch({ type: "resolved", data: result });
          });
        })
        .catch((error: any) => {
          alert("an error occurred");
          mySalesDispatch({ type: "rejected", data: [] });
        });
    }
  }, [account, selectedTab]);

  console.log(mySalesState);

  const selectFilterOption = (option: string) => {
    setFilterOption(option);
    // Perform request to server
  };

  useEffect(() => {
    console.log(filterOption);
  }, [filterOption]);

  const handleSearch = async (e: any) => {
    let presaleAddress = search.searchText.trim();

    if (!web3.utils.isAddress(presaleAddress)) {
      setSearch((prev: any) => {
        return {
          ...prev,
          searchError: "Invalid token address",
        };
      });
      return;
    }

    if (presaleAddress.length !== 42) {
      setSearch((prev: any) => {
        return {
          ...prev,
          searchError: "Invalid token address",
        };
      });
      return;
    }
    setSearch((prev: any) => {
      return {
        ...prev,

        toSearch: true,
        searchStatus: "pending",
      };
    });

    // FireSalesRouterContract.methods
    //   .getSaleByAddress(presaleAddress)
    //   .call()
    //   .then((result: any) => {
    //     return reformer(result);
    //   })
    //   .then((result: any) => {
    //     setSearch((prev: any) => {
    //       return { ...prev, searchStatus: "resolved", searchResult: result };
    //     });
    //   });
  };

  const toRender = useCallback(() => {
    if (!salesState.data) return [];
    const startIndex = (currentPage - 1) * perPage;
    const endIndex =
      currentPage * perPage > salesState.data.length
        ? salesState.data.length
        : currentPage * perPage;
    console.log(
      startIndex,
      endIndex,
      [...salesState.data].slice(startIndex, endIndex)
    );
    return [...salesState.data].slice(startIndex, endIndex);
  }, [currentPage, perPage, salesState]);

  const toRenderMine = useCallback(() => {
    if (!mySalesState.data) return [];
    const startIndex = (currentPage - 1) * perPage;
    const endIndex =
      currentPage * perPage > mySalesState.data.length
        ? mySalesState.data.length
        : currentPage * perPage;
    console.log(
      startIndex,
      endIndex,
      [...mySalesState.data].slice(startIndex, endIndex)
    );
    return [...mySalesState.data].slice(startIndex, endIndex);
  }, [currentPage, perPage, mySalesState]);

  return (
    <div>
      <div className="py-10">
        <h3 className="text-2xl md:text-3xl font-bold">Current PreSales 🔥</h3>
      </div>
      <nav className="flex mx-auto justify-center mb-8">
        <TabSelector
          isActive={selectedTab === "allPools"}
          onClick={() => setSelectedTab("allPools")}
        >
          All Pools
        </TabSelector>
        <TabSelector
          isActive={selectedTab === "myPools"}
          onClick={() => setSelectedTab("myPools")}
        >
          My Pools
        </TabSelector>
      </nav>
      <Card className="mb-10">
        <InputContainer className="flex flex-col md:flex-row md:space-x-2">
          <Input
            onChange={(e) => {
              setSearch((prev: any) => ({
                ...prev,
                searchError: "",
                toSearch: false,
                searchText: e.target.value,
              }));
            }}
            type="text"
            placeholder="Enter Presale Address"
          />

          <SecondaryButton onClick={handleSearch}>Search</SecondaryButton>
        </InputContainer>
        {search.searchError && (
          <div
            style={{ marginTop: "-1.4rem", color: themeMode.colors.primaryRed }}
          >
            {search.searchError}
          </div>
        )}
        {/* <LaunchpadFilter
          selected={filterOption}
          onSelect={selectFilterOption}
        /> */}
      </Card>
      {search.toSearch && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-3">
          <Link to={`/app/launchpad/lists/${search.searchText}`}>
            <LaunchPadCard saleAddress={search.searchText.trim()} />
          </Link>
        </div>
      )}
      {!search.toSearch && (
        <div>
          <TabPanel hidden={selectedTab !== "allPools"}>
            {salesState.status === "resolved" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {toRender().map((sale: any) => (
                    <Link
                      to={`/app/launchpad/lists/${sale.saleIndex}`}
                      key={sale.saleAddress}
                    >
                      <LaunchPadCard saleAddress={sale.saleAddress} />
                    </Link>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Pagination
                    currentPage={currentPage}
                    onPageClick={(page: any) => setCurrentPage(page.page)}
                    totalItems={salesState.data.length}
                    totalPages={Math.ceil(salesState.data.length / perPage)}
                    perPage={perPage}
                  ></Pagination>
                </div>
              </>
            )}
            {/* Launchpad items loader component */}
            {salesState.status === "pending" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-3">
                <LaunchPadLoader />
                <LaunchPadLoader />
                <LaunchPadLoader />
              </div>
            )}
          </TabPanel>
          <TabPanel hidden={selectedTab !== "myPools"}>
            {(!account || chainIdError) && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Connect />
              </div>
            )}

            {mySalesState.data.length === 0 &&
              mySalesState.status === "resolved" &&
              account &&
              !chainIdError && <NoData />}

            {salesState.status === "resolved" && mySalesState.data.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {toRenderMine().map((sale: any) => (
                    <Link
                      to={`/app/launchpad/lists/${sale.saleIndex}`}
                      key={sale.saleAddress}
                    >
                      <LaunchPadCard saleAddress={sale.saleAddress} />
                    </Link>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Pagination
                    currentPage={currentPage}
                    onPageClick={(page: any) => setCurrentPage(page.page)}
                    totalItems={salesState.data.length}
                    totalPages={Math.ceil(salesState.data.length / perPage)}
                    perPage={perPage}
                  ></Pagination>
                </div>
              </>
            )}
            {mySalesState.status === "pending" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-3">
                <LaunchPadLoader />
                <LaunchPadLoader />
                <LaunchPadLoader />
              </div>
            )}
            {/* <NoData /> */}
          </TabPanel>
        </div>
      )}
    </div>
  );
};

export default LaunchpadLists;
