/*
 * @Author: your name
 * @Date: 2026-03-02 16:30:59
 * @LastEditTime: 2026-04-03 12:10:07
 * @LastEditors: lynn
 * @Description: In User Settings Edit
 * @FilePath: \mata-edu-web\app\composables\api\student.ts
 */

/**
 * 学生相关 API
 */
import { useHttp } from "./useHttp";

type StudentIdLike = string | number;

export interface StudentConnectAnswer {
  sourceOptionId: StudentIdLike;
  targetOptionId: StudentIdLike;
}

export interface StudentBlankAnswer {
  index: number;
  text: string;
}

export type StudentTaskAnswer =
  | {
      questionId: StudentIdLike;
      connectAnswers: StudentConnectAnswer[];
    }
  | {
      questionId: StudentIdLike;
      blankAnswers: StudentBlankAnswer[];
    }
  | {
      questionId: StudentIdLike;
      optionId: StudentIdLike;
    }
  | {
      questionId: StudentIdLike;
      optionIds: StudentIdLike[];
    };

export interface SubmitStudentTaskPayload {
  taskId: StudentIdLike;
  answers: StudentTaskAnswer[];
}

export interface SubmitEvaluationPayload {
  evaluationId: StudentIdLike;
  answers: StudentTaskAnswer[];
}

export interface SubmitProgramTaskPayload {
  taskId: StudentIdLike;
  opusName?: string;
  coverOssId?: string;
  opusOssId?: string;
  videoOssId?: string;
  picOssIds?: string;
}

