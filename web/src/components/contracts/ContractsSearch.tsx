import { useEffect, useState } from "react";
import Search from "@/components/ui/Search";
import { HelperText } from "@/components/ui/uikitExports";
import styles from "./ContractsSearch.module.css";
import PageHeader from "../ui/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { ContractDefinition } from "../shared/entityDefinitions";
import { Contract, getContracts, GetContractsData } from "@/openapi";
import { usePagination, DEFAULT_PAGE_SIZE } from "@/hooks/usePagination";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Error from "../ui/Error";
import Loading from "../ui/Loading";
import NoObjects from "../ui/NoObjects";
import Pagination from "../ui/Pagination";
import ContractResultsList from "./ContractResultsList";

export default function ContractsSearch() {
  const [infoCalloutExpanded, setInfoCalloutExpanded] = useState(false);
  const { canSeeAllStudies } = useAuth();
  const [query, setQuery] = useState("");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPage = async (offset: number, searchQuery: string): Promise<Contract[] | undefined> => {
    setError(null);
    try {
      const request: GetContractsData = { url: "/contracts", query: { offset, limit: DEFAULT_PAGE_SIZE } };
      if (searchQuery) request.query = { ...request.query, query: searchQuery };

      const response = await getContracts(request);
      if (responseIsError(response) || !response.data) {
        setError(`Failed to fetch contracts: ${extractErrorMessage(response)}`);
        return undefined;
      }
      return response.data;
    } catch (error) {
      console.error("Failed to fetch contracts:", error);
      setError("Failed to fetch contracts. Please try again.");
      return undefined;
    }
  };

  const { offset, noMore, nextPage, previousPage, reset } = usePagination<Contract>({
    fetchPage: (offset) => fetchPage(offset, query),
    onItemsFetched: setContracts,
  });

  const loadFirstPage = async (searchQuery: string) => {
    setIsLoading(true);
    reset();
    const items = await fetchPage(0, searchQuery);
    if (items !== undefined) setContracts(items);
    setIsLoading(false);
  };

  useEffect(() => {
    // Reuse the search loader on mount; its synchronous resets match the initial state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFirstPage("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    loadFirstPage(searchQuery);
  };

  const handleClearSearch = () => {
    setQuery("");
    loadFirstPage("");
  };

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title={canSeeAllStudies ? "All Contracts" : "Your Contracts"}
        info={{
          label: "Toggle contract definition",
          expanded: infoCalloutExpanded,
          onToggle: () => setInfoCalloutExpanded(!infoCalloutExpanded),
        }}
      />

      {infoCalloutExpanded && <ContractDefinition />}

      <HelperText>Search contracts you have access to across all studies.</HelperText>
      <Search
        placeholder="Search contracts by name, study, third party..."
        onSearch={handleSearch}
        id="contracts-search"
        onClear={handleClearSearch}
      />

      <div className={styles.results}>
        {isLoading && <Loading message="Loading contracts..." />}

        {!isLoading && contracts.length === 0 && <NoObjects message="No contracts found" />}

        {!isLoading && contracts.length > 0 && (
          <>
            <ContractResultsList contracts={contracts} />
            <Pagination
              offset={offset}
              pageSize={DEFAULT_PAGE_SIZE}
              itemCount={contracts.length}
              noMore={noMore}
              itemLabel="contracts"
              onNext={nextPage}
              onPrevious={previousPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
