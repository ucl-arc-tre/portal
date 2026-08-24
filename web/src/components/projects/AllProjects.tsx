import { useEffect, useRef, useState } from "react";
import { GetProjectsData, Project, getProjects } from "@/openapi";
import ProjectCardsList from "./ProjectCardsList";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Loading from "../ui/Loading";
import { HelperText } from "../shared/uikitExports";
import Error from "../ui/Error";
import Search from "../ui/Search";
import Pagination from "../ui/Pagination";
import NoObjects from "../ui/NoObjects";
import { usePagination, DEFAULT_PAGE_SIZE } from "@/hooks/usePagination";

type Props = {
  refreshToken: number;
};

function projectsRequestData(raw: string): GetProjectsData {
  const request: GetProjectsData = {
    url: "/projects",
  };
  if (raw.includes("owner:")) {
    request.query = { owner: raw.split("owner:")[1] };
    return request;
  }
  request.query = { query: raw };
  return request;
}

export default function AllProjects(props: Props) {
  const { refreshToken } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const searchQueryRef = useRef("");

  const fetchPage = async (offset: number): Promise<Project[] | undefined> => {
    setError(null);
    try {
      const request = projectsRequestData(searchQueryRef.current);
      if (!request.query) {
        request.query = {};
      }
      request.query.offset = offset;
      request.query.limit = DEFAULT_PAGE_SIZE;

      const response = await getProjects(request);
      if (responseIsError(response) || !response.data) {
        setError(`Failed to fetch projects: ${extractErrorMessage(response)}`);
        return undefined;
      }
      return response.data;
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setError("Failed to fetch projects. Please try again.");
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const { offset, noMore, nextPage, previousPage, reset } = usePagination<Project>({
    fetchPage,
    onItemsFetched: setProjects,
  });

  const runSearch = async (query: string) => {
    searchQueryRef.current = query;
    setIsLoading(true);
    reset();
    const items = await fetchPage(0);
    if (items !== undefined) setProjects(items);
  };

  useEffect(() => {
    searchQueryRef.current = "";
    setIsLoading(true);
    reset();
    fetchPage(0).then((items) => {
      if (items !== undefined) setProjects(items);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  return (
    <>
      <div>
        <Search placeholder="Search Projects" onSearch={runSearch} id="project-search" onClear={() => runSearch("")} />
        <HelperText>
          <small>You can use keywords to narrow your search: owner. eg. `owner:bob`</small>
        </HelperText>
      </div>

      {errorMessage && <Error message={errorMessage} />}

      {isLoading && <Loading message="Loading projects..." />}

      {!isLoading && projects.length === 0 && <NoObjects message="No projects found" />}

      {projects.length > 0 && (
        <>
          <ProjectCardsList projects={projects} />
          <Pagination
            offset={offset}
            pageSize={DEFAULT_PAGE_SIZE}
            itemCount={projects.length}
            noMore={noMore}
            itemLabel="projects"
            onNext={nextPage}
            onPrevious={previousPage}
          />
        </>
      )}
    </>
  );
}
