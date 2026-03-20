import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { GitHubApiError } from "@/lib/github";

const RepoQuerySchema = z.object({
  owner: z.string().trim().min(1),
  repo: z.string().trim().min(1),
});

const TreeQuerySchema = RepoQuerySchema.extend({
  sha: z.string().trim().min(1).optional(),
  branch: z.string().trim().min(1).optional(),
});

export async function getGitHubToken(): Promise<string | undefined> {
  const session = await auth();
  return session?.accessToken;
}

export function parseRepoQuery(url: URL): z.infer<typeof RepoQuerySchema> {
  return RepoQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
}

export function parseTreeQuery(url: URL): z.infer<typeof TreeQuerySchema> {
  return TreeQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
}

export function toGitHubErrorResponse(error: unknown): NextResponse {
  if (error instanceof GitHubApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        retryAfter: error.retryAfter ?? null,
      },
      { status: error.status },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message, code: "api_error" }, { status: 500 });
  }

  return NextResponse.json({ error: "Unexpected API failure", code: "api_error" }, { status: 500 });
}
