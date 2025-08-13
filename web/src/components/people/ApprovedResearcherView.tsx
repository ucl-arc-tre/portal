import Callout from "../ui/Callout";
import ExternalInvite from "./ExternalInvite";
import styles from "./ApprovedResearcherView.module.css";

export default function ApprovedResearcherView({ isIAO }: { isIAO: boolean }) {
  return (
    <>
      {isIAO && (
        <div className={styles["button-container"]}>
          <ExternalInvite />
        </div>
      )}
      <Callout construction />
      {/* rest of content to be implemented once project logic has been done */}
    </>
  );
}
