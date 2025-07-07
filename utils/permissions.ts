import { AccessPermission } from "../models/profile.ts";

export function getAccessPermissionsByPackageTier(tier: number): AccessPermission[] {
  const base = [{ module: "dashboard", access: true }];
  if (tier === 2) return [...base, { module: "reports", access: true }];
  if (tier === 3) return [...base, { module: "reports", access: true }, { module: "counseling", access: true }];
  return base;
}
