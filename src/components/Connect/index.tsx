import React from "react";
import { connect } from "tls";
import useConnection from "../../context/connectionContext/useConnection";
import { PrimaryButton } from "../common/Button";

type Props = {};

const Connect = (props: Props) => {
  const { connectWallet, setConnectModalOpen, chainIdError } = useConnection();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        border: "1px solid rgba(255,255,255, .2)",
        padding: "2rem",
        borderRadius: "1.1rem",
      }}
    >
      {chainIdError ? <p style={{ fontSize: "1.2rem" }}>Chain not supported</p>  : <p style={{ fontSize: "1.2rem" }}>Connect your wallet to view content</p>}
      <PrimaryButton
        onClick={() => setConnectModalOpen(true)}
        style={{ marginTop: "1rem" }}
      >
        Connect Wallet
      </PrimaryButton>
    </div>
  );
};

export default Connect;
