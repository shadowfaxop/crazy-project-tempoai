import { NextResponse } from "next/server";
import { initGit, createBranch, commitAndPushFiles } from "@/lib/git-utils";

export async function POST(request: Request) {
  try {
    const { action, ...params } = await request.json();

    switch (action) {
      case "init": {
        const { repoUrl, username, token } = params;
        const success = await initGit(repoUrl, username, token);
        return NextResponse.json({ success });
      }

      case "createBranch": {
        const { branchName } = params;
        const success = await createBranch(branchName);
        return NextResponse.json({ success });
      }

      case "commitAndPush": {
        const { files, commitMessage, directory = "" } = params;
        const success = await commitAndPushFiles(
          files,
          commitMessage,
          directory,
        );
        return NextResponse.json({ success });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Git API error:", error);
    return NextResponse.json(
      { error: "Git operation failed", message: error.message },
      { status: 500 },
    );
  }
}
