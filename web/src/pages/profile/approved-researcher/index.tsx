import ApprovedResearcherAgreement from "@/components/profile/approved-researcher/ApprovedResearcherAgreement";
import Head from "next/head";

export default function ApprovedResearcherPage() {
  return (
    <>
      <Head>
        <title>Become an Approved Researcher | ARC Services Portal</title>
        <meta
          property="description"
          content="Submit your application to become an approved researcher"
          key="description"
        />
      </Head>
      <div>
        <h1>Become an Approved Researcher</h1>
        <p>To gain access to advanced services, please complete the following steps.</p>

        <ApprovedResearcherAgreement />
      </div>
    </>
  );
}
