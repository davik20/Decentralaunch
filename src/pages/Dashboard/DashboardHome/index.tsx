import React, { useEffect } from "react";
import {
  PrimaryButton,
  SecondaryButton,
} from "../../../components/common/Button";
import {
  Card,
  CardIcon,
  CardBody,
  CardHeader,
} from "../../../components/common/Card";
import MintCoin from "../../../assets/images/mint-coin.svg";
import LockCoin from "../../../assets/images/lock-coin.svg";
import LaunchCoin from "../../../assets/images/launch-coin.svg";
import { lists } from "../LaunchPad/Lists/demo-data";
import { Link } from "react-router-dom";
import { LaunchPadCard } from "../../../components/layout/LaunchComponent/LaunchPadCard";
import useAppState from "../../../context/appStateContext/useAppState";

import useContracts from "../../../context/contractContext/useContracts";

const DashboardHome = () => {
  const { FireSalesRouterContract } = useContracts();
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
  console.log(salesState);
  return (
    // <div>davik</div>
    <div className="pt-28">
      <div className="pb-20 ">
        <h3 className="text-2xl md:text-4xl font-black mb-5">
          The Leading Launchpad Protocol For Everyone
        </h3>
        <p style={{ marginBottom: "1.2rem" }}>
          We are the community's launchpad where projects are free to innovate,
          experiment and launch their project in a purely permissionless
          ecosystem with no gatekeepers and no whales. We are the breath of
          fresh air in the world of blockchain launchpads.
        </p>
        <p>
          Current solutions all foster innovation on a specific blockchain, but
          they also look and operate the same. Fueling innovation in this
          industry requires the removal of all intermediaries and gatekeepers.
          Additionally, there is a need for more transparency, automated
          processes, and post-launch support.
        </p>
        <div className="space-x-4 mt-10 text-center">
          <Link to="/app/launchpad/create">
            <PrimaryButton style={{ marginBottom: "1.2rem" }}>
              Create Launchpad
            </PrimaryButton>
          </Link>
          <Link to="/app/launchpad/lists">
            <SecondaryButton>View Sales</SecondaryButton>
          </Link>
        </div>
      </div>

      {/* <div className="pb-20 grid grid-cols-1 md:grid-cols-3 mt-10 gap-5">
        <Card className="text-left flex justify-between items-center">
          <div>
            <h3>Total Liquidity</h3>
            <p className="font-bold text-3xl">$1,000</p>
          </div>
          <CardIcon>
            <i className="las la-dollar-sign"></i>
          </CardIcon>
        </Card>
        <Card className="text-left flex justify-between items-center">
          <div>
            <h3>Projects Launched</h3>
            <p className="font-bold text-3xl">12,000</p>
          </div>
          <CardIcon>
            <i className="las la-rocket"></i>
          </CardIcon>
        </Card>
        <Card className="text-left flex justify-between items-center">
          <div>
            <h3>Upcoming Launches</h3>
            <p className="font-bold text-3xl">500</p>
          </div>
          <CardIcon>
            <i className="las la-hourglass-start"></i>
          </CardIcon>
        </Card>
      </div> */}

      <div className="py-20">
        <h3 className="font-bold text-3xl text-center">Trending PreSales</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-10 gap-5">
          {salesState.data.slice(0, 3).map((sale: any) => (
            <Link
              to={`/app/launchpad/lists/${sale.saleAddress}`}
              key={sale.saleAddress}
            >
              <LaunchPadCard saleAddress={sale.saleAddress} />
            </Link>
          ))}
        </div>
      </div>

      <div className="py-20 ">
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="font-bold text-3xl">
            The Right Ecosystem For A Successful Project.{" "}
          </h3>
          <p>
            We provide the most secured and advanced tools for the world of
            decentralized finance. Token locker, Launchpad, Fairlaunch and many
            more.
          </p>
        </div>
        <div className="pt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 text-center gap-4">
          <Card>
            <div className="text-center">
              <img className="mx-auto" width={100} src={MintCoin} alt="Mint" />
            </div>
            <div>
              <CardHeader className="my-5">DecentraLaunch Mint</CardHeader>
              <CardBody>
                We provide an easy and reliable way to mint your own token ,
                without the need for prior coding knowledge.
              </CardBody>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <img className="mx-auto" width={100} src={LockCoin} alt="Lock" />
            </div>
            <div>
              <CardHeader className="my-5">DecentraLaunch Lock</CardHeader>
              <CardBody>
                Lock your token on our secure platform, to boost confidence on
                your project.
              </CardBody>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <img
                className="mx-auto"
                width={100}
                src={LaunchCoin}
                alt="Launch"
              />
            </div>
            <div>
              <CardHeader className="my-5">Token Launchpad</CardHeader>
              <CardBody>
                Launch your projects on the blockchain with just a few easy
                clicks.
              </CardBody>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default DashboardHome;
