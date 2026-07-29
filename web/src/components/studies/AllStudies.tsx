import { useEffect, useState } from "react";
import { GetStudiesData, Study, getStudies } from "@/openapi";
import StudyCardsList from "./StudyCardsList";
import Button from "@/components/ui/Button";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import styles from "./AllStudies.module.css";
import Loading from "../ui/Loading";
import { HelperText } from "../shared/uikitExports";
import Error from "../ui/Error";
import Search from "../ui/Search";
import TabCollection from "../shared/TabCollection";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  refreshToken: number;
};

function studiesRequestData(raw: string): GetStudiesData {
  const request: GetStudiesData = {
    url: "/studies",
  };
  switch (true) {
    case raw.includes("caseref:"):
      request.query = { caseref: Number(raw.split("caseref:")[1]) };
      return request;
    case raw.includes("title:"):
      request.query = { fuzzy_title: raw.split("title:")[1] };
      return request;
    case raw.includes("iao:"):
      request.query = { owner: raw.split("iao:")[1] };
      return request;
    case raw.includes("iaa:"):
      request.query = { administrator: raw.split("iaa:")[1] };
      return request;
  }
  request.query = { query: raw };
  return request;
}

export default function AllStudies(props: Props) {
  const { isIGStaff } = useAuth();
  const { refreshToken } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setError] = useState<string | null>(null);
  const [studies, setStudies] = useState<Study[]>([]);

  const studiesPerPage = 12;
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [noMoreStudies, setNoMoreStudies] = useState(false);

  const router = useRouter();
  const tab = (router.query.tab as "all" | "pending") ?? "all";

  const fetchStudies = async (offset?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response =
        tab === "pending"
          ? await getStudies({ query: { status: "Pending" } })
          : offset
            ? await getStudies({ query: { offset: offset, limit: studiesPerPage } })
            : await getStudies({ query: { limit: studiesPerPage } });

      if (responseIsError(response) || !response.data) {
        setError(`Failed to fetch studies: ${extractErrorMessage(response)}`);
        return;
      }

      setStudies(response.data);
    } catch (error) {
      console.error("Failed to fetch studies:", error);
      setError("Failed to fetch studies. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (query !== searchQuery) {
      setOffset(0);
    }
    setIsLoading(true);
    setError(null);
    setSearchQuery(query);
    try {
      const request = studiesRequestData(query);
      const response = await getStudies(request);

      if (responseIsError(response) || !response.data) {
        setError(`Search failed: ${extractErrorMessage(response)}`);
        return;
      }
      setStudies(response.data);
    } catch (error) {
      console.error("Search failed:", error);
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setError(null);
    setOffset(0);
    fetchStudies(0);
    setSearchQuery("");
  };

  const handlePageChange = async (newOffset: number) => {
    setError(null);
    try {
      const request = studiesRequestData(searchQuery);
      if (!request.query) {
        request.query = {};
      }
      request.query.offset = newOffset;
      request.query.limit = studiesPerPage;

      const response = await getStudies(request);
      if (responseIsError(response) || !response.data) {
        setError(`Failed to fetch studies: ${extractErrorMessage(response)}`);
        return;
      }
      if (response.data.length !== 0) {
        setStudies(response.data);
        setOffset(newOffset);
        setNoMoreStudies(false);
      } else {
        setNoMoreStudies(true);
      }
    } catch (error) {
      console.error("Failed to fetch studies:", error);
    }
  };

  const handleFetchNextPage = () => {
    const newOffset = offset + studiesPerPage;
    handlePageChange(newOffset);
  };

  const handleFetchPreviousPage = () => {
    const newOffset = Math.max(0, offset - studiesPerPage);
    handlePageChange(newOffset);
  };

  useEffect(() => {
    fetchStudies();
  }, [tab, refreshToken]);

  const emptyMessage = tab === "pending" ? "No studies pending approval" : "No studies found";

  return (
    <>
      {isIGStaff && (
        <TabCollection
          tabs={[
            { name: "pending", label: "Pending Studies" },
            { name: "all", label: "All Studies" },
          ]}
          defaultTab="all"
        />
      )}

      {tab === "pending" ? (
        <p>Studies submitted for review. Approve or request changes for each study.</p>
      ) : (
        <>
          <p>All studies in the Portal, grouped by status.</p>
          <div>
            <Search
              placeholder="Search Studies"
              onSearch={(query) => handleSearch(query)}
              id="study-search"
              onClear={handleClearSearch}
            />
            <HelperText>
              <small>You can use keywords to narrow your search: caseref, title, iao, iaa. eg. `caseref:12345`</small>
            </HelperText>
          </div>
        </>
      )}

      {errorMessage && <Error message={errorMessage} />}

      {isLoading && <Loading message="Loading studies..." />}

      {!isLoading && studies.length === 0 && (
        <div className={styles["no-studies-message"]}>
          <h2>{emptyMessage}</h2>
        </div>
      )}

      {studies.length > 0 && (
        <>
          <StudyCardsList studies={studies} />

          <div className={styles["pagination-container"]}>
            <div className={styles["pagination-buttons"]}>
              {(offset >= studiesPerPage || noMoreStudies) && (
                <Button
                  size="small"
                  variant="secondary"
                  className={styles["prev-button"]}
                  onClick={handleFetchPreviousPage}
                >
                  Previous Page
                </Button>
              )}
              <small>
                Showing studies {offset + 1} - {offset + studies.length}
              </small>
              {studies.length >= studiesPerPage && (
                <Button
                  size="small"
                  variant="secondary"
                  className={styles["next-button"]}
                  onClick={handleFetchNextPage}
                  disabled={noMoreStudies}
                >
                  Next Page
                </Button>
              )}
            </div>
            <HelperText className={styles["pagination-help"]}>
              {noMoreStudies && <div>No more studies available</div>}
              <small>Please note these results have been ordered by date of IAO signoff</small>
            </HelperText>
          </div>
        </>
      )}
    </>
  );
}
