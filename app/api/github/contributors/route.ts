import { NextRequest, NextResponse } from "next/server";
import { getContributorStats } from "@/lib/github";
import { getGitHubToken, parseRepoQuery, toGitHubErrorResponse } from "@/app/api/github/_utils";

export const revalidate = 300;

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { owner, repo } = parseRepoQuery(new URL(request.url));
    const token = await getGitHubToken();
    const contributors = await getContributorStats(owner, repo, token);
    return NextResponse.json(contributors);
  } catch (error) {
    return toGitHubErrorResponse(error);
  }
}
