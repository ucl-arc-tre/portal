import { useCallback, useEffect, useState } from "react";
import {
  Asset,
  AssetBase,
  ValidationError,
  getStudiesByStudyIdAssets,
  getStudiesByStudyIdAssetsByAssetIdContracts,
  postStudiesByStudyIdAssets,
} from "@/openapi";

import AssetCreationForm from "./AssetCreationForm";
import Button from "@/components/ui/Button";
import AssetCard from "./AssetCard";

import styles from "./Assets.module.css";
import Callout from "../ui/Callout";
import InfoTooltip from "../ui/InfoTooltip";

type InformationAssetsProps = {
  studyId: string;
  studyTitle: string;
  setAssetManagementCompleted?: (completed: boolean) => void;
};

export default function Assets(props: InformationAssetsProps) {
  const { studyId, studyTitle, setAssetManagementCompleted } = props;

  const [informationAssets, setInformationAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssetForm, setShowAssetForm] = useState(false);

  const checkAssetManagementCompleted = useCallback(
    async (assets: Asset[]) => {
      // for each asset, check if it requires a contract and if it does, that there is one

      const checkContractsForAsset = async (assetId: string) => {
        const response = await getStudiesByStudyIdAssetsByAssetIdContracts({
          path: { studyId: studyId, assetId: assetId },
        });
        if (!response.response.ok) {
          console.error("Failed to get contracts for asset:", response.error);
        } else if (response.response.ok && response.data) {
          return response.data.length > 0;
        }
      };

      const assetsRequiringContracts = assets.filter((asset) => asset.requires_contract);
      const requiredContractChecks = assetsRequiringContracts.map((asset) => checkContractsForAsset(asset.id));
      const results = await Promise.all(requiredContractChecks);
      return results.every((hasContract) => hasContract);
    },
    [studyId]
  );

  useEffect(() => {
    const fetchInformationAssetData = async () => {
      setIsLoading(true);

      try {
        setError(null);

        const informationAssetResult = await getStudiesByStudyIdAssets({ path: { studyId } });

        if (informationAssetResult.response.status === 200 && informationAssetResult.data) {
          setInformationAssets(informationAssetResult.data);

          if (informationAssetResult.data.length > 0) {
            const assets = informationAssetResult.data;
            const assetsComplete = await checkAssetManagementCompleted(assets);

            if (setAssetManagementCompleted && assetsComplete) {
              setAssetManagementCompleted(true);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load Information Assets:", err);
        setError("Failed to load Information Assets. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInformationAssetData();
  }, [studyId, setAssetManagementCompleted, checkAssetManagementCompleted]);

  const handleAssetSubmit = async (assetData: AssetFormData) => {
    setError(null);

    const response = await postStudiesByStudyIdAssets({
      path: { studyId },
      body: assetData as AssetBase,
    });

    if (response.error) {
      const errorData = response.error as ValidationError;
      if (errorData?.error_message) {
        throw new Error(errorData.error_message);
      }
    }

    // Refresh assets list after successful creation
    const updatedAssetsResult = await getStudiesByStudyIdAssets({ path: { studyId } });
    if (updatedAssetsResult.response.status === 200 && updatedAssetsResult.data) {
      setInformationAssets(updatedAssetsResult.data);
      const assets = updatedAssetsResult.data;
      const assetsComplete = await checkAssetManagementCompleted(assets);

      if (setAssetManagementCompleted && assetsComplete) {
        setAssetManagementCompleted(true);
      }
      setShowAssetForm(false);
    }
  };

  if (isLoading) return null;

  return (
    <section className={styles["study-assets-container"]} data-cy="study-assets">
      <h2 className="subtitle">Assets for Study: {studyTitle}</h2>

      {error && (
        <div className={styles["error-message"]}>
          <strong>Error:</strong> {error}
        </div>
      )}

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

      {informationAssets.length === 0 ? (
        <div>
          <div className={styles["no-assets-message"]}>
            <p>No assets have been created for this study yet.</p>
            <Button onClick={() => setShowAssetForm(true)} variant="primary">
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
            <span className={styles["assets-count-badge"]}>{informationAssets.length}</span>
          </div>

          <div className={styles["asset-actions"]}>
            <Button onClick={() => setShowAssetForm(!showAssetForm)} variant="secondary">
              {showAssetForm ? "Cancel" : "Add Asset"}
            </Button>
          </div>

          {showAssetForm && (
            <AssetCreationForm handleAssetSubmit={handleAssetSubmit} closeModal={() => setShowAssetForm(false)} />
          )}

          <div className={styles["assets-grid"]}>
            {informationAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                studyId={studyId}
                asset={asset}
                checkCompleted={checkAssetManagementCompleted}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
