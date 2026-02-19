import { Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { StudentAttendanceComponent } from './student-attendance/student-attendance';
import { TeacherAttendanceComponent } from './teacher-attendance/teacher-attendance';

type AttendanceTab = 'students' | 'teachers';

@Component({
  selector: 'app-attendance',
  imports: [TranslatePipe, StudentAttendanceComponent, TeacherAttendanceComponent],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class AttendanceComponent {
  readonly activeTab = signal<AttendanceTab>('students');

  switchTab(tab: AttendanceTab): void {
    this.activeTab.set(tab);
  }
}
