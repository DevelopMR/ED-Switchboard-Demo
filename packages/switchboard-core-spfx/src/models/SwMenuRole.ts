export const SwMenuRoles = ["Operator", "Manager", "Admin"] as const;

export type SwMenuRole = (typeof SwMenuRoles)[number];
