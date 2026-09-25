import { useEffect, useState } from "react";
import { GetStudiesData, Study, getStudies } from "@/openapi";
import StudyCardsList from "./StudyCardsList";
import Loading from "../ui/Loading";
import Error from "../ui/Error";
import Search from "../ui/Search";
import NoObjects from "../ui/NoObjects";
import Pagination from "../ui/Pagination";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import { useAuth } from "@/hooks/useAuth";
import { usePagination, DEFAULT_PAGE_SIZE } from "@/hooks/usePagination";

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

  const fetchPage = async (offset: number, searchQuery: string): Promise<Study[] | undefined> => {
    setError(null);
    try {
      const request: GetStudiesData = { url: "/studies", query: { offset, limit: DEFAULT_PAGE_SIZE } };
      if (searchQuery) request.query = { ...request.query, query: searchQuery };

      const response = await getStudies(request);
      if (responseIsError(response) || !response.data) {
        setError(`Failed to fetch studies: ${extractErrorMessage(response)}`);
        return undefined;
      }
      if (offset === 0 && !searchQuery) setHasAnyStudies(response.data.length > 0);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch studies:", error);
      setError("Failed to fetch studies. Please try again.");
      return undefined;
    }
  };

  const { offset, noMore, nextPage, previousPage, reset } = usePagination<Study>({
    fetchPage: (offset) => fetchPage(offset, query),
    onItemsFetched: setStudies,
  });

  const loadFirstPage = async (searchQuery: string) => {
    setIsLoading(true);
    reset();
    const items = await fetchPage(0, searchQuery);
    if (items !== undefined) setStudies(items);
    setIsLoading(false);
  };

  useEffect(() => {
    setQuery("");
    loadFirstPage("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    loadFirstPage(searchQuery);
  };

  const handleClearSearch = () => {
    setQuery("");
    loadFirstPage("");
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

      {!isLoading && studies.length > 0 && (
        <>
          <StudyCardsList studies={studies} />
          <Pagination
            offset={offset}
            pageSize={DEFAULT_PAGE_SIZE}
            itemCount={studies.length}
            noMore={noMore}
            itemLabel="studies"
            onNext={nextPage}
            onPrevious={previousPage}
          />
        </>
      )}
    </>
  );
}
