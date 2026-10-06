import { Asset } from "@/openapi";
import AssetCard from "./AssetCard";
import styles from "./AssetResultsList.module.css";

type Props = {
  assets: Asset[];
};

export default function AssetResultsList(props: Props) {
  const { assets } = props;

  return (
    <div className={styles["asset-selection"]}>
      <div className={styles["asset-list"]}>
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} studyId={asset.study_id} />
        ))}
      </div>
    </div>
  );
}
