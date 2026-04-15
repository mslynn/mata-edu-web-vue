/*
 * @Author: your name
 * @Date: 2026-04-03 17:23:41
 * @LastEditTime: 2026-04-08 19:16:10
 * @LastEditors: lynn
 * @Description: In User Settings Edit
 * @FilePath: \mata-edu-web\app\composables\api\study.ts
 */

/**
 *学情中心
 */
import { useHttp } from "./useHttp";

// 级联选择类型：
// grade 只返回年级
// class 返回年级 + 班级
// student 返回年级 + 班级 + 学生
export type SituationCascadeType = "grade" | "class" | "student";

// 通用时间筛选
export interface StudyDateRangeParams {
  startDate?: string;
  endDate?: string;
}

// 全校概览统计
export interface StudySchoolOverviewData {
  studentCount?: number;
  worksCount?: number;
  teachCount?: number;
  courseScore?: number | string | null;
  courseGrade?: string | null;
  taskCompletionRate?: number | null;
}

// 课程章节级联中的章节项
export interface StudyCourseChapterCascadeChapterItem {
  chapterId: string | number;
  chapterName?: string;
}

// 已授课课程与章节级联项
export interface StudyCourseChapterCascadeItem {
  courseId: string | number;
  courseName?: string;
  chapterList?: StudyCourseChapterCascadeChapterItem[];
}

// AI素养评价维度项
export interface StudyAILiteracyDimensionItem {
  quotaName?: string;
  score?: number;
  weight?: number;
}

// AI素养评价结果
export interface StudyAILiteracyData {
  finalScore?: number;
  grade?: string;
  dimensions?: StudyAILiteracyDimensionItem[];
}

// 各年级人数分布项
export interface StudyGradeDistributionItem {
  classId?: string | number;
  className?: string;
  gradeName?: string;
  grade?: string | number;
  name?: string;
  label?: string;
  studentCount?: number;
  count?: number;
  total?: number;
  value?: number;
}

// 全校作品数量分布项
export interface StudySchoolWorksCountItem {
  classId?: string | number;
  className?: string;
  gradeName?: string;
  grade?: string | number;
  platformName?: string;
  platformLabel?: string;
  platformType?: string | number;
  name?: string;
  label?: string;
  worksCount?: number;
  count?: number;
  total?: number;
  value?: number;
}

// 全校课堂出勤率项
export interface StudySchoolAttendanceItem {
  chapterName?: string;
  lessonName?: string;
  name?: string;
  label?: string;
  title?: string;
  attendanceRate?: number;
  rate?: number;
  value?: number;
  percent?: number;
}

// 全校教学统计
export interface StudySchoolTeachingStatsData {
  prepareCount?: number;
  teachCount?: number;
  teachDuration?: string;
  teachDurationMinutes?: number;
}

// 学生上课统计
export interface StudyStudentLessonStatsData {
  lessonCount?: number;
  lessonTimes?: number;
  totalLessonTimes?: number;
  attendCount?: number;
  attendanceCount?: number;
  completed?: number;
  finishedCount?: number;
  completedCount?: number;
  finishedLessonCount?: number;
  completedLessonCount?: number;
  totalLessons?: number;
  totalLessonCount?: number;
  lessonCount?: number;
  totalCount?: number;
  uncompleted?: number;
  pendingCount?: number;
  unfinishedCount?: number;
  pendingLessonCount?: number;
  uncompletedLessonCount?: number;
  completionRate?: number;
  progressRate?: number;
  attendanceRate?: number;
  courseAttendanceRate?: number;
  lessonAttendanceRate?: number;
  rate?: number;
  percent?: number;
  platformDuration?: string;
  platformUseDuration?: string;
  useDuration?: string;
  duration?: string;
  platformDurationMinutes?: number;
  platformUseDurationMinutes?: number;
  useDurationMinutes?: number;
  durationMinutes?: number;
  lessonDurationMinutes?: number;
}

// 任务完成情况中的任务项
export interface StudyTaskCompletionTaskItem {
  taskName?: string;
  completionRate?: number;
  gradingRate?: number;
  rate?: number;
  value?: number;
  percent?: number;
}

