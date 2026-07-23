import { useRouter } from "next/router";
import Button from "../ui/Button";

export default function ProjectTabs() {
  const router = useRouter();
  const tab = (router.query.tab as "project" | "members" | "assets") ?? "project";
  const setTab = (newTab: string) =>
    router.push({ query: { ...router.query, tab: newTab } }, undefined, { shallow: true });

  return (
    <div className={"tab-collection"}>
      <Button
        onClick={() => setTab("project")}
        variant="secondary"
        className={`tab ${tab === "project" ? "active" : ""}`}
        cy="project-overview"
      >
        Project Overview
      </Button>

      <Button
        onClick={() => setTab("members")}
        variant="secondary"
        className={`tab ${tab === "members" ? "active" : ""}`}
        cy="project-members"
      >
        Members
      </Button>

      <Button
        onClick={() => setTab("assets")}
        variant="secondary"
        className={`tab ${tab === "assets" ? "active" : ""}`}
        cy="project-assets"
      >
        Assets
      </Button>
    </div>
  );
}
