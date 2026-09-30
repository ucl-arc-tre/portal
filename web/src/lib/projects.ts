import { getProjects, Project } from "@/openapi";
import { MAX_PAGE_SIZE } from "@/hooks/usePagination";
import { responseIsError } from "./errorHandler";

// Accumulate all projects with pagination
export async function getAllProjects() {
  const projects: Project[] = [];

  while (true) {
    const response = await getProjects({
      query: { limit: MAX_PAGE_SIZE, offset: projects.length },
    });
    if (responseIsError(response) || !response.data) {
      return response;
    }

    projects.push(...response.data);
    if (response.data.length < MAX_PAGE_SIZE) {
      return { ...response, data: projects };
    }
  }
}
