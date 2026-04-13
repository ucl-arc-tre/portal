import { useEffect, useState } from "react";
import { Study, getStudies } from "@/openapi";
import StudyCardsList from "./StudyCardsList";
import Button from "@/components/ui/Button";
import { extractErrorMessage } from "@/lib/errorHandler";
import styles from "./IGOpsStudies.module.css";
import Loading from "../ui/Loading";
import { Alert, AlertMessage, HelperText } from "../shared/uikitExports";
import Search from "../ui/Search";

export default function IGOpsStudies() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setError] = useState<string | null>(null);
  const [studies, setStudies] = useState<Study[]>([]);
  const [tab, setTab] = useState("pending");

  const studiesPerPage = 12;
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [noMoreStudies, setNoMoreStudies] = useState(false);
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

      if (!response.response.ok || !response.data) {
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
      let response;

      switch (true) {
        case query.includes("caseref:"):
          response = await getStudies({
            query: { caseref: Number(query.split("caseref:")[1]) },
          });
          break;
        case query.includes("title:"):
          response = await getStudies({
            query: { fuzzy_title: query.split("title:")[1] },
          });
          break;
        case query.includes("iao:"):
          response = await getStudies({
            query: { owner_username: query.split("iao:")[1] },
          });
          break;
        default:
          response = await getStudies({ query: { query: query } });
      }

      if (!response.response.ok || !response.data) {
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
      const response = await getStudies({ query: { offset: newOffset, limit: studiesPerPage, query: searchQuery } });
      if (!response.response.ok || !response.data) {
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
  }, [tab]);

  const emptyMessage = tab === "pending" ? "No studies pending approval" : "No studies found";

  return (
    <>
      <h2>{tab === "pending" ? "Studies to Review" : "All Studies"}</h2>

      <div className={"tab-collection"}>
        <Button
          onClick={() => setTab("pending")}
          variant="secondary"
          className={`tab ${tab === "pending" ? "active" : ""}`}
        >
          Pending Studies
        </Button>

        <Button
          onClick={() => setTab("all")}
          variant="secondary"
          className={`tab ${tab === "all" ? "active" : ""}`}
          data-cy="all-studies-tab-button"
        >
          All Studies
        </Button>
      </div>

      {tab === "pending" ? (
        <p>Studies submitted for review. Approve or request changes for each study.</p>
      ) : (
        <>
          <p>All studies in the Portal, organised by status.</p>
          <div>
            <Search
              placeholder="Search Studies"
              onSearch={(query) => handleSearch(query)}
              id="study-search"
              onClear={handleClearSearch}
            />
            <HelperText>
              <small>
                You can use keywords to narrow your search: caseref, title, iao. eg. `caseref:12345`
                <br></br>Note that `iao` will search IAO usernames (UPI, eg. ccabcd)
              </small>
            </HelperText>
          </div>
        </>
      )}

      {errorMessage && (
        <Alert type="error">
          <AlertMessage>{errorMessage}</AlertMessage>
        </Alert>
      )}

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
