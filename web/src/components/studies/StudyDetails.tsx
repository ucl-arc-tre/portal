import { Study } from "@/openapi";
import Box from "../ui/Box";
import { formatDate } from "../shared/exports";
import { useState } from "react";

type StudyDetailsProps = {
  study: Study;
};
export default function StudyDetails({ study }: StudyDetailsProps) {
  const [riskScore, setRiskScore] = useState(0);
  const getUserFromId = (id: string) => {
    // todo
  };
  const calculateRiskScore = () => {
    // todo: how to determine if they have data?
    let score = 0;

    if (study.involves_data_processing_outside_eea) score += 10;
    if (study.requires_dbs) score += 5;
    if (study.requires_dspt) score += 5;
    if (study.involves_third_party && study.involves_mnca) score += 5;
    if (study.involves_nhs_england || study.involves_cag) score += 5;

    setRiskScore(score);
  };
  return (
    <>
      <Box>
        <dl>
          <dt>Last updated:</dt>
          <dd>{formatDate(study.updated_at)}</dd>
          <dt>Risk Score</dt>
          <dd>{riskScore}</dd>
          <dt>Status</dt>
          <dd>{study.approval_status}</dd>
        </dl>
        <h2>{study.description}</h2>
        <div>
          <dl>
            <dt>Owner</dt>
            <dd>{study.owner_user_id}</dd>
            <dt>Admins</dt>
            <dd>{study.additional_study_admin_usernames}</dd>
            <dt>Data Controller</dt>
            <dd>{study.data_controller_organisation.toUpperCase()}</dd>
          </dl>
          <h3>Additional Information</h3>
          <p>These details have all been marked as &ldquo;true&rdquo; in the form</p>
          <dl>
            <h4>Sponsorships & Approvals</h4>
            {study.involves_ucl_sponsorship && <dt>UCL Sponsorship</dt>}
            {study.involves_cag && <dt>CAG approval</dt>}
            {study.involves_ethics_approval && <dt>Ethics approval</dt>}
            {study.involves_hra_approval && <dt>HRA approval</dt>}
            {!study.involves_ucl_sponsorship &&
              !study.involves_cag &&
              !study.involves_ethics_approval &&
              !study.involves_hra_approval && <dt>No sponsorship or approval information given</dt>}
          </dl>
          <dl>
            <h4>NHS</h4>
            {study.is_nhs_associated && <dt>is NHS associated</dt>}
            {study.involves_nhs_england && <dt>NHS England involvement</dt>}
            {study.involves_mnca && <dt>involves MNCA</dt>}
            {study.requires_dspt && <dt>requires DSPT</dt>}
            {!study.is_nhs_associated &&
              !study.involves_nhs_england &&
              !study.involves_mnca &&
              !study.requires_dspt && <dt>No NHS information given</dt>}
          </dl>
          <dl>
            <h4>Data</h4>
            {study.requires_dbs && <dt>requires DBS</dt>}
            {study.is_data_protection_office_registered && <dt>is registered with DPO</dt>}
            {study.involves_third_party && <dt>third party</dt>}
            {study.involves_external_users && <dt>external users</dt>}
            {study.involves_participant_consent && <dt>participant consent</dt>}
            {study.involves_indirect_data_collection && <dt>indirect data collection</dt>}
            {study.involves_data_processing_outside_eea && <dt>data processing outside EEA</dt>}
            {!study.requires_dbs &&
              !study.is_data_protection_office_registered &&
              !study.involves_third_party &&
              !study.involves_external_users &&
              !study.involves_participant_consent &&
              !study.involves_indirect_data_collection &&
              !study.involves_data_processing_outside_eea && <dt>No data information given</dt>}
          </dl>
        </div>
      </Box>
    </>
  );
}
