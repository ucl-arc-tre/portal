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
    <div className={`${styles.block} ${tellMeMore ? styles["tell-more"] : ""}`}>
      <HelperText>
        {text}{" "}
        {tellMeMore && (
          <Button
            variant="tertiary"
            size="small"
            inline
            aria-label="Toggle tell me more popover"
            aria-expanded={false}
            onClick={() => setTellMeMoreExpanded((prev) => !prev)}
          >
            Tell me more
          </Button>
        )}
      </HelperText>

      {tellMeMoreExpanded && tellMeMore && (
        <HelperText>
          <br></br>
          {tellMeMore}
        </HelperText>
      )}
    </div>
  );
}
