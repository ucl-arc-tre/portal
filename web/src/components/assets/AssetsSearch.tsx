import { useState } from "react";
import Search from "@/components/ui/Search";
import { HelperText } from "@/components/ui/uikitExports";
import styles from "./AssetsSearch.module.css";

export default function AssetsSearch() {
  const [query, setQuery] = useState("");

  const handleSearch = (searchQuery: string) => setQuery(searchQuery);
  const handleClearSearch = () => setQuery("");

  return (
    <div>
      <Search
        placeholder="Search assets by name, study, third party..."
        onSearch={handleSearch}
        id="assets-search"
        onClear={handleClearSearch}
      />

      <div className={styles.results}>
        <HelperText>{query === "" ? "Enter a search above to find assets." : "Asset results will go here."}</HelperText>
      </div>

      <div>Feature not yet implemented</div>
    </div>
  );
}
