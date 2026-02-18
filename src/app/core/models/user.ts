export interface UserRole {
  roleId: string;
  roleName: string;
  schoolId: string | null;
  schoolName: string | null;
}

export interface User {
  id: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
}

export interface CreateUserRequest {
  email: string;
  phone?: string;
  password: string;
  teacherId?: string;
  studentId?: string;
  guardianId?: string;
  roleIds: string[];
}

export interface UpdateUserRequest {
  email?: string;
  phone?: string;
  isActive?: boolean;
}

export interface AssignRoleRequest {
  roleId: string;
  schoolId?: string;
}

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'email' | 'lastLoginAt';
  order?: 'asc' | 'desc';
  roleId?: string;
  isActive?: boolean;
  search?: string;
}
