import { Component, computed, inject, signal, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { GradingScaleService } from '@core/services/grading-scale.service';
import { SchoolService } from '@core/services/school.service';
import type { GradingScale } from '@core/models/grading-scale';
import type { ApiErrorResponse } from '@core/models/api';

interface LevelFormControls {
  letter: FormControl<string>;
  minScore: FormControl<number>;
  maxScore: FormControl<number>;
  gpaPoints: FormControl<number | null>;
}

@Component({
  selector: 'app-grading-scale-form',
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink, IconComponent],
  templateUrl: './grading-scale-form.html',
  styleUrl: './grading-scale-form.css',
})
export class GradingScaleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly gradingScaleService = inject(GradingScaleService);
  private readonly schoolService = inject(SchoolService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly listRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/grading-scales`,
  );
  readonly isEdit = signal(false);
  readonly scaleId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    levels: this.fb.array<FormGroup<LevelFormControls>>([]),
  });

  get levels(): FormArray<FormGroup<LevelFormControls>> {
    return this.form.controls.levels;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.scaleId.set(id);
      this.loadScale(id);
    } else {
      this.addLevel();
    }
  }

  addLevel(): void {
    this.levels.push(this.createLevelGroup());
  }

  removeLevel(index: number): void {
    this.levels.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const formVal = this.form.getRawValue();
    const payload = {
      name: formVal.name,
      levels: formVal.levels.map((l, i) => ({
        letter: l.letter,
        minScore: +l.minScore,
        maxScore: +l.maxScore,
        gpaPoints: l.gpaPoints != null ? +l.gpaPoints : undefined,
        orderIndex: i + 1,
      })),
    };

    if (this.isEdit()) {
      this.gradingScaleService.update(this.scaleId()!, payload).subscribe({
        next: () =>
          this.router.navigate([
            '/schools',
            this.schoolService.currentSchoolId(),
            'grading-scales',
            this.scaleId(),
          ]),
        error: (err) => this.handleError(err),
      });
    } else {
      this.gradingScaleService.create(payload).subscribe({
        next: (res) =>
          this.router.navigate([
            '/schools',
            this.schoolService.currentSchoolId(),
            'grading-scales',
            res.data.id,
          ]),
        error: (err) => this.handleError(err),
      });
    }
  }

  private createLevelGroup(): FormGroup<LevelFormControls> {
    return this.fb.nonNullable.group({
      letter: ['', [Validators.required, Validators.maxLength(5)]],
      minScore: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      maxScore: [100, [Validators.required, Validators.min(0), Validators.max(100)]],
      gpaPoints: [null as number | null],
    });
  }

  private loadScale(id: string): void {
    this.loading.set(true);
    this.gradingScaleService.get(id).subscribe({
      next: (res) => {
        this.patchForm(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('GRADING_SCALES.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }

  private patchForm(scale: GradingScale): void {
    this.form.patchValue({ name: scale.name });
    this.levels.clear();
    for (const level of scale.levels) {
      const group = this.createLevelGroup();
      group.patchValue({
        letter: level.letter,
        minScore: level.minScore,
        maxScore: level.maxScore,
        gpaPoints: level.gpaPoints,
      });
      this.levels.push(group);
    }
  }

  private handleError(err: { error?: ApiErrorResponse }): void {
    this.saving.set(false);
    const body = err.error;
    this.errorMessage.set(body?.error?.message ?? 'COMMON.ERROR');
  }
}
