import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import {
  postStudiesByStudyIdAssetsByAssetIdContractsUpload,
  getStudiesByStudyIdAssetsByAssetIdContractsByContractIdDownload,
} from "@/openapi";
import styles from "./ContractManagement.module.css";

type ContractManagementProps = {
  studyId: string;
  assetId: string;
};

type ContractFormData = {
  organisationSignatory: string;
  thirdPartyName: string;
  status: "proposed" | "active" | "expired";
  expiryDate: string;
};

export default function ContractManagement({ studyId, assetId }: ContractManagementProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContractFormData>({
    defaultValues: {
      status: "proposed",
    },
  });

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

  const onSubmit = async (formData: ContractFormData) => {
    if (!uploadFile) {
      setError("Please select a PDF file before uploading.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await postStudiesByStudyIdAssetsByAssetIdContractsUpload({
        path: {
          studyId,
          assetId,
        },
        body: {
          file: uploadFile,
          organisation_signatory: formData.organisationSignatory,
          third_party_name: formData.thirdPartyName,
          status: formData.status,
          expiry_date: formData.expiryDate,
        },
      });

      if (!response.response.ok) {
        throw new Error(`Upload failed: ${response.response.status} ${response.response.statusText}`);
      }

      setUploadSuccess(true);
      setUploadFile(null);
      reset(); // Reset form
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

  const handleDownload = async () => {
    // For testing, using a hardcoded contract ID
    const testContractId = "3ba8cb22-48ad-4157-84e3-70555794ac1f";

    setDownloading(true);
    setError(null);

    try {
      const response = await getStudiesByStudyIdAssetsByAssetIdContractsByContractIdDownload({
        path: {
          studyId,
          assetId,
          contractId: testContractId,
        },
      });

      if (!response.response.ok || !response.data) {
        throw new Error(`Download failed: ${response.response.status} ${response.response.statusText}`);
      }

      // Create download link using the response data
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "contract.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      setError("Failed to download contract. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3>Contract Management</h3>
      <p className={styles.description}>
        Upload a PDF contract document for this asset. Only PDF files up to 10MB are accepted.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
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

          <div className={styles["form-section"]}>
            <h4>Contract Details</h4>

            <div className={styles["form-group"]}>
              <label htmlFor="organisationSignatory">Organisation Signatory *</label>
              <input
                id="organisationSignatory"
                type="text"
                {...register("organisationSignatory", {
                  required: "Organisation Signatory is required",
                  minLength: { value: 2, message: "Organisation Signatory must be at least 2 characters" },
                  maxLength: { value: 100, message: "Organisation Signatory must be less than 100 characters" },
                })}
                className={styles["form-input"]}
                placeholder="Enter organisation signatory name"
              />
              {errors.organisationSignatory && (
                <span className={styles["form-error"]}>{errors.organisationSignatory.message}</span>
              )}
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="thirdPartyName">Third Party Name *</label>
              <input
                id="thirdPartyName"
                type="text"
                {...register("thirdPartyName", {
                  required: "Third Party Name is required",
                  minLength: { value: 2, message: "Third Party Name must be at least 2 characters" },
                  maxLength: { value: 100, message: "Third Party Name must be less than 100 characters" },
                })}
                className={styles["form-input"]}
                placeholder="Enter third party organization name"
              />
              {errors.thirdPartyName && <span className={styles["form-error"]}>{errors.thirdPartyName.message}</span>}
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="status">Contract Status *</label>
              <select
                id="status"
                {...register("status", {
                  required: "Status is required",
                })}
                className={styles["form-select"]}
              >
                <option value="proposed">Proposed</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
              {errors.status && <span className={styles["form-error"]}>{errors.status.message}</span>}
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="expiryDate">Expiry Date *</label>
              <input
                id="expiryDate"
                type="date"
                {...register("expiryDate", {
                  required: "Expiry date is required",
                })}
                className={styles["form-input"]}
              />
              {errors.expiryDate && <span className={styles["form-error"]}>{errors.expiryDate.message}</span>}
            </div>
          </div>

          <div className={styles.actions}>
            <Button type="submit" disabled={uploading} size="large">
              {uploading ? "Uploading..." : "Upload Contract"}
            </Button>
            <Button type="button" onClick={handleDownload} disabled={downloading} size="large" variant="secondary">
              {downloading ? "Downloading..." : "Test Download"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
