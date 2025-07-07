import { saveUserProfile, getUserProfile } from "../services/dynamo.ts";
import { getAccessPermissionsByPackageTier } from "../utils/permissions.ts";

export async function createOrUpdateProfile(req: Request): Promise<Response> {
  const profile = await req.json();
  if (profile.packageTier) {
    profile.accessPermissions = getAccessPermissionsByPackageTier(profile.packageTier);
  }
  profile.updatedAt = new Date().toISOString();
  await saveUserProfile(profile);
  return Response.json({ status: "saved", profile });
}

export async function fetchProfile(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")!;
  const profile = await getUserProfile(id);
  return Response.json(profile || {});
}
