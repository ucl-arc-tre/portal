"use client";

import "./AgreementText.css";
import Markdown from "react-markdown";

type AgreementTextProps = {
  agreementText: string;
};

export default function AgreementText(props: AgreementTextProps) {
  return (
    <section className="section">
      <Markdown>{props.agreementText}</Markdown>
    </section>
  );
}
