import { useState } from "react";

import AssetForm from "./AssetForm";
import StudySelection from "../studies/StudySelection";
import Button from "@/components/ui/Button";

import styles from "./Assets.module.css";

type AssetFormData = {
  title: string;
  description: string;
  classification_impact: string;
  protection: string;
  legal_basis: string;
  format: string;
  expiry: string;
  location: string[];
  has_dspt: boolean;
  stored_outside_uk_eea: boolean;
  accessed_by_third_parties: boolean;
  status: string;
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
      <div className={styles["selected-study-header"]}>
        <div className={styles["study-breadcrumb"]}>
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
