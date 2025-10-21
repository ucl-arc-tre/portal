import Link from "next/link";
import styles from "./Feedback.module.css";

const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "arc.tre@ucl.ac.uk";
const encodedEmailBody = encodeURI("Dear Portal Team,\n\n ...");
const emailSubject = "ARC Services Portal feedback";

export default function Feedback() {
  return (
    <Link className={styles["button"]} href={`mailto:${email}?subject=${emailSubject}&body=${encodedEmailBody}`}>
      {"Feedback"}
    </Link>
  );
}
