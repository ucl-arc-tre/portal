import Link from "next/link";

const NotFound = () => {
  return (
    <div>
      <p>Sorry, the requested page does not exist.</p>
      <Link href="/">Back to Home</Link>
    </div>
  );
};

export default NotFound;
