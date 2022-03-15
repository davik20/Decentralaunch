import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { allTerms } from "../../constants";
import { useApptheme } from "../AppThemeProvider";
import { AppModal } from "../common/AppModal";
import { DangerButton, PrimaryButton, SecondaryButton } from "../common/Button";

type Props = { setShowContent: any; showContent: boolean };

function Terms({ setShowContent, showContent }: Props) {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const { themeMode } = useApptheme();
  const [agree, setAgree] = useState(() => allTerms);

  useEffect(() => {
    if (localStorage.getItem("termsAgreed") === "true") {
      setShowContent(true);
    } else {
      setTimeout(() => {
        setShowTermsModal(true);
      }, 500);
    }
  }, []);

  const handleSubmit = () => {
    console.log("Your button was clicked and is now disabled");

    let hasAgreed = agree.map((item: any) => {
      console.log(item);
      if (item.isChecked == false) {
        return false;
      } else {
        return true;
      }
    });

    if (hasAgreed.includes(false)) {
      return toast.error("Please check all boxes");
    }
    setShowTermsModal(false);
    setShowContent(true);
    localStorage.setItem("termsAgreed", "true");
    //if allselect is true,
    //setenable for button is true which would mean that the display for next modal shoud appper showContent else
    //setdisabled(true)
  };

  const handleChange = (e: any) => {
    const { name, checked } = e.target;
    if (name === "allSelect") {
      let tempAgree = agree.map((agreed) => {
        return { ...agreed, isChecked: checked };
      });
      setAgree(tempAgree);
    } else {
      let tempAgree = agree.map((agreed) =>
        agreed.name === name ? { ...agreed, isChecked: checked } : agreed
      );
      setAgree(tempAgree);
    }
  };
  return (
    <>
      <AppModal
        modalIsOpen={showTermsModal}
        closeModal={() => setShowTermsModal(false)}
      >
        <>
          <div className="" style={{}}>
            <form className="form">
              <h3 style={{ margin: "1rem", fontSize: "1.3rem" }}>Disclaimer</h3>{" "}
              <hr />
              <h3
                style={{
                  margin: "1rem",
                  marginBottom: "1.3rem",
                  fontSize: ".9rem",
                  color: themeMode.colors.primaryRed,
                }}
              >
                Please read the Terms and Conditions, agree to all the following
                to proceed!
              </h3>
              {agree.map((agreed: any) => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "1.2rem",
                    fontSize: "1rem",
                  }}
                  className="form-check"
                >
                  <input
                    style={{ marginRight: "1.3rem" }}
                    type="checkbox"
                    className="form-check-input"
                    name={agreed.name}
                    checked={agreed?.isChecked || false}
                    onChange={handleChange}
                  />
                  <label
                    style={{ fontSize: ".7rem" }}
                    className="form-check-label ms-2"
                  >
                    {agreed.name}
                  </label>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1.4rem",
                  fontSize: "1rem",
                }}
                className="form-check"
              >
                <input
                  style={{ marginRight: "1.3rem" }}
                  className="form-check-input"
                  type="checkbox"
                  name="allSelect"
                  onChange={handleChange}
                />
                <label
                  style={{ fontSize: ".7rem" }}
                  className="form-check-label ms-2"
                >
                  Agree to all{" "}
                </label>
              </div>
              <div className="btn" style={{ marginTop: "2rem" }}>
                <SecondaryButton
                  size="small"
                  style={{ marginRight: "1.4rem" }}
                  onClick={() => setShowTermsModal(false)}
                >
                  CANCEL
                </SecondaryButton>
                <PrimaryButton
                  size="small"
                  type="button"
                  onClick={handleSubmit}
                >
                  CONFIRM
                </PrimaryButton>
              </div>
            </form>
          </div>
          {/* <button
          onClick={() => {
            setShowTermsModal(false);
            setShowContent(true);
          }}
        >
          Accept terms
        </button> */}
        </>
      </AppModal>

      {!showContent && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <p>
            {" "}
            Please{" "}
            <button onClick={() => setShowTermsModal(true)}>
              {" "}
              <span style={{ color: themeMode.colors.primaryRed }}>
                click here{" "}
              </span>
            </button>{" "}
            to view terms and conditions.
          </p>
        </div>
      )}
    </>
  );
}

export default Terms;
