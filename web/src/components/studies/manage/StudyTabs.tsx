import Button from "../../ui/Button";
import { AlertCircleIcon } from "../../shared/uikitExports";
import styles from "./StudyTabs.module.css";

type StudyTabsProps = {
  tab: string;
  setTab: (tab: string) => void;
  assetsNeedAttention: boolean;
  contractsNeedAttention: boolean;
};

export default function StudyTabs({ tab, setTab, assetsNeedAttention, contractsNeedAttention }: StudyTabsProps) {
  return (
    <div className={"tab-collection"}>
      <Button onClick={() => setTab("study")} variant="secondary" className={`tab ${tab === "study" ? "active" : ""}`}>
        Study Overview
      </Button>

      <Button
        onClick={() => setTab("assets")}
        variant="secondary"
        className={`tab ${tab === "assets" ? "active" : ""}`}
      >
        Assets {assetsNeedAttention && <AlertCircleIcon className={styles["needs-attention"]} />}
      </Button>

      <Button
        onClick={() => setTab("contracts")}
        variant="secondary"
        className={`tab ${tab === "contracts" ? "active" : ""}`}
      >
        Contracts {contractsNeedAttention && <AlertCircleIcon className={styles["needs-attention"]} />}
      </Button>
    </div>
  );
}
