"use client";

import "./AgreementText.css";
import Markdown from "react-markdown";

export default function AgreementText({ text }: { text: string }) {
  return (
    <section className="section">
      <Markdown>{text}</Markdown>
    </section>
  );
}
