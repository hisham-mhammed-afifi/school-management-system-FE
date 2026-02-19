export interface PeriodSet {
  id: string;
  schoolId: string;
  academicYearId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingDay {
  id: string;
  schoolId: string;
  periodSetId: string;
  dayOfWeek: number;
  isActive: boolean;
}

export interface Period {
  id: string;
  schoolId: string;
  periodSetId: string;
  name: string;
  startTime: string;
  endTime: string;
  orderIndex: number;
  isBreak: boolean;
}

export interface TimeSlot {
  id: string;
  schoolId: string;
  dayOfWeek: number;
  periodId: string;
  period?: Period;
}

export interface TimetableLesson {
  lessonId: string;
  subject: string;
  teacher: string;
  room: string;
}

/** Grid keyed by dayOfWeek (string "0"-"6"), then by periodId */
export type TimetableGrid = Record<string, Record<string, TimetableLesson | null> | null>;

export interface ClassTimetableResponse {
  termId: string;
  classSectionId: string;
  classSectionName: string;
  grid: TimetableGrid;
}

export interface TeacherTimetableResponse {
  termId: string;
  teacherId: string;
  teacherName: string;
  grid: TimetableGrid;
}

export interface RoomTimetableResponse {
  termId: string;
  roomId: string;
  roomName: string;
  grid: TimetableGrid;
}

export type TimetableViewType = 'class' | 'teacher' | 'room';

export interface ListPeriodSetsQuery {
  page?: number;
  limit?: number;
  academicYearId?: string;
}
