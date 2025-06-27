export interface Holiday {
  date: string;
  name: string;
}

interface Course {
  courseId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}
export interface SemesterPeriod {
  semesterStart: string;
  semesterEnd: string;
  lectureStart: string;
  lectureEnd: string;
  holidays: Holiday[];
  courses: Course[];
}

export const semesterPeriods: Record<string, SemesterPeriod> = {
  SS25: {
    semesterStart: '2025-04-01',
    semesterEnd: '2025-09-30',
    lectureStart: '2025-04-23',
    lectureEnd: '2025-07-25',
    holidays: [
      { date: '2025-04-18', name: 'Good Friday' },
      { date: '2025-04-21', name: 'Easter Monday' },
      { date: '2025-05-01', name: 'Labour Day' },
      { date: '2025-05-29', name: 'Ascension Day' },
      { date: '2025-06-09', name: 'Whit Monday' },
      { date: '2025-06-10', name: 'No lecture' },
      { date: '2025-06-19', name: 'Feast of Corpus Christi' },
      { date: '2025-06-20', name: 'No Lecture' },
    ],
    courses: [
      { courseId: 'krmt', dayOfWeek: 2, startTime: '12:15', endTime: '13:45' },
      { courseId: 'smai', dayOfWeek: 2, startTime: '10:15', endTime: '11:50' },
      { courseId: 'ai-2', dayOfWeek: 2, startTime: '16:15', endTime: '17:50' },
      { courseId: 'ai-2', dayOfWeek: 3, startTime: '16:15', endTime: '17:50' },
      { courseId: 'iwgs-2', dayOfWeek: 4, startTime: '16:15', endTime: '17:50' },
    ],
  },
  'WS25-26': {
    semesterStart: '2025-10-01',
    semesterEnd: '2026-03-31',
    lectureStart: '2025-10-13',
    lectureEnd: '2026-02-06',
    holidays: [
      { date: '2025-10-03', name: 'Day of German Unity' },
      { date: '2025-11-01', name: 'All Saints Day' },
    ],
    courses: [],
  },
};
