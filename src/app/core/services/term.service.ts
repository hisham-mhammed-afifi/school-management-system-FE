import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse } from '@core/models/api';
import type { Term } from '@core/models/term';

@Injectable({ providedIn: 'root' })
export class TermService {
  private readonly http = inject(HttpClient);

  listByYear(academicYearId: string): Observable<ApiResponse<Term[]>> {
    return this.http.get<ApiResponse<Term[]>>(`/api/v1/academic-years/${academicYearId}/terms`);
  }
}
