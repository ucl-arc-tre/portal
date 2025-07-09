import { useState } from "react";
import Button from "@/components/ui/Button";
import AssetForm from "./AssetForm";
import StudySelection from "./StudySelection";
import styles from "./Assets.module.css";

type AssetFormData = {
  title: string;
  description: string;
  classification_impact: number;
  location: string;
  is_active: boolean;
};

type AssetsProps = {
  studies: Study[];
};

export default function Assets(props: AssetsProps) {
  const { studies } = props;

  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);

  const handleAssetSubmit = async (data: AssetFormData) => {
    // TODO: Implement API call to create asset
    console.log("Asset data:", { ...data, studyId: selectedStudy?.id });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // const response = await createAsset({ ...data, studyId: selectedStudy?.id });
    // if (!response.ok) throw new Error('Failed to create asset');
  };

  if (!selectedStudy) {
    return <StudySelection studies={studies} setSelectedStudy={setSelectedStudy} />;
  }

  return (
    <>
      <div className={styles.selectedStudyHeader}>
        <div className={styles.studyBreadcrumb}>
          <span>
            Study: <strong>{selectedStudy?.title}</strong>
          </span>

          <Button variant="tertiary" size="small" onClick={() => setSelectedStudy(null)}>
            Change Study
          </Button>
        </div>
      </div>

      <AssetForm onSubmit={handleAssetSubmit} setSelectedStudy={setSelectedStudy} />
    </>
  );
}
