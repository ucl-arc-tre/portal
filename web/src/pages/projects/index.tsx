import MetaHead from "@/components/meta/Head";
import Projects from "@/components/projects/Projects";

export default function StudiesPage() {
  return (
    <>
      <MetaHead
        title="Projects | ARC Services Portal"
        description="View and modify projects in the ARC Services Portal"
      />
      <div>
        <Projects />
      </div>
    </>
  );
}
