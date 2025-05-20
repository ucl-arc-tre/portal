import "./not-found.css";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="not-found">
      <p>Sorry, the requested page does not exist.</p>
      <Button size="small" link="/">
        &larr; Back to Home
      </Button>
    </div>
  );
}
