export type StorageDefinition = {
  name: string;
  value: string;
  definition: string;
  links?: Array<{
    text: string;
    url: string;
  }>;
  riskScore: number; // 1-10
};

export const storageDefinitions: StorageDefinition[] = [
  {
    name: "ARC Trusted Research Environment (TRE)",
    value: "arc_tre",
    definition:
      "Users need to comply with any requirements and guidance issued by the ARC Trusted Research Environment support team.",
    riskScore: 1,
  },
  {
    name: "Courier service (secured)",
    value: "courier_service_secured",
    definition: "Including tamper-evident packaging and Tracked and signed for.",
    riskScore: 5,
  },
  {
    name: "Data Controller (external to UCL)",
    value: "data_controller_external",
    definition:
      "A Data Controller is an organisation which has determined its own reasons for processing personal data and has an established lawful basis for doing so.",
    riskScore: 7,
  },
  {
    name: "Data entry",
    value: "data_entry",
    definition: "Authentication required to access, session secured with end to end encryption (HTTPS or VPN)",
    riskScore: 3,
  },
  {
    name: "Data Safe Haven",
    value: "data_safe_haven",
    definition:
      "If sending files via the Data Safe Haven File Transfer Portal to an email recipient, users must use a different password delivery mechanism to the email address used. Storage locations used: (1) Torrington Place, 1-19 Torrington Pl, London WC1E 7HB, (2) Slough, VIRTUS LONDON4, 14 Liverpool Road, Slough, Berkshire SL1 4QZ, (3) AWS EU-West-2, London.",
    riskScore: 1,
  },
  {
    name: "Data Safe Haven applications",
    value: "data_safe_haven_applications",
    definition: "Must use a separate password delivery mechanism to email.",
    riskScore: 1,
  },
  {
    name: "Data Safe Haven file transfer portal",
    value: "data_safe_haven_file_transfer",
    definition:
      "If sending files via the Data Safe Haven File Transfer Portal to an email recipient, users must use a different password delivery mechanism to the email address used.",
    riskScore: 1,
  },
  {
    name: "Desktop@UCL staff computer",
    value: "desktop_ucl_staff",
    definition:
      "UCL Information Services Division will issue on request a standard desktop installation called Desktop@UCL which includes encryption of the device's storage and anti-malware. However, some departments have not migrated to the Desktop@UCL service and will issue devices which are not necessarily as secure by default.",
    riskScore: 2,
  },
  {
    name: "DfE network",
    value: "dfe_network",
    definition:
      "The Department for Education's Data Sharing Agreement makes these data highly confidential by default. The contract must be adhered to. Advice is best sought from IG Advisory (slms.pid@ucl.ac.uk) before entering these agreements.",
    riskScore: 1,
  },
  {
    name: "Email",
    value: "email",
    definition:
      "Consult with IG Advisory (slms.pid@ucl.ac.uk) if you need to use email to send or receive research participants' personal data.",
    riskScore: 7,
  },
  {
    name: "Fax",
    value: "fax",
    definition:
      "Consult with IG Advisory (slms.pid@ucl.ac.uk) if you need to use fax to send or receive research participants' personal data.",
    riskScore: 7,
  },
  {
    name: "GalaxKey",
    value: "galaxkey",
    definition: "No further requirements.",
    riskScore: 7,
  },
  {
    name: "Handheld recording equipment (secured)",
    value: "handheld_recording_secured",
    definition:
      "Secure recording devices must either: (a) have device or file encryption requiring a strong, randomly generated password, or (b) be used only in the following way: - where the files can be securely transferred to the Data Safe Haven or an equally secure platform - the device files erased immediately upon confirmation of the completed transfer - without having to travel between sites",
    riskScore: 5,
  },
  {
    name: "Handheld recording equipment (unsecured)",
    value: "handheld_recording_unsecured",
    definition:
      "Consult with IG Advisory (infogov@ucl.ac.uk) if you need to use unsecured devices to store research participants' personal data.",
    riskScore: 7,
  },
  {
    name: "Internet download/upload (secured)",
    value: "internet_download_upload_secured",
    definition: "Authentication required to access, session secured with end to end encryption (HTTPS or VPN)",
    riskScore: 7,
  },
  {
    name: "Internet download/upload (unsecured)",
    value: "internet_download_upload_unsecured",
    definition:
      "Consult with IG Advisory (slms.pid@ucl.ac.uk) if you need to download or upload research participants' personal data without a secure connection.",
    riskScore: 9,
  },
  {
    name: "Laptop/PC (partially secured)",
    value: "laptop_pc_partially_secured",
    definition:
      "Non-standard computers must have in order to be considered secure: - a strong, randomly generated password or PIN - device encryption - a supported operating system and software updates by default - up to date antivirus running - cloud backup services disabled If the default user has administrative privileges enabled allowing them to install their own applications then there is a risk to confidential information held on these devices.",
    riskScore: 7,
  },
  {
    name: "Laptop/PC (secured)",
    value: "laptop_pc_secured",
    definition:
      "Non-standard computers must have in order to be considered secure: - a strong, randomly generated password or PIN - device encryption - a supported operating system and software updates by default - up to date antivirus running - cloud backup services disabled - the device should also have administrative privileges disabled for the default user account and therefore be unable to install their own applications.",
    riskScore: 5,
  },
  {
    name: "Laptop/PC (security unconfirmed)",
    value: "laptop_pc_security_unconfirmed",
    definition:
      "Should not be used to store a data set which in itself could be used to identify participants. Consult with IG Advisory (slms.pid@ucl.ac.uk) if you need to use unsecured devices to store research participants' personal data.",
    riskScore: 8,
  },
  {
    name: "Microsoft 365",
    value: "microsoft_365",
    definition:
      "UCL's Microsoft 365 platforms are managed within UCL Information Services Division. Another organisation's M365 platform might be suitable but would require a written agreement as with any data transfer between organisations.",
    riskScore: 7,
  },
  {
    name: "Network file storage e.g. N: or S: drives",
    value: "network_file_storage",
    definition:
      "The UCL network 'fileshares' and 'N:/ drives' are not configured for managing the security of sensitive data and are not encrypted. Any data which requires specific assurances to be made are not to be considered secure on this type of storage.",
    riskScore: 6,
  },
  {
    name: "Network transfer",
    value: "network_transfer",
    definition:
      "Must be connected via one of the following: Eduroam, Using a UCL network port, VPN from trusted source to trusted destination, SFTP from trusted source, end to end encryption (HTTPS) from trusted source.",
    riskScore: 7,
  },
  {
    name: "NHS Mail",
    value: "nhs_mail",
    definition:
      "The NHSMail Acceptable Use Policy requires you to only use NHSMail when acting in your official capacity. NHSMail should thereby only be used for sending data where there is a lawful basis for sharing within the NHS.",
    links: [
      {
        text: "NHSMail Acceptable Use Policy",
        url: "https://portal.nhs.net/Home/AcceptablePolicy",
      },
    ],
    riskScore: 6,
  },
  {
    name: "NHS Digital",
    value: "nhs_digital",
    definition:
      "NHS Digital's Data Sharing Agreement makes these data highly confidential by default. The contract must be adhered to. Advice is best sought from IG Advisory (slms.pid@ucl.ac.uk) before entering these agreements.",
    riskScore: 4,
  },
  {
    name: "NHS IT",
    value: "nhs_it",
    definition:
      "Data should only be stored on NHS networks or computers if a lawful basis has been established for doing so.",
    riskScore: 4,
  },
  {
    name: "NHS site",
    value: "nhs_site",
    definition: "Data should only be stored in NHS sites if a lawful basis has been established for doing so.",
    riskScore: 6,
  },
  {
    name: "Online database/survey tool (partially secured)",
    value: "online_database_partially_secured",
    definition:
      "The software provider must: - host your data exclusively within the UK or the European Economic Area (EEA) - have a signed data processing agreement",
    riskScore: 7,
  },
  {
    name: "Online database/survey tool (security unconfirmed)",
    value: "online_database_security_unconfirmed",
    definition:
      "Consult with IG Advisory (slms.pid@ucl.ac.uk) if you need to use survey tools to store research participants' personal data that are hosted outside the EEA or without a data processing agreement in place.",
    riskScore: 8,
  },
  {
    name: "OpenClinica",
    value: "openclinica",
    definition:
      "Access to records should be regularly monitored and a joiners, movers and leavers' checklist should be implemented.",
    riskScore: 7,
  },
  {
    name: "Other location",
    value: "other_location",
    definition:
      "Assumed likely to be a high risk but you should consult IG Advisory (slms.pid@ucl.ac.uk) if you need to assess a service not listed here.",
    riskScore: 10,
  },
  {
    name: "Phone call",
    value: "phone_call",
    definition: "Carried out in a designated work area where guests are not able to overhear conversation.",
    riskScore: 8,
  },
  {
    name: "Phone/tablet (partially secured)",
    value: "phone_tablet_partially_secured",
    definition:
      "Must have: - a strong, randomly generated password / PIN - a supported operating system with software updates by default - cloud backup services disabled",
    riskScore: 7,
  },
  {
    name: "Phone/tablet (secured)",
    value: "phone_tablet_secured",
    definition:
      "Must have: - a feature to remotely wipe the device enabled - a strong, randomly generated password / PIN - a supported operating system with software updates by default - cloud backup services disabled",
    riskScore: 5,
  },
  {
    name: "Phone/tablet (security unconfirmed)",
    value: "phone_tablet_security_unconfirmed",
    definition:
      "Should not be used to store a data set which in itself could be used to identify participants. Consult with IG Advisory (slms.pid@ucl.ac.uk) if you need to use unsecured devices to store research participants' personal data.",
    riskScore: 9,
  },
  {
    name: "Printer/scanner",
    value: "printer_scanner",
    definition:
      "For highly confidential information, these devices require a separate risk assessment (see column on the right).",
    riskScore: 9,
  },
  {
    name: "Public Health England",
    value: "public_health_england",
    definition:
      "Public Health England's Data Sharing Agreement makes these data highly confidential by default. The contract must be adhered to. Advice is best sought from IG Advisory (slms.pid@ucl.ac.uk) before entering these agreements.",
    riskScore: 6,
  },
  {
    name: "REDCap in Data Safe Haven",
    value: "redcap_data_safe_haven",
    definition:
      "REDCap in the Data Safe Haven is considered secure enough to manage identifiable research data including sensitive data.",
    riskScore: 1,
  },
  {
    name: "Research participant's home or own device",
    value: "research_participant_home_device",
    definition:
      "Research participants should be offered a secure method to transfer their own personal data such as a REDCap survey hosted in the UCL Data Safe Haven.",
    riskScore: 9,
  },
  {
    name: "Royal Mail (secured)",
    value: "royal_mail_secured",
    definition:
      "Tamper-evident packaging should be used AND packages are tracked and signed for AND addresses are not produced manually for each recipient (so, e.g. self-addressed envelope or mailmerge).",
    riskScore: 9,
  },
  {
    name: "Secure physical storage",
    value: "secure_physical_storage",
    definition:
      "Secure physical storage including filing cabinets must: - be lockable and left locked when unattended - have physical access control such as card access to the room, floor or building.",
    riskScore: 6,
  },
  {
    name: "Staff carries items point-to-point",
    value: "staff_carries_items",
    definition:
      "If items can be carried by a staff member from the point of their inception or collection to a secure office location without stop-offs then this will be considered secure.",
    riskScore: 7,
  },
  {
    name: "Standard postage/courier",
    value: "standard_postage_courier",
    definition:
      "Consult with IG Advisory (slms.pid@ucl.ac.uk) if you need to use standard postage/couriers to send or receive research participants' personal data. The risks are of mis-addressing envelopes, using faulty packaging for bulkier items and items being left unattended in shared accommodation situations.",
    riskScore: 10,
  },
  {
    name: "Third party w/ Data Security & Protection Toolkit in place",
    value: "third_party_dspt",
    definition:
      "External service provider with up-to-date Data Security & Protection Toolkit, where there is a data sharing agreement in place.",
    riskScore: 10,
  },
  {
    name: "Text (SMS)",
    value: "text_sms",
    definition:
      "A text message can be used to send, for example, a password or an appointment time. However, users should be careful not to include other linked information or contextual information that might make the text itself sensitive or risk an information security incident. So, a password should not be accompanied by a username or URL wherein the login could be pieced together, which should be sent via a different method.",
    riskScore: 10,
  },
  {
    name: "Royal Mail with application support",
    value: "royal_mail_application_support",
    definition:
      "Addresses are not produced manually for each recipient (so, e.g. self-addressed envelope or mailmerge).",
    riskScore: 10,
  },
  {
    name: "USB stick/portable hard drive with enforced encryption",
    value: "usb_portable_encrypted",
    definition:
      "These devices must have system-level encryption meaning that it is not possible to activate the device storage without entering a password, and the password chosen should be a strong, randomly generated one.",
    riskScore: 5,
  },
  {
    name: "USB stick/portable hard drive without encryption by default",
    value: "usb_portable_unencrypted",
    definition:
      "Highly confidential information should never be held on portable storage without encryption. Loss of data as well as breach of confidentiality are likely to result from handling data this way.",
    riskScore: 9,
  },
];
