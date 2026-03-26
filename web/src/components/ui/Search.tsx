import dynamic from "next/dynamic";
import styles from "./Search.module.css";

const UCLSearch = dynamic(() => import("uikit-react-public").then((mod) => mod.Search), {
  ssr: false,
});

type Props = React.ComponentProps<typeof UCLSearch> & {
  placeholder?: string;
  onSearch: (query: string) => void;
  id: string;
};
export default function Search(props: Props) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const inputValue = event.currentTarget.querySelector("input")?.value;
      props.onSearch(inputValue || "");
    }
  };

  return (
    <UCLSearch
      placeholder={props.placeholder}
      onSearch={props.onSearch}
      id={props.id}
      className={styles.search}
      onKeyDown={handleKeyDown}
    />
  );
}
