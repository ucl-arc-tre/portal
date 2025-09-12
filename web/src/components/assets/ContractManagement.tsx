import { useState, useRef } from "react";
import Button from "@/components/ui/Button";
import { postStudiesByStudyIdAssetsByAssetIdContractsByContractIdUpload } from "@/openapi";
import { v4 as uuidv4 } from "uuid";
import styles from "./ContractManagement.module.css";

interface ContractManagementProps {
  studyId: string;
  assetId: string;
}

export default function ContractManagement({ studyId, assetId }: ContractManagementProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    setUploadSuccess(false);

    if (!file) {
      setUploadFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setError("File format must be PDF.");
      setUploadFile(null);
      return;
    }

    if (file.size > 1e7) {
      setError("File size must be less than 10MB.");
      setUploadFile(null);
      return;
    }

    setUploadFile(file);
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      setError("Please select a PDF file before uploading.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const generatedContractId = uuidv4();

      const response = await postStudiesByStudyIdAssetsByAssetIdContractsByContractIdUpload({
        path: {
          studyId,
          assetId,
          contractId: generatedContractId,
        },
        body: uploadFile,
      });

      if (!response.response.ok) {
        throw new Error(`Upload failed: ${response.response.status} ${response.response.statusText}`);
      }

      setUploadSuccess(true);
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Failed to upload contract. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setUploadFile(null);
    setError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.container}>
      <h3>Contract Management</h3>
      <p className={styles.description}>
        Upload a PDF contract document for this asset. Only PDF files up to 10MB are accepted.
      </p>

      <div className={styles["upload-section"]}>
        <div className={styles["file-input"]}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className={styles["hidden-input"]}
            id="contract-file-input"
          />
          <label htmlFor="contract-file-input" className={styles["file-label"]}>
            <div className={styles["upload-icon"]}>📄</div>
            <span>Choose PDF file or drag and drop</span>
          </label>
        </div>

        {uploadFile && (
          <div className={styles["selected-file"]}>
            <div className={styles["file-info"]}>
              <span className={styles["file-name"]}>{uploadFile.name}</span>
            </div>
            <Button onClick={clearFile} size="small" variant="tertiary">
              Remove
            </Button>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {uploadSuccess && <div className={styles.success}>Contract uploaded successfully!</div>}

        <div className={styles.actions}>
          <Button onClick={handleFileUpload} disabled={uploading} size="large">
            {uploading ? "Uploading..." : "Upload Contract"}
          </Button>
        </div>
      </div>
    </div>
  );
}
