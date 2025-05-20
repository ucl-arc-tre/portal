import Link from "next/link";
import "./not-found.css";

export default function NotFound() {
  return (
    <div className="not-found">
      <p>Sorry, the requested page does not exist.</p>
      <Link href="/">&larr; Back to Home</Link>
    </div>
  );
}