// 任务完成情况中的章节项
export interface StudyTaskCompletionChapterItem {
  chapterId?: string | number;
  chapterName?: string;
  name?: string;
  label?: string;
  title?: string;
  sortOrder?: number;
  tasks?: StudyTaskCompletionTaskItem[];
  taskList?: StudyTaskCompletionTaskItem[];
}

// 学生练习题正确率项
export interface StudyStudentExerciseAccuracyItem {
  courseId?: string | number;
  courseName?: string;
  totalQuestions?: number;
  correctCount?: number;
  accuracy?: number;
  questionId?: string | number;
  questionName?: string;
  exerciseName?: string;
  taskName?: string;
  name?: string;
  label?: string;
  title?: string;
  accuracyRate?: number;
  correctRate?: number;
  rate?: number;
  percent?: number;
  value?: number;
}

// 全校授课课程项
export interface StudySchoolCourseItem {
  courseId?: string | number;
  courseName?: string;
  name?: string;
  title?: string;
  courseTitle?: string;
  gradeId?: string | number;
  grade?: string | number;
  gradeName?: string;
  gradeLabel?: string;
  classId?: string | number;
  className?: string;
  termName?: string;
  semesterName?: string;
  teachTime?: string;
  time?: string;
  timeRange?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

// 年级筛选
export interface StudyGradeParams {
  grade: string;
}

// 课程筛选（必传）
export interface StudyCourseParams {
  courseId: string;
}

// 课程筛选（可选）
export interface StudyOptionalCourseParams {
  courseId?: string;
}

// 年级筛选（可选）
export interface StudyOptionalGradeParams {
  grade?: string;
}

// 班级筛选（必传）
export interface StudyClassParams {
  classId: string;
}

// 班级筛选（可选）
export interface StudyOptionalClassParams {
  classId?: string;
}

// 章节筛选（必传）
export interface StudyChapterParams {
  chapterId: string;
}

// 章节筛选（可选）
export interface StudyOptionalChapterParams {
  chapterId?: string;
}

// 学情级联接口入参
export interface StudySituationCascadeParams {
  type: SituationCascadeType;
}

// 已授课课程与章节级联：
// 一般支持按时间筛选，也可附带 classId / courseId 做联动过滤
export type StudyCourseChapterCascadeParams = StudyDateRangeParams &
  StudyOptionalClassParams &
  StudyOptionalCourseParams;

// 课程相关筛选：
// 适用于“时间区间 + 课程”这类接口
export type StudyCourseFilterParams = StudyDateRangeParams & StudyCourseParams;

// 课程相关筛选（可选）：
// 适用于“时间区间 + 可选课程”这类接口
export type StudyOptionalCourseFilterParams = StudyDateRangeParams &
  StudyOptionalCourseParams;

// 年级相关筛选（可选）：
// 适用于“时间区间 + 可选年级”这类接口
export type StudyOptionalGradeFilterParams = StudyDateRangeParams &
  StudyOptionalGradeParams;

// 年级相关筛选：
// 适用于“时间区间 + 年级”这类接口
export type StudyGradeFilterParams = StudyDateRangeParams & StudyGradeParams;

// 年级 + 课程组合筛选：
// 适用于“时间区间 + 年级 + 课程”这类接口
export type StudyGradeCourseFilterParams = StudyDateRangeParams &
  StudyGradeParams &
  StudyCourseParams;

// 年级 + 可选课程组合筛选：
// 适用于“时间区间 + 年级 + 可选课程”这类接口
export type StudyOptionalGradeCourseFilterParams = StudyDateRangeParams &
  StudyGradeParams &
  StudyOptionalCourseParams;

// 班级相关筛选：
// 适用于“时间区间 + 班级”这类接口
export type StudyClassFilterParams = StudyDateRangeParams & StudyClassParams;

// 班级相关筛选：
// 适用于“时间区间 + 班级+课程”这类接口
export type StudyCursorClassFilterParams = StudyDateRangeParams &
  StudyClassParams &
  StudyCourseParams;

// 班级相关筛选：
// 适用于“时间区间 + 班级 + 可选课程”这类接口
export type StudyOptionalCursorClassFilterParams = StudyDateRangeParams &
  StudyClassParams &
  StudyOptionalCourseParams;

// 学生相关筛选：
// 适用于“时间区间 + 学生”这类接口
export type StudyStudentFilterParams = StudyDateRangeParams & {
  studentId: string;
};
// 学生相关筛选：
// 适用于“时间区间 + 学生+课程”这类接口
export type StudyStudentCourseFilterParams = StudyDateRangeParams & {
  studentId: string;
  courseId: string;
};

export type StudyOptionalStudentCourseFilterParams = StudyDateRangeParams & {
  studentId: string;
  courseId?: string;
};

export const studyApi = () => {
  const http = useHttp();

  //【公共接口】获取年级/班级/学生级联数据
  // type：grade-返回年级；class-返回年级/班级；student-返回年级/班级/学生
  const getSituationCascade = async (data: StudySituationCascadeParams) => {
    try {
      const response = await http.get("/system/situation/cascade", data);
      if (response.code !== 200) {
        throw new Error(
          response.msg || "获取获取年级/班级/学生级联数据列表失败",
        );
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //公共接口】获取已授课的课程与章节级联数据
  const getCourseChapterCascade = async (
    data: StudyCourseChapterCascadeParams,
  ): Promise<StudyCourseChapterCascadeItem[]> => {
    try {
      const response = await http.get(   
        "/system/situation/course-chapter/cascade",
        data,
      );
      if (response.code !== 200) {
        throw new Error(
          response.msg || "获取已授课的课程与章节级联数据列表失败",
        );
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【全校数据】概览统计
  const getSchoolOverview = async (
    data: StudyDateRangeParams,
  ): Promise<StudySchoolOverviewData> => {
    try {
      const response = await http.get(
        "/system/situation/school/overview",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取全校数据概览失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【全校数据】学校AI素养评价
  const getSchoolAILiteracy = async (
    data: StudyOptionalCourseFilterParams,
  ): Promise<StudyAILiteracyData> => {
    try {
      const response = await http.get(
        "/system/situation/school/ai-literacy",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学校AI素养评价失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【全校数据】各年级人数分布
  const getSchoolGradeDistribution = async (): Promise<
    StudyGradeDistributionItem[]
  > => {
    try {
      const response = await http.get(
        "/system/situation/school/grade-distribution",
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取各年级人数分布失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【全校数据】教学统计

  const getSchoolTeachingStats = async (
    data: StudyDateRangeParams,
  ): Promise<StudySchoolTeachingStatsData | Record<string, any>> => {
    try {
      const response = await http.get(
        "/system/situation/school/teaching-stats",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学校教学统计失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  // 【全校数据】授课课程
  const getSchoolCourses = async (
    data: StudyDateRangeParams & StudyOptionalGradeParams & StudyOptionalCourseParams,
  ): Promise<StudySchoolCourseItem[] | Record<string, any>> => {
    try {
      const response = await http.get("/system/situation/school/courses", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学校授课课程失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【全校数据】课堂出勤率
  const getSchoolAttendance = async (
    data: StudyDateRangeParams & {
    
      courseId?: string;
    },
  ): Promise<StudySchoolAttendanceItem[] | Record<string, any>> => {
    try {
      const response = await http.get(
        "/system/situation/school/attendance",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学校课堂出勤率失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【全校数据】任务完成情况
  const getSchoolTaskCompletion = async (
    data: StudyOptionalCourseFilterParams,
  ): Promise<StudyTaskCompletionChapterItem[] | Record<string, any>> => {
    try {
      const response = await http.get(
        "/system/situation/school/task-completion",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学校任务完成情况失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【全校数据】任务批改情况
  const getSchoolTaskGrading = async (
    data: StudyOptionalCourseFilterParams,
  ): Promise<StudyTaskCompletionChapterItem[] | Record<string, any>> => {
    try {
      const response = await http.get(
        "/system/situation/school/task-grading",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学校任务批改情况失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【全校数据】学生创建作品数量
  const getSchoolWorksCount = async (
    data: StudyDateRangeParams,
  ): Promise<StudySchoolWorksCountItem[] | Record<string, any>> => {
    try {
      const response = await http.get(
        "/system/situation/school/works-count",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学校学生创建作品数量失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //  ***年级数据 ***

  //【年级数据】概览统计
  const getGradeOverview = async (
    data: StudyGradeFilterParams,
  ): Promise<StudySchoolOverviewData> => {
    try {
      const response = await http.get("/system/situation/grade/overview", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取年级数据失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //【年级数据】年级AI素养评价
  const getGradeAILiteracy = async (
    data: StudyOptionalGradeCourseFilterParams,
  ): Promise<StudyAILiteracyData> => {
    try {
      const response = await http.get(
        "/system/situation/grade/ai-literacy",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取年级AI素养评价失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【年级数据】各班级人数分布
  const getGradeClassDistribution = async (
    data: StudyGradeParams,
  ): Promise<StudyGradeDistributionItem[]> => {
    try {
      const response = await http.get(
        "/system/situation/grade/class-distribution",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取年级班级人数分布失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //【年级数据】教学统计
  const getGradeTeachingStats = async (
    data: StudyGradeFilterParams,
  ): Promise<StudySchoolTeachingStatsData> => {
    try {
      const response = await http.get(
        "/system/situation/grade/teaching-stats",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取年级教学统计失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【年级数据】授课课程
  const getGradeCourses = async (
    data: StudyOptionalGradeCourseFilterParams,
  ): Promise<StudySchoolCourseItem[] | Record<string, any>> => {
    try {
      const response = await http.get("/system/situation/grade/courses", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取年级授课课程失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【年级数据】课堂出勤率
  const getGradeAttendance = async (
    data: StudyOptionalGradeCourseFilterParams,
  ): Promise<StudySchoolAttendanceItem[] | Record<string, any>> => {
    try {
      const response = await http.get(
        "/system/situation/grade/attendance",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取年级课堂出勤率失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【年级数据】任务完成情况
  const getGradeTaskCompletion = async (
    data: StudyOptionalGradeCourseFilterParams,
  ): Promise<StudyTaskCompletionChapterItem[] | Record<string, any>> => {
    try {
      const response = await http.get(
        "/system/situation/grade/task-completion",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取年级任务完成情况失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【年级数据】任务批改情况
  const getGradeTaskGrading = async (
    data: StudyOptionalGradeCourseFilterParams,
  ): Promise<StudyTaskCompletionChapterItem[] | Record<string, any>> => {
    try {
      const response = await http.get(
        "/system/situation/grade/task-grading",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取年级任务批改情况失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【年级数据】学生创建作品数量
  const getGradeTaskCount = async (
    data: StudyGradeFilterParams,
  ): Promise<StudySchoolWorksCountItem[] | Record<string, any>> => {
    try {
      const response = await http.get(
        "/system/situation/grade/works-count",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取年级学生创建作品数量失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //  ***班级数据***

  //   【班级数据】概览统计
  const getClassOverview = async (data: StudyClassFilterParams) => {
    try {
      const response = await http.get("/system/situation/class/overview", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取班级概览统计失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【班级数据】班级AI素养评价
  const getClassAILiteracy = async (data: StudyOptionalCursorClassFilterParams) => {
    try {
      const response = await http.get("/system/situation/class/ai-literacy", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取班级AI素养评价失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【班级数据】授课进度

  const getClassTeachingProgress = async (
    data: StudyCursorClassFilterParams,
  ) => {
    try {
      const response = await http.get("/system/situation/class/teaching-progress", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取班级授课进度失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【班级数据】授课课程列表
  const getClassCourses = async (data: StudyClassFilterParams) => {
    try {
      const response = await http.get("/system/situation/class/courses", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取班级授课课程列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【班级数据】课程出勤率
  const getClassAttendance = async (data: StudyOptionalCursorClassFilterParams) => {
    try {
      const response = await http.get("/system/situation/class/attendance", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取班级课程出勤率失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【班级数据】任务完成情况
  const getClassTaskCompletion = async (data: StudyOptionalCursorClassFilterParams) => {
    try {
      const response = await http.get("/system/situation/class/task-completion", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取班级任务完成情况失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【班级数据】学生创建作品数量
  const getClassWorksCount = async (data: StudyClassFilterParams) => {
    try {
      const response = await http.get("/system/situation/class/works-count", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取班级学生创建作品数量失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // ***学生数据***

  //【学生数据】概览统计
  const getStudentOverview = async (data: StudyStudentFilterParams) => {
    try {
      const response = await http.get("/system/situation/student/overview", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学生概览统计失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //【学生数据】AI素养评价
  const getStudentAILiteracy = async (
    data: StudyOptionalStudentCourseFilterParams,
  ): Promise<StudyAILiteracyData> => {
    try {
      const response = await http.get("/system/situation/student/ai-literacy", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学生AI素养评价失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【学生数据】上课课程列表
  const getStudentCourses = async (
    data: StudyStudentFilterParams,
  ): Promise<StudyCourseChapterCascadeItem[] | Record<string, any>> => {
    try {
      const response = await http.get("/system/situation/student/courses", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学生上课课程列表失败");
      }
      const rows = Array.isArray(response.rows) ? response.rows : undefined;
      const responseData = response.data;
      const dataList = Array.isArray(responseData) ? responseData : undefined;

      if (dataList && dataList.length > 0) {
        return dataList;
      }

      if (rows && rows.length > 0) {
        return rows;
      }

      return responseData ?? rows ?? [];
    } catch (error: any) {
      throw error;
    }
  };

  //【学生数据】上课统计

  const getStudentLessonStats = async (data: StudyStudentFilterParams) => {
    try {
      const response = await http.get("/system/situation/student/lesson-stats", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学生上课统计失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【学生数据】任务完成情况
  const getStudentLessonCompletion = async (
    data: StudyOptionalStudentCourseFilterParams,
  ): Promise<StudyTaskCompletionChapterItem[] | Record<string, any>> => {
    try {
      const response = await http.get(
        "/system/situation/student/task-completion",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取任务完成情况情况失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【学生数据】各练习题正确率
  const getStudentExerciseAccuracy = async (
    data: StudyOptionalStudentCourseFilterParams,
  ): Promise<StudyStudentExerciseAccuracyItem[] | Record<string, any>> => {
    try {
      const response = await http.get(
        "/system/situation/student/exercise-accuracy",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取各练习题正确率情况失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //【学生数据】各应用创建数量
  const getStudentWorksCount = async (
    data: StudyStudentFilterParams,
  ): Promise<StudySchoolWorksCountItem[] | Record<string, any>> => {
    try {
      const response = await http.get(
        "/system/situation/student/works-count",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取各应用创建数量情况失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  return {
    getSituationCascade,
    getCourseChapterCascade,
    getSchoolOverview,
    getSchoolAILiteracy,
    getSchoolGradeDistribution,
    getSchoolTeachingStats,
    getSchoolCourses,
    getSchoolAttendance,
    getSchoolTaskCompletion,
    getSchoolTaskGrading,
    getSchoolWorksCount,
    getGradeOverview,
    getGradeAILiteracy,
    getGradeClassDistribution,
    getGradeTeachingStats,
    getGradeCourses,
    getGradeAttendance,
    getGradeTaskCompletion,
    getGradeTaskGrading,
    getGradeTaskCount,
    getClassOverview,
    getClassAILiteracy,
    getClassTeachingProgress,
    getClassCourses,
    getClassAttendance,
    getClassTaskCompletion,
    getClassWorksCount,
    getStudentOverview,
    getStudentAILiteracy,
    getStudentCourses,
    getStudentLessonStats,
    getStudentLessonCompletion,
    getStudentExerciseAccuracy,
    getStudentWorksCount,
  };
};

export const aiAdmin = studyApi;
