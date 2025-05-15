"use client";

import "./AgreementText.css";
import Markdown from "react-markdown";
import { useEffect, useState } from "react";
import { getAgreementsApprovedResearcher } from "@/openapi";

export default function AgreementText() {
  const [agreementText, setAgreementText] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const res = await getAgreementsApprovedResearcher();

        if (res.response.status === 200 && res.data) {
          setAgreementText(res.data.text);
        }
      } catch (err) {
        console.error("Agreement fetch error:", err);
      }
    };

    fetchAgreement();
  }, []);

  return (
    <section className="section">
      <Markdown>{agreementText}</Markdown>
    </section>
  );
}
