import { useEffect, useRef, useState } from "react";
import { GetStudiesData, Study, getStudies } from "@/openapi";
import StudyCardsList from "./StudyCardsList";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Loading from "../ui/Loading";
import { HelperText } from "../shared/uikitExports";
import Error from "../ui/Error";
import Search from "../ui/Search";
import Pagination from "../ui/Pagination";
import NoObjects from "../ui/NoObjects";
import TabCollection from "../shared/TabCollection";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { usePagination, DEFAULT_PAGE_SIZE } from "@/hooks/usePagination";

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
  const searchQueryRef = useRef("");

  const router = useRouter();
  const tab = (router.query.tab as "all" | "pending") ?? "all";

  const fetchStudies = async (offset?: number): Promise<Study[] | undefined> => {
    setError(null);
    try {
      const response =
        tab === "pending"
          ? await getStudies({ query: { status: "Pending" } })
          : offset
            ? await getStudies({ query: { offset: offset, limit: DEFAULT_PAGE_SIZE } })
            : await getStudies({ query: { limit: DEFAULT_PAGE_SIZE } });

      if (responseIsError(response) || !response.data) {
        setError(`Failed to fetch studies: ${extractErrorMessage(response)}`);
        return undefined;
      }
      setStudies(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch studies:", error);
      setError("Failed to fetch studies. Please try again.");
      return undefined;
    }
  };

  // search-driven fetch: used for search submissions and next/prev pagination
  const fetchPage = async (offset: number): Promise<Study[] | undefined> => {
    setError(null);
    try {
      const request = studiesRequestData(searchQueryRef.current);
      if (!request.query) {
        request.query = {};
      }
      request.query.offset = offset;
      request.query.limit = DEFAULT_PAGE_SIZE;

      const response = await getStudies(request);
      if (responseIsError(response) || !response.data) {
        setError(`Search failed: ${extractErrorMessage(response)}`);
        return undefined;
      }
      return response.data;
    } catch (error) {
      console.error("Search failed:", error);
      setError("Search failed. Please try again.");
      return undefined;
    }
  };

  const { offset, noMore, nextPage, previousPage, reset } = usePagination<Study>({
    fetchPage,
    onItemsFetched: setStudies,
  });

  const handleSearch = async (query: string) => {
    searchQueryRef.current = query;
    setIsLoading(true);
    reset();
    const items = await fetchPage(0);
    if (items !== undefined) setStudies(items);
    setIsLoading(false);
  };

  const handleClearSearch = async () => {
    searchQueryRef.current = "";
    setIsLoading(true);
    reset();
    await fetchStudies(0);
    setIsLoading(false);
  };

  useEffect(() => {
    searchQueryRef.current = "";
    setIsLoading(true);
    reset();
    fetchStudies().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              onSearch={handleSearch}
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

      {!isLoading && studies.length === 0 && <NoObjects message={emptyMessage} />}

      {studies.length > 0 && (
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
            helpText={<small>Please note these results have been ordered by date of IAO signoff</small>}
          />
        </>
      )}
    </>
  );
}
