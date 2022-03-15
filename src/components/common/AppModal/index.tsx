import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import styled from "styled-components";
import { useApptheme } from "../../AppThemeProvider";

export const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    // height: "fit-content",
    height: "70%",
    width: "90%",
    maxWidth: "540px",
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    padding: "0",
  },
  overlay: {
    background: "rgba(0, 0, 0, 0.3)",
  },
};

const ModalContent = styled.div.attrs(() => ({
  className: `w-full h-full relative`,
}))`
  background: ${(props) => props.theme.colors.secondaryBackground};
  overflow-y: auto;

  padding: 2rem;
  padding-top: 1rem;
`;

ReactModal.setAppElement("#root");

export const AppModal = ({
  children,
  modalIsOpen,
  closeModal,
}: {
  children: React.ReactNode;
  modalIsOpen: boolean;
  closeModal: () => void;
}) => {

  const {themeMode} = useApptheme()
  return (
    <ReactModal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Application Modal"
    >
      <ModalContent>{children}</ModalContent>
    </ReactModal>
  );
};
