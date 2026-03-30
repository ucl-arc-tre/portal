import { StudyRequest } from "@/openapi";

export const UclDpoId = "Z6364106";

export const convertStudyFormDataToApiRequest = (data: StudyFormData): StudyRequest => {
  return {
    title: data.title,
    description: data.description && data.description?.trim().length > 0 ? data.description : null,
    data_controller_organisation: data.dataControllerOrganisation.toLowerCase(),
    additional_study_admin_usernames: data.additionalStudyAdminUsernames.map((admin) => admin.value.trim()),
    involves_ucl_sponsorship: data.involvesUclSponsorship !== undefined ? data.involvesUclSponsorship : undefined,
    involves_cag: data.involvesCag !== undefined ? data.involvesCag : undefined,
    cag_reference: data.involvesCag && data.cagReference ? data.cagReference.toString() : undefined,
    involves_ethics_approval: data.involvesEthicsApproval !== undefined ? data.involvesEthicsApproval : undefined,
    involves_hra_approval: data.involvesHraApproval !== undefined ? data.involvesHraApproval : undefined,
    iras_id: data.involvesHraApproval && data.irasId ? data.irasId : undefined,
    is_nhs_associated: data.isNhsAssociated !== undefined ? data.isNhsAssociated : undefined,
    involves_nhs_england: data.involvesNhsEngland !== undefined ? data.involvesNhsEngland : undefined,
    nhs_england_reference:
      data.involvesNhsEngland && data.nhsEnglandReference
        ? `${data.nhsEnglandReference.includes("DARS-NIC-") ? data.nhsEnglandReference : `DARS-NIC-${data.nhsEnglandReference}`}`
        : undefined,
    involves_mnca: data.involvesMnca !== undefined ? data.involvesMnca : undefined,
    requires_dspt: data.requiresDspt !== undefined ? data.requiresDspt : undefined,
    requires_dbs: data.requiresDbs !== undefined ? data.requiresDbs : undefined,
    is_data_protection_office_registered:
      data.isDataProtectionOfficeRegistered !== undefined ? data.isDataProtectionOfficeRegistered : undefined,
    data_protection_number:
      data.isDataProtectionOfficeRegistered &&
      data.dataProtectionPrefix &&
      data.dataProtectionDate &&
      data.dataProtectionId
        ? `${data.dataProtectionPrefix}/${data.dataProtectionDate.replace("-", "/")}/${data.dataProtectionId}`
        : undefined,
    involves_third_party: data.involvesThirdParty !== undefined ? data.involvesThirdParty : undefined,
    involves_external_users: data.involvesExternalUsers !== undefined ? data.involvesExternalUsers : undefined,
    involves_participant_consent:
      data.involvesParticipantConsent !== undefined ? data.involvesParticipantConsent : undefined,
    involves_indirect_data_collection:
      data.involvesIndirectDataCollection !== undefined ? data.involvesIndirectDataCollection : undefined,
    involves_data_processing_outside_eea:
      data.involvesDataProcessingOutsideEea !== undefined ? data.involvesDataProcessingOutsideEea : undefined,
  };
};
