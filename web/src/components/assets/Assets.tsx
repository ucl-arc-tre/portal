import { useState } from "react";
import { Asset, AssetBase, getStudiesByStudyIdAssets, postStudiesByStudyIdAssets, Study } from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";
import { useAuth } from "@/hooks/useAuth";

import AssetCreationForm from "./AssetCreationForm";
import Button from "@/components/ui/Button";
import AssetCard from "./AssetCard";

import styles from "./Assets.module.css";
import Callout from "../ui/Callout";
import InfoTooltip from "../ui/InfoTooltip";
import { AlertMessage, Alert } from "../shared/uikitExports";

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

  const [error, setError] = useState<string | null>(null);
  const [showAssetForm, setShowAssetForm] = useState(false);

  const handleAssetSubmit = async (assetData: AssetFormData) => {
    setError(null);

    const response = await postStudiesByStudyIdAssets({
      path: { studyId: study.id },
      body: assetData as AssetBase,
    });

    if (!response.response.ok) {
      const errorMsg = extractErrorMessage(response);
      throw new Error(errorMsg);
    }

    // Refresh assets list after successful creation
    const updatedAssetsResult = await getStudiesByStudyIdAssets({ path: { studyId: study.id } });
    if (!updatedAssetsResult.response.ok || !updatedAssetsResult.data) {
      const errorMsg = extractErrorMessage(updatedAssetsResult);
      setError(`Failed to refresh asset list: ${errorMsg}`);
      return;
    }

    setAssets(updatedAssetsResult.data);
    setShowAssetForm(false);
  };

  return (
    <section className={styles["study-assets-container"]} data-cy="study-assets">
      <h2 className="subtitle">Asset Management</h2>

      {error && (
        <Alert type="error">
          <AlertMessage>{error}</AlertMessage>
        </Alert>
      )}

      {canModify && (
        <Callout definition>
          <div className={styles["callout-section"]}>Use this section to view and add assets linked to your study.</div>

          <div className={styles["callout-info-paragraph"]}>
            Assets are any kind of data or information entity (e.g. consent forms, physical study materials etc.). They
            are owned by a <strong>study</strong>{" "}
            <InfoTooltip text="Studies are a top level entity that can contain own and projects" /> and can belong to{" "}
            <strong>projects</strong> <InfoTooltip text="Projects are owned by a study and can contain assets" />.
          </div>

          <div className={styles["callout-glossary-section"]}>
            You can read more detailed information about assets in our
            <Button href="/glossary" variant="tertiary" size="small" inline>
              Glossary
            </Button>
            and the{" "}
            <a
              href="http://www.nationalarchives.gov.uk/documents/information-management/information-assets-factsheet.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              The National Archives guide on information assets.
            </a>
          </div>
        </Callout>
      )}

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
            <span>Assets for this study:</span>
            <span className={styles["assets-count-badge"]}>{assets.length}</span>
          </div>

          {canModify && (
            <>
              <div className={styles["asset-actions"]}>
                <Button onClick={() => setShowAssetForm(!showAssetForm)} variant="secondary" data-cy="add-asset-button">
                  {showAssetForm ? "Cancel" : "Add Asset"}
                </Button>
              </div>

              {showAssetForm && (
                <AssetCreationForm handleAssetSubmit={handleAssetSubmit} closeModal={() => setShowAssetForm(false)} />
              )}
            </>
          )}

          <div className={styles["assets-grid"]}>
            {assets.map((asset) => (
              <AssetCard key={asset.id} studyId={study.id} asset={asset} canModify={canModify} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