export const student = () => {
  const http = useHttp();

  //获取上课记录与任务
  const getStudentList = async () => {
    try {
      const response = await http.get("/system/student/lesson/record");
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学生上课记录失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //上课记录所有课程列表
  const getStudentCourseList = async () => {
    try {
      const response = await http.get("/system/student/lesson/course/list");
      if (response.code !== 200) {
        throw new Error(response.msg || "获取上课记录所有课程列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //上课记录所有章节
  const getStudentChapterList = async (courseId: string) => {
    try {
      const response = await http.get(
        "/system/student/lesson/course/chapter/list",
        { courseId },
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取上课记录所有章节失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //学生任务开始
  const startStudentTask = async (taskId: string) => {
    try {
      const response = await http.post(`/system/task/begin/${taskId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "学生任务开始失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //学生任务列表
  const getStudentTaskList = async (chapterId: string) => {
    try {
      const response = await http.get("/system/student/lesson/task/list", {
        chapterId,
      });
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学生任务列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //学生课程评测
  const getStudentCourseTest = async (courseId: string) => {
    try {
      const response = await http.get(
        "/system/student/lesson/course/evaluation/list",
        {
          courseId,
        },
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "学生课程评测列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //上课记录下发过任务的章节
  const getStudentTaskChapterList = async (courseId: string) => {
    try {
      const response = await http.get(
        "/system/student/lesson/task/chapter/list",
        { courseId },
      );

      if (response.code !== 200) {
        throw new Error(response.msg || "获取上课记录下发过任务的章节失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 标准化答案结构（兼容旧入参与新入参）
  const normalizeStudentTaskAnswers = (
    answers: StudentTaskAnswer[],
  ): StudentTaskAnswer[] => {
    return (answers || []).map((item) => {
      if ("connectAnswers" in item) {
        return {
          questionId: item.questionId,
          connectAnswers: (item.connectAnswers || []).map((pair) => ({
            sourceOptionId: pair.sourceOptionId,
            targetOptionId: pair.targetOptionId,
          })),
        };
      }

      if ("blankAnswers" in item) {
        return {
          questionId: item.questionId,
          blankAnswers: (item.blankAnswers || []).map((blank) => ({
            index: Number(blank.index),
            text: String(blank.text ?? "").trim(),
          })),
        };
      }

      if ("optionIds" in item) {
        return {
          questionId: item.questionId,
          optionIds: (item.optionIds || []).filter(
            (id) => id !== null && id !== undefined,
          ),
        };
      }

      return {
        questionId: item.questionId,
        optionId: item.optionId,
      };
    });
  };

  // 学生提交练习题（兼容两种调用方式）
  const submitStudentTask = async (
    taskIdOrPayload: StudentIdLike | SubmitStudentTaskPayload,
    answersArg?: StudentTaskAnswer[],
  ) => {
    const payload: SubmitStudentTaskPayload =
      typeof taskIdOrPayload === "object" &&
      taskIdOrPayload !== null &&
      "taskId" in taskIdOrPayload
        ? {
            taskId: taskIdOrPayload.taskId,
            answers: normalizeStudentTaskAnswers(taskIdOrPayload.answers || []),
          }
        : {
            taskId: taskIdOrPayload,
            answers: normalizeStudentTaskAnswers(answersArg || []),
          };

    try {
      const response = await http.post("/system/task/exercise/submit", payload);
      if (response.code !== 200) {
        throw new Error(response.msg || "学生提交练习题失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //学生提交测评
  const submitEvaluation = async (
    evaluationIdOrPayload: StudentIdLike | SubmitEvaluationPayload,
    answersArg?: StudentTaskAnswer[],
  ) => {
    const payload: SubmitEvaluationPayload =
      typeof evaluationIdOrPayload === "object" &&
      evaluationIdOrPayload !== null &&
      "evaluationId" in evaluationIdOrPayload
        ? {
            evaluationId: evaluationIdOrPayload.evaluationId,
            answers: normalizeStudentTaskAnswers(
              evaluationIdOrPayload.answers || [],
            ),
          }
        : {
            evaluationId: evaluationIdOrPayload,
            answers: normalizeStudentTaskAnswers(answersArg || []),
          };

    try {
      const response = await http.post("/system/evaluation/submit", payload);
      if (response.code !== 200) {
        throw new Error(response.msg || "学生提交测评失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //学生提交编程任务
  const studentSubmitTask = async (
    taskIdOrPayload: StudentIdLike | SubmitProgramTaskPayload,
    opusNameArg?: string,
    coverOssIdArg?: string,
    opusOssIdArg?: string,
    videoOssIdArg?: string,
    picOssIdsArg?: string,
  ) => {
    const payload: SubmitProgramTaskPayload =
      typeof taskIdOrPayload === "object" &&
      taskIdOrPayload !== null &&
      "taskId" in taskIdOrPayload
        ? {
            taskId: taskIdOrPayload.taskId,
            opusName: taskIdOrPayload.opusName,
            coverOssId: taskIdOrPayload.coverOssId,
            opusOssId: taskIdOrPayload.opusOssId,
            videoOssId: taskIdOrPayload.videoOssId,
            picOssIds: taskIdOrPayload.picOssIds,
          }
        : {
            taskId: taskIdOrPayload,
            opusName: opusNameArg,
            coverOssId: coverOssIdArg,
            opusOssId: opusOssIdArg,
            videoOssId: videoOssIdArg,
            picOssIds: picOssIdsArg,
          };
    try {
      const response = await http.post("/system/task/program/submit", payload);
      if (response.code !== 200) {
        throw new Error(response.msg || "学生提交编程任务失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查看编程任务详情
  const getStudentTaskChapterDetail = async (taskId: string) => {
    try {
      const response = await http.get(`/system/task/program/detail/${taskId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "查看编程任务详情失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //学生进入课堂（创建上课记录）
  const getLessonEnter = async (data: { peerId: string }) => {
    try {
      const response = await http.get("/system/student/lesson/enter", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学生进入课堂（创建上课记录）失败");
      }
      return response.rows;
    } catch (error: any) {
      throw error;
    }
  };

  return {
    getStudentList,
    getStudentCourseTest,
    getStudentCourseList,
    getStudentChapterList,
    startStudentTask,
    getStudentTaskList,
    submitStudentTask,
    getStudentTaskChapterList,
    submitEvaluation,
    studentSubmitTask,
    getStudentTaskChapterDetail,
    getLessonEnter,
  };
};
