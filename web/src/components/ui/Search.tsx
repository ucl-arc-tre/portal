import dynamic from "next/dynamic";
import styles from "./Search.module.css";
import { useEffect } from "react";

const UCLSearch = dynamic(() => import("uikit-react-public").then((mod) => mod.Search), {
  ssr: false,
});

type Props = React.ComponentProps<typeof UCLSearch> & {
  placeholder?: string;
  onSearch: (query: string) => void;
  id: string;
  onClear?: () => void;
};
export default function Search(props: Props) {
  const { placeholder, onSearch, id, onClear } = props;
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const inputValue = event.currentTarget.querySelector("input")?.value;
      onSearch(inputValue || "");
    }
  };

  useEffect(() => {
    if (onClear) {
      const handleClear = () => {
        onClear();
      };
      const clearButton = document.querySelector(
        '[data-testid="ucl-uikit-search-clear-search-btn"]'
      ) as HTMLButtonElement | null;

      clearButton?.addEventListener("click", handleClear);

      return () => {
        clearButton?.removeEventListener("click", handleClear);
      };
    }
  }, [onClear]);

  return (
    <UCLSearch
      placeholder={placeholder}
      onSearch={onSearch}
      id={id}
      className={styles.search}
      onKeyDown={handleKeyDown}
    />
  );
}
