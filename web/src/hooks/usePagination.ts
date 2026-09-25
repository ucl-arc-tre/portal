import { useState } from "react";

// corresponds to the limits defined in internal/config/main.go
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

type Props<T> = {
  pageSize?: number;
  fetchPage: (offset: number) => Promise<T[] | undefined>;
  onItemsFetched: (items: T[]) => void;
};

export function usePagination<T>(props: Props<T>) {
  const { pageSize = DEFAULT_PAGE_SIZE, fetchPage, onItemsFetched } = props;
  const [offset, setOffset] = useState(0);
  const [noMore, setNoMore] = useState(false);

  const goToOffset = async (newOffset: number) => {
    const items = await fetchPage(newOffset);
    if (items === undefined) return;
    if (items.length !== 0) {
      onItemsFetched(items);
      setOffset(newOffset);
      setNoMore(false);
    } else {
      setNoMore(true);
    }
  };

  const nextPage = () => goToOffset(offset + pageSize);
  const previousPage = () => goToOffset(Math.max(0, offset - pageSize));
  const reset = () => {
    setOffset(0);
    setNoMore(false);
  };

  return { offset, noMore, nextPage, previousPage, reset, pageSize };
}
