import { NextRequest, NextResponse } from "next/server";
import { getBranchSha, getRepoTree, resolveTreeFromDefaultBranch } from "@/lib/github";
import { getGitHubToken, parseRepoQuery, parseTreeQuery, toGitHubErrorResponse } from "@/app/api/github/_utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const { owner, repo } = parseRepoQuery(url);
    const { sha, branch } = parseTreeQuery(url);
    const token = await getGitHubToken();

    if (sha) {
      const tree = await getRepoTree(owner, repo, sha, token);
      return NextResponse.json(tree);
    }

    if (branch) {
      const branchSha = await getBranchSha(owner, repo, branch, token);
      const tree = await getRepoTree(owner, repo, branchSha, token);
      return NextResponse.json(tree);
    }

    const tree = await resolveTreeFromDefaultBranch(owner, repo, token);

    return NextResponse.json(tree);
  } catch (error) {
    return toGitHubErrorResponse(error);
  }
}
