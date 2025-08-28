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

import styles from "./StudyAssets.module.css";

type StudyAssetsProps = {
  studyId: string;
  studyTitle: string;
  setAssetManagementCompleted?: (completed: boolean) => void;
};

export default function StudyAssets(props: StudyAssetsProps) {
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
        console.log(studyAssetResult);

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
    console.log("Creating asset:", assetData);

    setError(null);

    const response = await postStudiesByStudyIdAssets({
      path: { studyId },
      body: assetData as AssetBase,
    });

    console.log("asset creation response:", response);

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

      {studyAssets.length === 0 ? (
        <div>
          <p className={styles["no-assets-message"]}>
            No assets found for this study. You need to create at least one asset to continue.
          </p>

          <AssetCreationForm handleAssetSubmit={handleAssetSubmit} />
        </div>
      ) : (
        <div>
          <p>Assets for this study ({studyAssets.length} found):</p>
          <ul>
            {studyAssets.map((asset, index) => (
              <li key={index}>
                <strong>{asset.title}</strong> - {asset.description}
              </li>
            ))}
          </ul>

          <div className={styles["asset-actions"]}>
            <Button onClick={() => setShowAssetForm(!showAssetForm)} variant="secondary">
              {showAssetForm ? "Cancel" : "Create Another Asset"}
            </Button>
          </div>

          {showAssetForm && <AssetCreationForm handleAssetSubmit={handleAssetSubmit} />}
        </div>
      )}
    </section>
  );
}
