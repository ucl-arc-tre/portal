import { useEffect, useState } from "react";
import { Study, getStudies } from "@/openapi";
import StudyCardsList from "./StudyCardsList";
import Loading from "../ui/Loading";
import Error from "../ui/Error";
import Search from "../ui/Search";
import NoObjects from "../ui/NoObjects";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import { useAuth } from "@/hooks/useAuth";

import styles from "./ResearcherStudies.module.css";

type Props = {
  refreshToken: number;
};

export default function ResearcherStudies(props: Props) {
  const { refreshToken } = props;

  const { userData, isApprovedStaffResearcher } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [studies, setStudies] = useState<Study[]>([]);
  const [hasAnyStudies, setHasAnyStudies] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchStudies = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getStudies(searchQuery ? { query: { query: searchQuery } } : undefined);
      if (responseIsError(response) || !response.data) {
        setError(`Failed to fetch studies: ${extractErrorMessage(response)}`);
        setStudies([]);
        return;
      }
      setStudies(response.data);
      if (!searchQuery) setHasAnyStudies(response.data.length > 0);
    } catch (error) {
      console.error("Failed to fetch studies:", error);
      setError("Failed to fetch studies. Please try again.");
      setStudies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setQuery("");
    fetchStudies("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    fetchStudies(searchQuery);
  };

  const handleClearSearch = () => {
    setQuery("");
    fetchStudies("");
  };

  if (!userData) return null;

  if (error) {
    return <Error message={error} />;
  }

  return (
    <>
      {hasAnyStudies && (
        <Search placeholder="Search Studies" onSearch={handleSearch} id="study-search" onClear={handleClearSearch} />
      )}

      {isLoading && <Loading message="Loading studies..." />}

      {!isLoading && studies.length === 0 && query !== "" && <NoObjects message="No studies found" />}

      {!isLoading && studies.length === 0 && query === "" && isApprovedStaffResearcher && (
        <div className={styles["no-studies-message"]}>
          <h2>No studies found</h2>
          <p>Any studies you create will appear here.</p>
        </div>
      )}

      {!isLoading && studies.length === 0 && query === "" && !isApprovedStaffResearcher && (
        <div className={styles["no-studies-message"]}>
          <h2>You haven&apos;t been added to any studies yet</h2>
          <p>Any studies you are added to will appear here once they have been created by a member of staff.</p>
        </div>
      )}

      {!isLoading && studies.length > 0 && <StudyCardsList studies={studies} />}
    </>
  );
}
