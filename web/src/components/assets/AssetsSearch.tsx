import { useEffect, useState } from "react";
import { Asset, GetAssetsData, getAssets } from "@/openapi";
import Search from "@/components/ui/Search";
import PageHeader from "@/components/ui/PageHeader";
import { HelperText } from "@/components/ui/uikitExports";
import { AssetDefinition } from "@/components/shared/entityDefinitions";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import NoObjects from "@/components/ui/NoObjects";
import Pagination from "@/components/ui/Pagination";
import AssetResultsList from "./AssetResultsList";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import { usePagination, DEFAULT_PAGE_SIZE } from "@/hooks/usePagination";
import styles from "./AssetsSearch.module.css";
import { useAuth } from "@/hooks/useAuth";

export default function AssetsSearch() {
  const { canSeeAllStudies } = useAuth();

  const [infoCalloutExpanded, setInfoCalloutExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchPage = async (offset: number, searchQuery: string): Promise<Asset[] | undefined> => {
    setError(null);
    try {
      const request: GetAssetsData = { url: "/assets", query: { offset, limit: DEFAULT_PAGE_SIZE } };
      if (searchQuery) request.query = { ...request.query, query: searchQuery };

      const response = await getAssets(request);
      if (responseIsError(response) || !response.data) {
        setError(`Failed to fetch assets: ${extractErrorMessage(response)}`);
        return undefined;
      }
      return response.data;
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      setError("Failed to fetch assets. Please try again.");
      return undefined;
    }
  };

  const { offset, noMore, nextPage, previousPage, reset } = usePagination<Asset>({
    fetchPage: (offset) => fetchPage(offset, query),
    onItemsFetched: setAssets,
  });

  const loadFirstPage = async (searchQuery: string) => {
    setIsLoading(true);
    reset();
    const items = await fetchPage(0, searchQuery);
    if (items !== undefined) setAssets(items);
    setIsLoading(false);
  };

  useEffect(() => {
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
        title={canSeeAllStudies ? "All Assets" : "Your Assets"}
        info={{
          label: "Toggle asset definition",
          expanded: infoCalloutExpanded,
          onToggle: () => setInfoCalloutExpanded(!infoCalloutExpanded),
        }}
      />

      {infoCalloutExpanded && <AssetDefinition />}

      <HelperText>Search assets you have access to across all studies.</HelperText>
      <Search placeholder="Search Assets" onSearch={handleSearch} id="assets-search" onClear={handleClearSearch} />
      <div className={styles.results}>
        {isLoading && <Loading message="Loading assets..." />}

        {!isLoading && assets.length === 0 && <NoObjects message="No assets found" />}

        {!isLoading && assets.length > 0 && (
          <>
            <AssetResultsList assets={assets} />
            <Pagination
              offset={offset}
              pageSize={DEFAULT_PAGE_SIZE}
              itemCount={assets.length}
              noMore={noMore}
              itemLabel="assets"
              onNext={nextPage}
              onPrevious={previousPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
