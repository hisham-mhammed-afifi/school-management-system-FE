export interface Permission {
  id: string;
  module: string;
  action: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  schoolId: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

export interface CreateRoleRequest {
  name: string;
}

export interface UpdateRoleRequest {
  name: string;
}

export interface SetPermissionsRequest {
  permissionIds: string[];
}

export interface ListRolesQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const SEED_ROLES = [
  'super_admin',
  'school_admin',
  'principal',
  'teacher',
  'student',
  'guardian',
  'accountant',
] as const;
