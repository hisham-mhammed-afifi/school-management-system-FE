import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import type { PaginatedResponse } from '@core/models/api';
import type { School } from '@core/models/school';
import { AuthService } from '@core/services/auth.service';

const STORAGE_KEY = 'selected_school_id';

@Injectable({ providedIn: 'root' })
export class SchoolService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly _schools = signal<School[]>([]);
  private readonly _selectedSchoolId = signal<string | null>(this.loadSelectedSchoolId());
  private readonly _loading = signal(false);

  readonly schools = this._schools.asReadonly();
  readonly selectedSchoolId = this._selectedSchoolId.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly isSuperAdmin = computed(() => {
    const user = this.authService.user();
    return user !== null && user.schoolId === null;
  });

  readonly currentSchoolId = computed(() => {
    const user = this.authService.user();
    // User not yet loaded — fall back to stored selection so early requests still get the header
    if (!user) return this._selectedSchoolId();
    // Non-super-admin: use JWT schoolId
    if (user.schoolId) return user.schoolId;
    // Super admin: use manually selected school
    return this._selectedSchoolId();
  });

  readonly selectedSchool = computed(() => {
    const id = this._selectedSchoolId();
    return this._schools().find((s) => s.id === id) ?? null;
  });

  fetchSchools(): Observable<PaginatedResponse<School>> {
    this._loading.set(true);
    return this.http
      .get<PaginatedResponse<School>>('/api/v1/platform/schools', {
        params: { limit: '100' },
      })
      .pipe(
        tap({
          next: (res) => {
            this._schools.set(res.data);
            this._loading.set(false);
          },
          error: () => this._loading.set(false),
        }),
      );
  }

  selectSchool(schoolId: string): void {
    this._selectedSchoolId.set(schoolId);
    localStorage.setItem(STORAGE_KEY, schoolId);
  }

  clearSelection(): void {
    this._selectedSchoolId.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private loadSelectedSchoolId(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }
}
