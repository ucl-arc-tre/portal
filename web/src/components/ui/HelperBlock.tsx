import { JSX, useState } from "react";
import Button from "./Button";
import styles from "./HelperBlock.module.css";
import { HelperText } from "./uikitExports";

type Props = {
  text: string;
  tellMeMore?: string | JSX.Element;
};

export default function HelperBlock({ text, tellMeMore }: Props) {
  const [tellMeMoreExpanded, setTellMeMoreExpanded] = useState(false);
  return (
    <div className={styles.block}>
      <HelperText className={`${styles.helper} ${tellMeMore ? styles["tell-more-available"] : ""}`}>
        {text}{" "}
        {tellMeMore && (
          <Button
            variant="tertiary"
            size="small"
            inline
            aria-label="Toggle tell me more popover"
            aria-expanded={tellMeMoreExpanded}
            onClick={() => setTellMeMoreExpanded((prev) => !prev)}
          >
            Tell me more
          </Button>
        )}
      </HelperText>

      {tellMeMoreExpanded && tellMeMore && <HelperText className={styles["tell-me-more"]}>{tellMeMore}</HelperText>}
    </div>
  );
}
