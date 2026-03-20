import { NextRequest, NextResponse } from "next/server";
import { getRepoMeta } from "@/lib/github";
import { getGitHubToken, parseRepoQuery, toGitHubErrorResponse } from "@/app/api/github/_utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { owner, repo } = parseRepoQuery(new URL(request.url));
    const token = await getGitHubToken();
    const repoMeta = await getRepoMeta(owner, repo, token);
    return NextResponse.json(repoMeta);
  } catch (error) {
    return toGitHubErrorResponse(error);
  }
}
