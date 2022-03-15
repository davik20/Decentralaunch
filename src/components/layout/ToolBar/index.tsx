import React, { useContext, useState } from "react";
import styled from "styled-components";
import {
  SidebarContext,
  SideBarContextType,
} from "../../../context/sidebarcontext";
import { MenuItem } from "@szhsin/react-menu";
import { AppModal } from "../../common/AppModal";
import { ModalContent } from "../../common/AppModal/ModalContent";
import { ModalHeader } from "../../common/AppModal/ModalHeader";
import { IconButton, SecondaryButton } from "../../common/Button";
import { AppMenu, AppsMenu } from "../../common/Menu";
import Toggler from "../../common/Toggler";
import BinanceLogo from "./images/binance-logo.svg";
import EthLogo from "./images/eth-logo.svg";
import PolygonLogo from "./images/polygon-logo.png";
import RopstenLogo from "./images/ropsten-logo.png";
import MetamaskLogo from "./images/metamask.svg";
import WalletConnect from "./images/walletconnect-logo.svg";
import DisconnectDark from "./images/disconnectDark.svg";
import DisconnectLight from "./images/disconnectLight.svg";
import LinkLogo from "./images/Link.png";

import CoinbaseLogo from "./images/coinbase-wallet.svg";
import useConnection from "../../../context/connectionContext/useConnection";
import { useDarkMode } from "../../AppThemeProvider/useDarkMode";
import { shortenAddress } from "../../../utils";
import LogoImg from "../../../assets/images/logo.png";
import { useApptheme } from "../../AppThemeProvider";

{
  /* <div className="hidden md:block">
<SecondaryButton onClick={() => setModalOpen(true)} size="small">
  Networks
</SecondaryButton>
</div> */
}
interface IStyledToolbar {
  className?: string;
  isOpen?: boolean;
}

const ToolBarContainer = styled.div.attrs<IStyledToolbar>(() => ({
  className: `z-10 py-3 px-4 sm:pl-6 sm:pr-10 shadow flex justify-between items-center space-x-4`,
}))<IStyledToolbar>`
  background: ${(props) => props.theme.colors.secondaryBackground};
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
`;

const NetworkSelector = styled.button.attrs(() => ({
  className: `w-full flex items-center space-x-3 py-3 pl-3 my-2 rounded-lg font-bold z-50`,
}))`
  transition: all 0.3s ease;
  border: 1px solid ${(props) => props.theme.colors.primaryText}50;

  &:hover {
    box-shadow: 0 10px 17px hsl(0deg 0% 39% / 10%);
    background: ${(props) => props.theme.colors.secondaryRed};
  }
`;

const ToolBar = () => {
  const { toggleSidebar } = useContext<SideBarContextType>(SidebarContext);
  const [modalIsOpen, setModalOpen] = useState(false);
  const onModalClose = () => setModalOpen(false);
  const {
    connectWallet,
    account,
    disconnectWallet,
    connectModalOpen,
    setConnectModalOpen,
    chainIdError,
  } = useConnection();
  const { theme } = useDarkMode();
  const { themeMode } = useApptheme();

  const handleConnectWallet = (wallet: string) => {
    connectWallet(wallet);
    setConnectModalOpen(false);
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setConnectModalOpen(false);
  };

  return (
    <ToolBarContainer>
      <div className="flex items-center w-1/2 space-x-3">
        <div className="justify-end">
          <button onClick={toggleSidebar}>
            <i className="las la-bars text-3xl"></i>
          </button>
        </div>
        <h3 className="hidden sm:block font-black text-xl">Decentra Launch</h3>
      </div>
      <div className="flex space-x-4 w-1/2 items-center justify-end">
        <div>
          <IconButton>
            <i className="lab la-telegram-plane"></i>
          </IconButton>
        </div>
        <div>
          <Toggler />
        </div>

        <IconButton
          onClick={() => setModalOpen(true)}
          className="block md:hidden"
        >
          <i className="lab la-buffer"></i>
        </IconButton>
        {/* <SecondaryButton size="small">Connect</SecondaryButton> */}
        <AppMenu
          align="end"
          transition
          menuButton={
            <SecondaryButton
              onClick={() => setConnectModalOpen(true)}
              size="small"
            >
              {!account && "Connect"}
              {account && !chainIdError && shortenAddress(account)}
              {account && chainIdError ? (
                <div style={{ color: themeMode.colors.primaryRed }}>
                  Invalid Network
                </div>
              ) : (
                ""
              )}
            </SecondaryButton>
          }
        ></AppMenu>
      </div>
      <div>
        <AppModal modalIsOpen={modalIsOpen} closeModal={onModalClose}>
          <ModalHeader text="Select Network" onModalClose={onModalClose} />
          <ModalContent>
            <NetworkSelector>
              <img src={PolygonLogo} alt="B" width={50} />
              <span>Cronos</span>
            </NetworkSelector>
            <div className="my-3 py-4 px-3 font-bold bg-custom-light-primaryBackground dark:bg-custom-dark-primaryBackground">
              <h3>Testnets</h3>
            </div>
            <NetworkSelector>
              <img src={RopstenLogo} alt="B" width={50} />
              <span>Ropsten</span>
            </NetworkSelector>
            <NetworkSelector>
              <img src={BinanceLogo} alt="B" width={50} />
              <span>Cronos Testnet</span>
            </NetworkSelector>
          </ModalContent>
        </AppModal>
        <AppModal
          modalIsOpen={connectModalOpen}
          closeModal={() => setConnectModalOpen(false)}
        >
          <ModalHeader
            text="Wallet"
            onModalClose={() => setConnectModalOpen(false)}
          />
          <ModalContent style={{ minHeight: "50vh" }}>
            {!account && (
              <>
                <NetworkSelector
                  onClick={(e) => {
                    handleConnectWallet("injected");
                  }}
                >
                  <img src={MetamaskLogo} alt="B" width={50} />
                  <span>Metamask</span>
                </NetworkSelector>
                <NetworkSelector
                  onClick={(e) => {
                    handleConnectWallet("walletConnect");
                  }}
                  style={{ paddingTop: "1.2rem", paddingBottom: "1.2rem" }}
                >
                  <img src={WalletConnect} alt="B" width={50} />
                  <span>Wallet Connect</span>
                </NetworkSelector>
              </>
            )}
            {account && (
              <NetworkSelector
                style={{ marginTop: "2rem" }}
                onClick={(e) => {
                  handleDisconnectWallet();
                }}
              >
                <img src={theme == "dark" ? LinkLogo : LinkLogo} width="50" />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <span>{shortenAddress(account)}</span>
                  <span style={{ color: themeMode.colors.primaryRed }}>
                    Disconnect Wallet
                  </span>
                </div>
              </NetworkSelector>
            )}
          </ModalContent>
        </AppModal>
      </div>
    </ToolBarContainer>
  );
};

export default ToolBar;
