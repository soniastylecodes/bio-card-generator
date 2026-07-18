import { Octokit } from "@octokit/rest";
import sharp from "sharp";
import "dotenv/config";

let octokitInstance: Octokit | null = null;

function getGithubClient(): Octokit {
  if (!octokitInstance) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GITHUB_TOKEN is missing in environment variables.");
    }
    octokitInstance = new Octokit({ auth: token });
  }
  return octokitInstance;
}

/**
 * Processes a base64 image, resizes it for performance, and uploads it to GitHub.
 * Returns the public CDN URL on success.
 */
export async function uploadProfilePhoto(base64Data: string, originalFilename: string): Promise<string> {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!owner || !repo) {
    throw new Error("GITHUB_OWNER or GITHUB_REPO is not configured.");
  }

  const octokit = getGithubClient();

  // Extract raw base64 data
  const matches = base64Data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
  let buffer: Buffer;
  if (matches && matches.length === 3) {
    buffer = Buffer.from(matches[2], "base64");
  } else {
    // Fallback: decode raw base64 string
    buffer = Buffer.from(base64Data, "base64");
  }

  // Resize and compress using Sharp to optimize bandwidth and load times
  const processedBuffer = await sharp(buffer)
    .resize(300, 300, { fit: "cover" })
    .jpeg({ quality: 80 })
    .toBuffer();

  const fileContentBase64 = processedBuffer.toString("base64");
  
  // Create a clean filename
  const cleanBase = originalFilename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `photo_${Date.now()}_${cleanBase}.jpg`;
  const filePath = `uploads/${filename}`;

  // Upload file via GitHub API
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: `Upload profile photo: ${filename}`,
    content: fileContentBase64,
    branch,
  });

  // Return the public raw CDN URL
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
}
