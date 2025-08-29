import { useEffect, useState } from "react";
import {
  Asset,
  AssetBase,
  AssetCreateValidationError,
  getStudiesByStudyIdAssets,
  postStudiesByStudyIdAssets,
} from "@/openapi";

import AssetCreationForm from "./AssetCreationForm";
import Button from "@/components/ui/Button";
import AssetCard from "./AssetCard";

import styles from "./Assets.module.css";
import Callout from "../ui/Callout";
import InfoTooltip from "../ui/InfoTooltip";

type StudyAssetsProps = {
  studyId: string;
  studyTitle: string;
  setAssetManagementCompleted?: (completed: boolean) => void;
};

export default function Assets(props: StudyAssetsProps) {
  const { studyId, studyTitle, setAssetManagementCompleted } = props;

  const [studyAssets, setStudyAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssetForm, setShowAssetForm] = useState(false);

  useEffect(() => {
    const fetchStudyAssetData = async () => {
      setIsLoading(true);

      try {
        setError(null);

        const studyAssetResult = await getStudiesByStudyIdAssets({ path: { studyId } });

        if (studyAssetResult.response.status === 200 && studyAssetResult.data) {
          setStudyAssets(studyAssetResult.data);

          if (studyAssetResult.data.length > 0) {
            if (setAssetManagementCompleted) {
              setAssetManagementCompleted(true);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load study assets:", err);
        setError("Failed to load study assets. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudyAssetData();
  }, [studyId, setAssetManagementCompleted]);

  const handleAssetSubmit = async (assetData: AssetFormData) => {
    setError(null);

    const response = await postStudiesByStudyIdAssets({
      path: { studyId },
      body: assetData as AssetBase,
    });

    if (response.error) {
      const errorData = response.error as AssetCreateValidationError;
      if (errorData?.error_message) {
        throw new Error(errorData.error_message);
      }
    }

    // Refresh assets list after successful creation
    const updatedAssetsResult = await getStudiesByStudyIdAssets({ path: { studyId } });
    if (updatedAssetsResult.response.status === 200 && updatedAssetsResult.data) {
      setStudyAssets(updatedAssetsResult.data);
      if (setAssetManagementCompleted) {
        setAssetManagementCompleted(true);
      }
      setShowAssetForm(false);
    }
  };

  if (isLoading) return null;

  return (
    <section className={styles["study-assets-container"]} data-cy="study-assets">
      <h2 className="subtitle">Study Assets for study: {studyTitle}</h2>

      {error && (
        <div className={styles["error-message"]}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <Callout definition>
        <div className={styles["callout-section"]}>Use this form to create assets linked to your study.</div>

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

      {studyAssets.length === 0 ? (
        <AssetCreationForm handleAssetSubmit={handleAssetSubmit} closeModal={() => {}} />
      ) : (
        <div>
          <div className={styles["assets-summary"]}>
            <span>Assets for this study:</span>
            <span className={styles["assets-count-badge"]}>{studyAssets.length}</span>
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
            {studyAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
