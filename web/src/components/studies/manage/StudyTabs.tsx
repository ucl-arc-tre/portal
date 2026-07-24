import { Asset, Contract } from "@/openapi";
import { calculateExpiryUrgency } from "../../shared/exports";
import TabCollection from "@/components/shared/TabCollection";

type StudyTabsProps = {
  assets: Asset[];
  contracts: Contract[];
};

export default function StudyTabs({ assets, contracts }: StudyTabsProps) {
  const assetsNeedAttention = assets.some((asset) => {
    if (asset.requires_contract && asset.contract_ids.length === 0) return true;
    if (asset.status === "active" && asset.expires_at) {
      const urgency = calculateExpiryUrgency(new Date(asset.expires_at));
      if (urgency !== null && urgency.level !== "low") return true;
    }
    return false;
  });

  const contractsNeedAttention = contracts.some((contract) => {
    const urgency =
      contract.status === "active" && contract.expiry_date
        ? calculateExpiryUrgency(new Date(contract.expiry_date))
        : null;
    return urgency !== null && urgency.level !== "low";
  });

  return (
    <TabCollection
      tabs={[
        { name: "study", label: "Study Overview" },
        { name: "assets", needsAttention: assetsNeedAttention },
        { name: "contracts", needsAttention: contractsNeedAttention },
      ]}
    />
  );
}
