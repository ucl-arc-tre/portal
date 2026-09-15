import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GetStudiesData, Study, getStudies } from "@/openapi";
import Search from "@/components/ui/Search";
import TabCollection from "@/components/ui/TabCollection";
import { HelperText } from "@/components/ui/uikitExports";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import NoObjects from "@/components/ui/NoObjects";
import Pagination from "@/components/ui/Pagination";
import StudyCardsList from "@/components/studies/StudyCardsList";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import { usePagination, DEFAULT_PAGE_SIZE } from "@/hooks/usePagination";

type SearchTab = "all" | "studies" | "assets" | "contracts" | "projects" | "people";

export default function IGSearch() {
  const router = useRouter();
  const tab = (router.query.tab as SearchTab) ?? "all";

  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [studies, setStudies] = useState<Study[]>([]);

  const fetchStudies = async (offset: number): Promise<Study[] | undefined> => {
    setErrorMessage(null);
    try {
      const request: GetStudiesData = { url: "/studies", query: { query, offset, limit: DEFAULT_PAGE_SIZE } };
      const response = await getStudies(request);
      if (responseIsError(response) || !response.data) {
        setErrorMessage(`Search failed: ${extractErrorMessage(response)}`);
        return undefined;
      }
      return response.data;
    } catch (error) {
      console.error("Study search failed:", error);
      setErrorMessage("Search failed. Please try again.");
      return undefined;
    }
  };

  const { offset, noMore, nextPage, previousPage, reset } = usePagination<Study>({
    fetchPage: fetchStudies,
    onItemsFetched: setStudies,
  });

  useEffect(() => {
    if (tab !== "studies" || query === "") {
      setStudies([]);
      return;
    }
    setIsLoading(true);
    reset();
    fetchStudies(0).then((items) => {
      if (items !== undefined) setStudies(items);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, query]);

  const handleSearch = (searchQuery: string) => setQuery(searchQuery);
  const handleClearSearch = () => setQuery("");

  return (
    <div>
      <Search
        placeholder="Search by name, caseref, username, third party..."
        onSearch={handleSearch}
        id="ig-search"
        onClear={handleClearSearch}
      />

      <TabCollection
        tabs={[
          { name: "all", label: "All results" },
          { name: "studies", label: "Studies" },
          { name: "assets", label: "Assets" },
          { name: "contracts", label: "Contracts" },
          { name: "projects", label: "Projects" },
          { name: "people", label: "People" },
        ]}
        defaultTab="all"
      />

      {tab === "studies" ? (
        <>
          {errorMessage && <Error message={errorMessage} />}

          {isLoading && <Loading message="Searching studies..." />}

          {!isLoading && query === "" && <HelperText>Enter a search above to find studies.</HelperText>}

          {!isLoading && query !== "" && studies.length === 0 && <NoObjects message="No studies found" />}

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
              />
            </>
          )}
        </>
      ) : (
        <HelperText>{tab} results will go here.</HelperText>
      )}
    </div>
  );
}
