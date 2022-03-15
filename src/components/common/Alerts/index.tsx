import Swal, { SweetAlertIcon, SweetAlertPosition } from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const Alert = ({
  title,
  message,
  icon,
  iconHtml,
  iconColor,
  confirmButtonText,
  confirmButtonColor,
  showCancelButton,
  cancelButtonText,
  cancelButtonColor,
  showConfirmButton = true,
  position,
  width,
}: {
  title: string;
  message?: string | HTMLElement | JQuery | undefined;
  icon?: SweetAlertIcon;
  iconHtml?: string;
  iconColor?: string;
  confirmButtonText?: string;
  confirmButtonColor?: string;
  showCancelButton?: boolean;
  cancelButtonText?: string;
  cancelButtonColor?: string;
  showConfirmButton?: boolean;
  position?: SweetAlertPosition;
  width?: string | number;
}) => {
  const theme = window.localStorage.getItem("theme");
  return MySwal.fire({
    title: title,
    html: message,
    background: `${theme === "dark" ? "#121C21" : "#ffffff"}`,
    color: `${theme === "dark" ? "#ffffff" : "#4f4f4f"}`,
    icon: icon,
    iconHtml: iconHtml,
    iconColor: iconColor,
    confirmButtonText: confirmButtonText || "✔️ Okay",
    confirmButtonColor: confirmButtonColor,
    showCancelButton: showCancelButton,
    cancelButtonText: cancelButtonText || "❌ Cancel",
    cancelButtonColor: cancelButtonColor,
    showConfirmButton: showConfirmButton,
    position: position,
    width: width,
  });
};
