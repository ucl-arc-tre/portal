"use client";

import { useEffect, useState } from "react";

import { getAgreementsApprovedResearcher } from "@/openapi";

export default function AgreementText() {
  const [agreementText, setAgreementText] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const res = await getAgreementsApprovedResearcher();

        if (res.response.status === 200 && res.data) {
          console.log(res.data.text);
          setAgreementText(res.data.text);
        }
      } catch (err) {
        console.error("Agreement fetch error:", err);
      }
    };

    fetchAgreement();
  }, []);

  return <p>{agreementText}</p>;
}
