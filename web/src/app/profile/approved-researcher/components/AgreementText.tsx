"use client";

import "./AgreementText.css";
import Markdown from "react-markdown";

type AgreementTextProps = {
  text: string;
};

export default function AgreementText(props: AgreementTextProps) {
  return (
    <section className="section" id="approved-researcher-agreement-text">
      <Markdown>{props.text}</Markdown>
    </section>
  );
}
