export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  schoolId: string | null;
  schools: { id: string; name: string }[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

/** Role shape returned by GET /api/v1/auth/me */
export interface UserProfileRole {
  roleId: string;
  roleName: string;
  schoolId: string | null;
  schoolName: string | null;
}

/** Full profile returned by GET /api/v1/auth/me */
export interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  roles: UserProfileRole[];
  permissions: string[];
}

/** Maps the rich /auth/me response to the flat AuthUser the app uses */
export function mapProfileToAuthUser(profile: UserProfile): AuthUser {
  const schoolMap = new Map<string, string>();
  for (const r of profile.roles) {
    if (r.schoolId && r.schoolName) {
      schoolMap.set(r.schoolId, r.schoolName);
    }
  }
  const schools = [...schoolMap.entries()].map(([id, name]) => ({ id, name }));

  return {
    id: profile.id,
    email: profile.email,
    roles: profile.roles.map((r) => r.roleName),
    permissions: profile.permissions,
    schoolId: schools.length === 1 ? schools[0].id : null,
    schools,
  };
}
