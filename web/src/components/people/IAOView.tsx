import Callout from "../ui/Callout";
import ExternalInvite from "./ExternalInvite";
import styles from "./IAOView.module.css";

export default function IAOView() {
  return (
    <>
      <div className={styles["button-container"]}>
        <ExternalInvite />
      </div>
      <Callout construction />
      {/* rest of content to be implemented once project logic has been done */}
    </>
  );
}
