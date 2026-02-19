import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  Exam,
  ExamSubject,
  CreateExamRequest,
  UpdateExamRequest,
  ListExamsQuery,
  CreateExamSubjectRequest,
  UpdateExamSubjectRequest,
} from '@core/models/exam';

@Injectable({ providedIn: 'root' })
export class ExamService {
  private readonly http = inject(HttpClient);

  list(query: ListExamsQuery = {}): Observable<PaginatedResponse<Exam>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.termId) params = params.set('termId', query.termId);
    if (query.examType) params = params.set('examType', query.examType);

    return this.http.get<PaginatedResponse<Exam>>('/api/v1/exams', { params });
  }

  get(id: string): Observable<ApiResponse<Exam>> {
    return this.http.get<ApiResponse<Exam>>(`/api/v1/exams/${id}`);
  }

  create(data: CreateExamRequest): Observable<ApiResponse<Exam>> {
    return this.http.post<ApiResponse<Exam>>('/api/v1/exams', data);
  }

  update(id: string, data: UpdateExamRequest): Observable<ApiResponse<Exam>> {
    return this.http.patch<ApiResponse<Exam>>(`/api/v1/exams/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/exams/${id}`);
  }

  listSubjects(examId: string): Observable<ApiResponse<ExamSubject[]>> {
    return this.http.get<ApiResponse<ExamSubject[]>>(`/api/v1/exams/${examId}/subjects`);
  }

  addSubject(examId: string, data: CreateExamSubjectRequest): Observable<ApiResponse<ExamSubject>> {
    return this.http.post<ApiResponse<ExamSubject>>(`/api/v1/exams/${examId}/subjects`, data);
  }

  updateSubject(
    examId: string,
    subjectId: string,
    data: UpdateExamSubjectRequest,
  ): Observable<ApiResponse<ExamSubject>> {
    return this.http.patch<ApiResponse<ExamSubject>>(
      `/api/v1/exams/${examId}/subjects/${subjectId}`,
      data,
    );
  }

  removeSubject(examId: string, subjectId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/exams/${examId}/subjects/${subjectId}`);
  }
}
