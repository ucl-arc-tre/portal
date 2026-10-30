import { useState } from "react";
import Search from "@/components/ui/Search";
import { HelperText } from "@/components/ui/uikitExports";
import styles from "./ContractsSearch.module.css";

export default function ContractsSearch() {
  const [query, setQuery] = useState("");

  const handleSearch = (searchQuery: string) => setQuery(searchQuery);
  const handleClearSearch = () => setQuery("");

  return (
    <div>
      <Search
        placeholder="Search contracts by name, study, third party..."
        onSearch={handleSearch}
        id="contracts-search"
        onClear={handleClearSearch}
      />

      <div className={styles.results}>
        <HelperText>
          {query === "" ? "Enter a search above to find contracts." : "Contract results will go here."}
        </HelperText>
      </div>

      <div>Feature not yet implemented</div>
    </div>
  );
}
