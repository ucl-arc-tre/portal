type Study = {
  id: string;
  title: string;
  description: string;
  owner: string;
  admin: string;
  controller: string;
  controllerOther: string;
  cagRef: number;
  dataProtectionPrefix: string;
  dataProtectionDate: string;
  dataProtectionId: number;
  dataProtectionNumber: string; // prefix/date/id
  nhsEnglandRef: number;
  irasId: string; // might be number, unclear
  uclSponsorship: boolean;
  cag: boolean;
  ethics: boolean;
  hra: boolean;
  dbs: boolean;
  dataProtection: boolean;
  thirdParty: boolean;
  externalUsers: boolean;
  consent: boolean;
  nonConsent: boolean;
  extEea: boolean;
  nhs: boolean;
  nhsEngland: boolean;
  mnca: boolean;
  dspt: boolean;
};
