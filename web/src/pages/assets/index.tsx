import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

import Assets from "@/components/assets/Assets";
import MetaHead from "@/components/meta/Head";
import LoginFallback from "@/components/ui/LoginFallback";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import Title from "@/components/ui/Title";

import styles from "./index.module.css";

export default function AssetsPage() {
  const { authInProgress, isAuthed, userData } = useAuth();
  const [studies, setStudies] = useState([]);
  const [studiesLoading, setStudiesLoading] = useState(true);

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

  useEffect(() => {
    if (!isApprovedResearcher) return;

    const fetchStudies = async () => {
      setStudiesLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await getStudies();
        // setStudies(response.data);

        // Dummy data for now
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
        setStudies([]);
        // setStudies([
        //   {
        //     id: "1",
        //     title: "COVID-19 Research Study",
        //     description: "A comprehensive study on COVID-19 impacts and treatments",
        //   },
        //   {
        //     id: "2",
        //     title: "Cancer Treatment Analysis",
        //     description: "Analysis of various cancer treatment methodologies",
        //   },
        // ]);
      } catch (error) {
        console.error("Failed to fetch studies:", error);
        setStudies([]);
      } finally {
        setStudiesLoading(false);
      }
    };

    fetchStudies();
  }, [isApprovedResearcher]);

  if (authInProgress) return null;
  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <MetaHead
        title="Assets | ARC Services Portal"
        description="View and modify data assets in the ARC Services Portal"
      />

      <Title text={"Data Assets"} centered description={"View and manage your data assets"} />
      <div className={styles["page-description"]}>
        <p>
          Use this page to create data assets you would like to associate with your study. Assets can be any kind of
          data entity you want to associate with your study (e.g. consent forms, physical study materials etc.). The
          National Archives also have{" "}
          <a
            href="http://www.nationalarchives.gov.uk/documents/information-management/information-assets-factsheet.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            a more thorough guide
          </a>{" "}
          on what assets are and how to use them.
        </p>
      </div>

      {!isApprovedResearcher && (
        <div className={styles["not-approved-section"]}>
          <h2>
            To access your assets, please first set up your profile by completing the approved researcher process.
          </h2>

          <Button href="/profile" size="large">
            Complete your profile
          </Button>
        </div>
      )}

      {isApprovedResearcher && studiesLoading && <Loading message="Loading studies..." />}

      {isApprovedResearcher && !studiesLoading && studies.length === 0 && (
        <>
          <h4>You do not have any studies to view. Click the button below to create a study.</h4>

          <Button href="/studies" size="large">
            Go to studies page
          </Button>
        </>
      )}

      {isApprovedResearcher && !studiesLoading && studies.length > 0 && <Assets />}
    </>
  );
}
