import { describe, expect, test } from "bun:test";
import { parseRepoInput } from "@/lib/utils";
import { RepoInputSchema } from "@/lib/schemas/github";

describe("repo input parsing", () => {
  test("parses shorthand owner/repo input", () => {
    expect(parseRepoInput("facebook/react")).toEqual({
      owner: "facebook",
      repo: "react",
    });
  });

  test("parses github url input", () => {
    expect(parseRepoInput("https://github.com/vercel/next.js")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  test("rejects invalid repository text", () => {
    expect(RepoInputSchema.safeParse("not-a-repo").success).toBe(false);
  });
});
