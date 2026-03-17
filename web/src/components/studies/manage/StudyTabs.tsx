import { useRouter } from "next/router";
import { Asset, Contract } from "@/openapi";
import Button from "../../ui/Button";
import { AlertCircleIcon } from "../../shared/uikitExports";
import { calculateExpiryUrgency } from "../../shared/exports";
import styles from "./StudyTabs.module.css";

type StudyTabsProps = {
  assets: Asset[];
  contracts: Contract[];
};

export default function StudyTabs({ assets, contracts }: StudyTabsProps) {
  const router = useRouter();
  const tab = (router.query.tab as string) ?? "study";
  const setTab = (newTab: string) =>
    router.push({ query: { ...router.query, tab: newTab } }, undefined, { shallow: true });

  const assetsNeedAttention = assets.some((asset) => asset.requires_contract && asset.contract_ids.length === 0);

  const contractsNeedAttention = contracts.some((contract) => {
    const urgency = calculateExpiryUrgency(new Date(contract.expiry_date));
    return urgency !== null && urgency.level !== "low";
  });

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
