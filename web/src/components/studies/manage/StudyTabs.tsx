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

  const assetsNeedAttention = assets.some((asset) => {
    if (asset.requires_contract && asset.contract_ids.length === 0) return true;
    if (asset.expires_at) {
      const urgency = calculateExpiryUrgency(new Date(asset.expires_at));
      if (urgency !== null && urgency.level !== "low") return true;
    }
    return false;
  });

  const contractsNeedAttention = contracts.some((contract) => {
    const urgency = contract.expiry_date ? calculateExpiryUrgency(new Date(contract.expiry_date)) : null;
    return urgency !== null && urgency.level !== "low";
  });

  return (
    <div className={"tab-collection"}>
      <Button
        onClick={() => setTab("study")}
        variant="secondary"
        className={`tab ${tab === "study" ? "active" : ""}`}
        cy="study-overview"
      >
        Study Overview
      </Button>

      <Button
        onClick={() => setTab("assets")}
        variant="secondary"
        className={`tab ${tab === "assets" ? "active" : ""}`}
        cy="study-assets"
      >
        Assets {assetsNeedAttention && <AlertCircleIcon className={styles["needs-attention"]} />}
      </Button>

      <Button
        onClick={() => setTab("contracts")}
        variant="secondary"
        className={`tab ${tab === "contracts" ? "active" : ""}`}
        cy="study-contracts"
      >
        Contracts {contractsNeedAttention && <AlertCircleIcon className={styles["needs-attention"]} />}
      </Button>
    </div>
  );
}
