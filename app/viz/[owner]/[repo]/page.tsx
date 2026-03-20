import { RepoDashboard } from "@/components/viz/RepoDashboard";

interface RepoPageProps {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function RepoPage({ params }: RepoPageProps): Promise<React.ReactNode> {
  const { owner, repo } = await params;
  return <RepoDashboard owner={owner} repo={repo} />;
}
