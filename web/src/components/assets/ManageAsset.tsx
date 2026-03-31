import { Asset, Contract, Study } from "@/openapi";

import styles from "./ManageAsset.module.css";
import { HelperText } from "../shared/uikitExports";
import ContractCard from "../contracts/ContractCard";

type ManageAssetProps = {
  study: Study;
  asset: Asset;
  contracts: Contract[];
};

export default function ManageAsset(props: ManageAssetProps) {
  const { study, asset, contracts } = props;
  return (
    <>
      <div className={styles["asset-info"]}>
        <div className={styles.section}>
          <h3>Asset Details</h3>
          <div className={styles.field}>
            <label>Title:</label>
            <span>{asset.title}</span>
          </div>
          <div className={styles.field}>
            <label>Description:</label>
            <span>{asset.description}</span>
          </div>
          <div className={styles.field}>
            <label>Classification:</label>
            <span>{asset.classification_impact}</span>
          </div>
          <div className={styles.field}>
            <label>Protection:</label>
            <span>{asset.protection}</span>
          </div>
          <div className={styles.field}>
            <label>Status:</label>
            <span className={styles.status}>{asset.status}</span>
          </div>
          <div className={styles.field}>
            <label>Contract Required:</label>
            <span>{asset.requires_contract ? "Yes" : "No"}</span>
          </div>

          {contracts.length > 0 && (
            <div className={styles.field}>
              <label>
                Associated Contracts:
                <HelperText>
                  <small>
                    To manage contracts, please navigate to the{" "}
                    <a href={`/studies/manage?studyId=${study.id}`}>Study</a> page.
                  </small>
                </HelperText>
              </label>
              <ul>
                {contracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} studyId={study.id} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
