import Button from "./Button";
import { HelperText } from "../shared/uikitExports";
import styles from "./Pagination.module.css";

type Props = {
  offset: number;
  pageSize: number;
  itemCount: number;
  noMore: boolean;
  itemLabel: string;
  onNext: () => void;
  onPrevious: () => void;
  helpText?: React.ReactNode;
};

export default function Pagination(props: Props) {
  const { offset, pageSize, itemCount, noMore, itemLabel, onNext, onPrevious, helpText } = props;

  return (
    <div className={styles["pagination-container"]}>
      <div className={styles["pagination-buttons"]}>
        {(offset >= pageSize || noMore) && (
          <Button size="small" variant="secondary" className={styles["prev-button"]} onClick={onPrevious}>
            Previous Page
          </Button>
        )}

        <small>
          Showing {itemLabel} {offset + 1} - {offset + itemCount}
        </small>

        {itemCount >= pageSize && (
          <Button size="small" variant="secondary" className={styles["next-button"]} onClick={onNext} disabled={noMore}>
            Next Page
          </Button>
        )}
      </div>

      <HelperText className={styles["pagination-help"]}>
        {noMore && <div>No more {itemLabel} available</div>}
        {helpText}
      </HelperText>
    </div>
  );
}
