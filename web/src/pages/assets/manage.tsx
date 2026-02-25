import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import {
  Study,
  Asset,
  getStudiesByStudyId,
  getStudiesByStudyIdAssetsByAssetId,
  getStudiesByStudyIdContracts,
  Contract,
  putStudiesByStudyIdAssetsByAssetId,
  AssetBase,
} from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";

import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";

import styles from "./ManageAsset.module.css";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  AddLinkButton,
  Alert,
  AlertMessage,
  convertRFC3339ToYYYYMMDD,
  HelperText,
  RemoveLinkButton,
} from "@/components/shared/exports";
import { Controller, useFieldArray, useForm } from "react-hook-form";

export default function ManageAssetPage() {
  const router = useRouter();
  const { studyId, assetId } = router.query;
  const { authInProgress, isAuthed, userData } = useAuth();
  const [study, setStudy] = useState<Study | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [contracts, setContracts] = useState<Contract[] | null>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

  const { handleSubmit, watch, control, setValue } = useForm<AssetFormData>({
    defaultValues: { contracts: [] },
  });
  const selectedContractIds = watch("contracts");
  const {
    fields: contractFields,
    append: appendContract,
    remove: removeContract,
  } = useFieldArray({
    control,
    name: "contracts",
  });

  const fetchData = async (studyIdParam: string, assetIdParam: string) => {
    setLoading(true);
    setError(null);

    try {
      const studyResponse = await getStudiesByStudyId({
        path: { studyId: studyIdParam },
      });

      if (!studyResponse.response.ok || !studyResponse.data) {
        const errorMsg = extractErrorMessage(studyResponse);
        setError(`Failed to load study: ${errorMsg}`);
        return;
      }
      setStudy(studyResponse.data);

      const assetResponse = await getStudiesByStudyIdAssetsByAssetId({
        path: { studyId: studyIdParam, assetId: assetIdParam },
      });

      if (!assetResponse.response.ok || !assetResponse.data) {
        const errorMsg = extractErrorMessage(assetResponse);
        setError(`Failed to load asset: ${errorMsg}`);
        return;
      }
      setAsset(assetResponse.data);

      const contractsResponse = await getStudiesByStudyIdContracts({
        path: { studyId: studyIdParam },
      });

      if (!contractsResponse.response.ok || !contractsResponse.data) {
        const errorMsg = extractErrorMessage(contractsResponse);
        setError(`Failed to load contracts: ${errorMsg}`);
        return;
      }
      setContracts(contractsResponse.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load asset details");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (studyId && assetId && typeof studyId === "string" && typeof assetId === "string") {
      fetchData(studyId, assetId);
    }
  }, [studyId, assetId]);

  useEffect(() => {
    if (asset && contracts && !loading) {
      // Find contracts that are linked to this asset
      const linkedContractIds = contracts
        .filter((contract) => contract.asset_ids.includes(asset.id))
        .map((contract) => ({ value: contract.id }));

      // prefill the field array with the linked contracts
      if (linkedContractIds.length > 0) {
        // Use setValue instead of manipulating the field array directly
        setValue("contracts", linkedContractIds);
      }
    }
  }, [asset, contracts, loading, setValue]);

  if (authInProgress) return <Loading />;
  if (!isAuthed) return <LoginFallback />;
  if (loading) return <Loading />;

  if (!isApprovedResearcher) {
    return (
      <>
        <MetaHead
          title="Manage Asset | ARC Services Portal"
          description="Manage your asset in the ARC Services Portal"
        />

        <div className={styles["not-approved-section"]}>
          <h2>To manage assets, please first set up your profile by completing the approved researcher process.</h2>
          <div className={styles["profile-completion-action"]}>
            <Button onClick={() => router.push("/profile")} size="large">
              Complete your profile
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Title text="Error" />
        <p className={styles.error}>{error}</p>
        <Button onClick={() => router.push("/studies")} variant="secondary">
          Back to Studies
        </Button>
      </div>
    );
  }

  if (!study || !asset) {
    return (
      <div className={styles.container}>
        <Title text="Not Found" />
        <p className={styles.error}>Study or asset not found.</p>
        <Button onClick={() => router.push("/studies")} variant="secondary">
          Back to Studies
        </Button>
      </div>
    );
  }

  const onSubmit = async (formData: AssetFormData) => {
    setIsSubmitting(true);
    setError(null);

    const assetData: AssetBase = {
      //TODO: update when enabling asset editing #401
      title: asset.title,
      description: asset.description,
      classification_impact: asset.classification_impact,
      tier: asset.tier,
      protection: asset.protection,
      legal_basis: asset.legal_basis,
      format: asset.format,
      expires_at: convertRFC3339ToYYYYMMDD(asset.expires_at),
      locations: asset.locations,
      requires_contract: asset.requires_contract,
      has_dspt: asset.has_dspt,
      stored_outside_uk_eea: asset.stored_outside_uk_eea,
      status: asset.status,
      contract_ids: formData.contracts.map((contract) => contract.value).filter((id) => id !== "") as string[],
    };

    try {
      const response = await putStudiesByStudyIdAssetsByAssetId({
        path: {
          studyId: study.id,
          assetId: asset.id,
        },
        body: assetData,
      });

      if (!response.response.ok) {
        const errorMsg = extractErrorMessage(response);
        setError(errorMsg);
        return;
      }
      setSuccessMessage("Asset updated successfully");
    } catch (error) {
      setError("Error: " + String((error as Error).message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <MetaHead title={`Manage Asset: ${asset.title}`} description={`Manage asset details for ${asset.title}`} />
      <Breadcrumbs
        links={[
          {
            title: "Studies",
            url: "/studies",
          },
          {
            title: study.title,
            url: `/studies/manage?studyId=${study.id}`,
          },
          {
            title: asset.title,
            url: `/assets/manage?studyId=${study.id}&assetId=${asset.id}`,
          },
        ]}
      />

      <div className="content">
        <Title text={`Manage Asset: ${asset.title}`} centered />

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
            {asset.requires_contract && (
              <div className={styles.field}>
                <label>Contract Required:</label>
                <span>Yes</span>
              </div>
            )}
          </div>
        </div>

        <div className={`${styles["asset-linkage"]} ${styles.section}`}>
          <h3>Contracts linked to this Asset</h3>
          <HelperText>You can link this asset to one or more contracts within this study. This is optional.</HelperText>
          <form onSubmit={handleSubmit(onSubmit)} className="form">
            <fieldset className="linkage-fieldset">
              {contractFields.map((field, index) => (
                <div key={field.id} className="item-wrapper">
                  <label htmlFor={`contract-${index}`} className="item-label">
                    Contract {index + 1}:
                  </label>

                  <Controller
                    name={`contracts.${index}.value` as const}
                    control={control}
                    render={({ field }) => (
                      <select {...field} id={`contract-${index}`} disabled={isSubmitting || loading}>
                        <option value="">
                          {loading
                            ? "Loading contracts..."
                            : contracts?.length === 0
                              ? "No contracts available for this study"
                              : "Select a contract (optional)..."}
                        </option>
                        {contracts?.map((contract) => {
                          const isAlreadySelected = selectedContractIds.some(
                            (selected, selectedIndex) => selected.value === contract.id && selectedIndex !== index
                          );

                          return (
                            <option key={contract.id} value={contract.id} disabled={isAlreadySelected}>
                              {contract.filename}
                              {isAlreadySelected ? " - Already selected" : ""}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  />

                  <RemoveLinkButton onClick={removeContract} index={index}></RemoveLinkButton>
                </div>
              ))}
              <AddLinkButton onClick={() => appendContract({ value: "" })} entity="Contract" />
            </fieldset>
            {successMessage && (
              <Alert type="success" className={styles.alert}>
                <AlertMessage>{successMessage}</AlertMessage>
              </Alert>
            )}
            <Button type="submit" disabled={isSubmitting || loading} size="large">
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
