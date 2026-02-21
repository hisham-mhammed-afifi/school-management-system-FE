import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, tap, filter, map, startWith } from 'rxjs';

import type { PaginatedResponse } from '@core/models/api';
import type { School } from '@core/models/school';
import { AuthService } from '@core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class SchoolService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly _platformSchools = signal<School[]>([]);
  private readonly _loading = signal(false);

  readonly loading = this._loading.asReadonly();

  /** School ID extracted from the current route URL (/schools/:schoolId/...) */
  readonly currentSchoolId = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        const match = this.router.url.match(/^\/schools\/([^/]+)/);
        return match ? match[1] : null;
      }),
    ),
    { initialValue: null as string | null },
  );

  readonly isSuperAdmin = computed(() => {
    const user = this.authService.user();
    if (!user) return false;
    return user.roles.includes('super_admin');
  });

  readonly hasMultipleSchools = computed(() => this.schools().length > 1);

  /** Available schools: user's assigned schools, or all platform schools for super admins */
  readonly schools = computed<School[]>(() => {
    const user = this.authService.user();
    if (!user) return [];
    if (this.isSuperAdmin()) return this._platformSchools();
    return user.schools;
  });

  readonly selectedSchool = computed(() => {
    const id = this.currentSchoolId();
    if (!id) return null;
    return this.schools().find((s) => s.id === id) ?? null;
  });

  constructor() {
    effect(() => {
      if (this.isSuperAdmin() && this.currentSchoolId() && this._platformSchools().length === 0) {
        this.fetchSchools().subscribe();
      }
    });
  }

  /** Fetch all platform schools (super admins only) */
  fetchSchools(): Observable<PaginatedResponse<School>> {
    this._loading.set(true);
    return this.http
      .get<PaginatedResponse<School>>('/api/v1/platform/schools', {
        params: { limit: '100' },
      })
      .pipe(
        tap({
          next: (res) => {
            this._platformSchools.set(res.data);
            this._loading.set(false);
          },
          error: () => this._loading.set(false),
        }),
      );
  }
}
