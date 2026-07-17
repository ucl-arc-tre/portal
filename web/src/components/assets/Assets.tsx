import { useState } from "react";
import { Asset, AssetBase, getStudiesByStudyIdAssets, postStudiesByStudyIdAssets, Study } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import { useAuth } from "@/hooks/useAuth";

import AssetCreationForm from "./AssetCreationForm";
import Button from "@/components/ui/Button";
import AssetCard from "./AssetCard";

import styles from "./Assets.module.css";
import { InfoIcon } from "../shared/uikitExports";
import Box from "../ui/Box";
import Error from "../ui/Error";
import { AssetDefinition } from "../shared/entityDefinitions";

type AssetsProps = {
  study: Study;
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
};

export default function Assets(props: AssetsProps) {
  const { study, assets, setAssets } = props;
  const { userData } = useAuth();
  const canModify =
    (userData?.roles.includes("information-asset-owner") && study.owner_username === userData?.username) ||
    (!!userData && study.additional_study_admin_usernames.includes(userData.username)) ||
    false;
  const [infoCalloutExpanded, setInfoCalloutExpanded] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [showAssetForm, setShowAssetForm] = useState(false);

  const handleAssetSubmit = async (assetData: AssetFormData) => {
    setError(null);

    const response = await postStudiesByStudyIdAssets({
      path: { studyId: study.id },
      body: assetData as AssetBase,
    });

    if (responseIsError(response)) {
      const errorMsg = extractErrorMessage(response);
      throw new Error(errorMsg);
    }

    // Refresh assets list after successful creation
    const updatedAssetsResult = await getStudiesByStudyIdAssets({ path: { studyId: study.id } });
    if (responseIsError(updatedAssetsResult) || !updatedAssetsResult.data) {
      const errorMsg = extractErrorMessage(updatedAssetsResult);
      setError(`Failed to refresh asset list: ${errorMsg}`);
      return;
    }

    setAssets(updatedAssetsResult.data);
    setShowAssetForm(false);
  };

  return (
    <Box>
      <section data-cy="study-assets">
        <div className={styles.header}>
          <h3>
            Asset Management{" "}
            <Button
              onClick={() => setInfoCalloutExpanded(!infoCalloutExpanded)}
              variant="tertiary"
              size="small"
              inline
              aria-label="Toggle asset definition"
            >
              <InfoIcon />
            </Button>
          </h3>
          {canModify && assets.length > 0 && (
            <>
              <Button
                onClick={() => setShowAssetForm(!showAssetForm)}
                variant="secondary"
                size="small"
                data-cy="add-asset-button"
              >
                {showAssetForm ? "Cancel" : "Add Asset"}
              </Button>

              {showAssetForm && (
                <AssetCreationForm handleAssetSubmit={handleAssetSubmit} closeModal={() => setShowAssetForm(false)} />
              )}
            </>
          )}
        </div>
        {error && <Error message={error} />}

        {infoCalloutExpanded && <AssetDefinition />}

        {assets.length === 0 && canModify ? (
          <div>
            <div className={styles["no-assets-message"]}>
              <p>No assets have been created for this study yet.</p>
              <Button onClick={() => setShowAssetForm(true)} variant="primary" data-cy="add-asset-button">
                Add First Asset
              </Button>
            </div>

            {showAssetForm && (
              <AssetCreationForm handleAssetSubmit={handleAssetSubmit} closeModal={() => setShowAssetForm(false)} />
            )}
          </div>
        ) : (
          <div>
            <div className={styles["assets-summary"]}>
              <span>Number of associated Assets:</span>
              <span className={styles["assets-count-badge"]}>{assets.length}</span>
            </div>

            <div className={styles["assets-grid"]}>
              {assets.map((asset) => (
                <AssetCard key={asset.id} studyId={study.id} asset={asset} involvesNHS={study.involves_nhs_england} />
              ))}
            </div>
          </div>
        )}
      </section>
    </Box>
  );
}
