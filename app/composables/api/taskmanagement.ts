/**
 *  自定义习题
 */
import { useHttp } from "./useHttp";

// 选项类型
interface QuestionOption {
  tempId: string;
  optionLabel: string;
  optionText: string;
  sequence: number;
  groupType?: "source" | "target"; // 连线题用
}

// 答案类型
interface QuestionAnswer {
  optionTempId?: string; // 单选/多选/判断题用
  matchOptionTempId?: string; // 连线题用
  blankIndex?: number; // 填空题用
  blankText?: string; // 填空题用
}

// 题目类型
interface Question {
  questionType: "connect" | "single" | "judge" | "multiple" | "blank";
  questionName: string;
  analysis?: string;
  score?: number;
  options: QuestionOption[];
  answers: QuestionAnswer[];
}

export const taskmanagementcenterApi = () => {
  const http = useHttp();

  //新增自定义练习题
  const addExercise = async (data: {
    exerciseName: string;
    exerciseDesc?: string;
    questionCount: string;
    totalScore: String;
    questions: [Question, ...Question[]]; // 至少一道题目
  }) => {
    try {
      const response = await http.post("/system/exercise", data, {
        isEncrypt: "false",
      });
      if (response.code !== 200) {
        throw new Error(response.msg || "新增自定义练习题失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询自定义练习题列表
  const getexerciseList = async (
    pageSize: number,
    pageNum: Number,
    exerciseName?: String,
  ) => {
    try {
      const response = await http.get("/system/exercise/list", {
        pageSize,
        pageNum,
        exerciseName,
      });
      if (response.code !== 200) {
        throw new Error(response.msg || "查询自定义练习题列表失败");
      }
      // 返回整个 response，因为 rows 和 total 在顶层
      return {
        rows: response.rows || [],
        total: response.total || 0,
      };
    } catch (error: any) {
      throw error;
    }
  };
  //复制练习题
  const copyExercise = async (exerciseId: string) => {
    try {
      const response = await http.get(`/system/exercise/copy/${exerciseId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "复制练习题失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //删除自定义练习题
  const delExercise = async (exerciseId: string) => {
    try {
      const response = await http.del(`/system/exercise/${exerciseId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "删除自定义练习题失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //获取练习题详情（包含题目）
  const getDetailExercise = async (exerciseId: string) => {
    try {
      const response = await http.get(`/system/exercise/${exerciseId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取练习题详情（包含题目）失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //修改自定义练习题
  const updateExercise = async (data: {
    exerciseId: string;
    exerciseName: string;
    exerciseDesc?: string;
    questionCount: string;
    totalScore: String;
    questions: [Question, ...Question[]];
  }) => {
    try {
      const response = await http.put("/system/exercise", data, {
        isEncrypt: "false",
      });
      if (response.code !== 200) {
        throw new Error(response.msg || "修改自定义练习题失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  // 上传OSS对象存储
  const uploadOSS = async (file: File) => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${config.public.apiBaseUrl}/resource/oss/upload`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: formData,
        },
      );

      const response = await res.json();
      if (response.code !== 200) {
        throw new Error(response.msg || "上传OSS对象存储失败");
      }
      return response.data; // 返回 { url, fileName, ossId }
    } catch (error: any) {
      throw error;
    }
  };

  // 官方课程菜单树
  const getExerciseCourseMenuTree = async (data?: { fix?: "no" }) => {
    try {
      const response = await http.get("/system/course/menu/tree", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取官方课程菜单树失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //自定义课程列表
  const getCursorList = async (data?: {
    courseType?: number;
    menuId?: number;
  }) => {
    try {
      const response = await http.get("/system/course/list", data || {});
      return response.data;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  };
  //查询课程章节列表
  const getChapterList = async (data?: { courseId: number }) => {
    try {
      const response = await http.get(
        "/system/course/chapter/list",
        data || {},
      );
      return response.data;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  };

  // 关联/取消关联课程章节
  const bindExerciseChapter = async (data: {
    exerciseId: string;
    type: number; // 1-关联 2-取消关联
    chapterIds: string[];
  }) => {
    try {
      const response = await http.post("/system/exercise/bind", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "关联/取消关联课程章节失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询关联的课程章节
  const getExercisebind = async (exerciseId: string) => {
    try {
      const response = await http.get(`/system/exercise/bind/${exerciseId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "查询关联的课程章节");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询授课记录列表（包含授课章节数据）
  const getChapter = async () => {
    try {
      const response = await http.get("/system/teach/course/chapter/list");
      if (response.code !== 200) {
        throw new Error(
          response.msg || "查询授课记录列表（包含授课章节数据）失败",
        );
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //查询任务列表
  const getTaskList = async (data?: {
    chapterId: string;
    classId?: string;
  }) => {
    try {
      const response = await http.get("/system/teach/task/list", data || {});
      if (response.code !== 200) {
        throw new Error(response.msg || "查询任务列表失败");
      }
      return response.data;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  };
  //任务下发 (小组&&学生)
  const bindDistributer = async (data: {
    classId: string;
    resourceId: string;
    taskName?: string;
    distributeType?: number; //分发类型 1:学生端 2:小组端
  }) => {
    try {
      const response = await http.post("/system/task/distribute", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "任务下发 (小组&&学生)失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //自由编程任务下发
  const bindFreeDistribute = async (data: {
    classId: string;
    resourceId: string;
    taskName?: string;
    fileType?: "vinci" | "nous"; // 文件类型：vinci / nous
    distributeType?: number; //分发类型 1:学生端 2:小组端
  }) => {
    try {
      const response = await http.post("/system/task/free/distribute", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "自由编程任务下发失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询学生任务列表
  const getStudentTaskList = async (data: {
    resourceId: string;
    classId: string;
  }) => {
    try {
      const response = await http.get("/system/task/list", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "查询学生任务列表失败");
      }
      return response.data;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  };
  //查看任务文件详情（练习题）
  const getExerciseDetail = async (exerciseId: string) => {
    try {
      const response = await http.get(
        `/system/task/exercise/detail/${exerciseId}`,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "查看任务文件详情（练习题）失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //任务撤回
  const bindWithdrawr = async (data: {
    classId: string;
    resourceId: string;
    distributeType?: number; //分发类型 1:学生端 2:小组端
  }) => {
    try {
      const response = await http.post("/system/task/withdraw", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "任务撤回失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查看（练习题包含答题记录）
  const getTaskIdDetail = async (taskId: string) => {
    try {
      const response = await http.get(`/system/task/exercise/${taskId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "查看任务文件详情（练习题）失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //打回重做
  const bindReject = async (taskIds: string[]) => {
    try {
      const response = await http.post("/system/task/exercise/reject", taskIds);
      if (response.code !== 200) {
        throw new Error(response.msg || "打回重做失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //查询测评列表
  const getEvaluationList = async (data?: {
    courseId: string;
    classId?: string;
  }) => {
    try {
      const response = await http.get(
        "/system/teach/evaluation/list",
        data || {},
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "查询测评列表失败");
      }
      return response.data;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  };

  //查询学生测评列表
  const getStudentEvaluationList = async (data: {
    courseId: string;
    classId: string;
    exerciseId: string;
  }) => {
    try {
      const response = await http.get("/system/evaluation/page", data || {});
      if (response.code !== 200) {
        throw new Error(response.msg || "查询学生测评列表失败");
      }
      return response.rows;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  };
  //测评打回重做
  const bindEvaluationReject = async (evaluationId: string[]) => {
    try {
      const response = await http.post(
        "/system/evaluation/reject",
        evaluationId,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "测评打回重做失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //重新下发测评
  const bindEvaluation = async (data: {
    courseId: string;
    classId: string;
    exerciseId: string;
    examDate?: string;
    examTime?: string;
    examDuration?: number;
    evaluationId: string[];
  }) => {
    try {
      const response = await http.post("/system/evaluation/redo", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "重新下发测评失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查看试卷详情
  const getEvaluationDetail = async (exerciseId: string) => {
    try {
      const response = await http.get(
        `/system/evaluation/exercise/${exerciseId}`,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "查看试卷详情失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查看（测评包含答题记录)

  const getEvaluationWithAnswers = async (exerciseId: string) => {
    try {
      const response = await http.get(`/system/evaluation/${exerciseId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "查看（测评包含答题记录)失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //获取指标树形结构
  const getQuotaMenuTree = async () => {
    try {
      const response = await http.get("/system/quota/tree");
      if (response.code !== 200) {
        throw new Error(response.msg || "获取指标树形结构树失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //获取练习题题目
  const getExerciseQuestions = async (exerciseId: string) => {
    try {
      const response = await http.get(
        `/system/exercise/${exerciseId}/questions`,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取练习题题目列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询练习题素养评价配置
  const getExerciseEvalConfig = async (exerciseId: string) => {
    try {
      const response = await http.get(
        `/system/exercise/${exerciseId}/eval-config`,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "查询练习题素养评价配置列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //保存练习题素养评价配置
  const saveExercise = async (data: {
    objectType?: string | number;
    configList: Array<{
      objectId?: string | number;
      questionId?: string | number;
      quotaIds: Array<string | number>;
    }>;
  }) => {
    const payload = {
      objectType: data.objectType ?? 1,
      configList: (data.configList || [])
        .map((item) => ({
          objectId: item.objectId ?? item.questionId ?? "",
          quotaIds: item.quotaIds || [],
        }))
        .filter(
          (item) => String(item.objectId).trim() && item.quotaIds.length > 0,
        ),
    };

    try {
      const response = await http.post("/system/exercise/eval-config", payload);
      if (response.code !== 200) {
        throw new Error(response.msg || "保存练习题素养评价配置失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //获取待批改任务数据
  const getCorrectTaskList = async () => {
    try {
      const response = await http.get("/system/task/correct/list");
      if (response.code !== 200) {
        throw new Error(response.msg || "获取待批改任务数据失败");
      }
      return response.data;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  };
  //查看编程任务详情
  const getProgrammingTaskDetail = async (taskId: string) => {
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

  //评分编程任务
  const bindFreeScore = async (data: {
    taskId: string;
    score: number;
    comment: string;
  }) => {
    try {
      const response = await http.post("/system/task/program/score", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "评分编程任务失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  return {
    addExercise,
    getexerciseList,
    copyExercise,
    delExercise,
    getDetailExercise,
    updateExercise,
    uploadOSS,
    getExerciseCourseMenuTree,
    getCursorList,
    getChapterList,
    bindExerciseChapter,
    getExercisebind,
    getChapter,
    getTaskList,
    bindDistributer,
    getStudentTaskList,
    getExerciseDetail,
    bindWithdrawr,
    getTaskIdDetail,
    bindReject,
    getEvaluationList,
    getStudentEvaluationList,
    bindEvaluationReject,
    bindEvaluation,
    getEvaluationDetail,
    getEvaluationWithAnswers,
    getExerciseQuestions,
    getQuotaMenuTree,
    saveExercise,
    getExerciseEvalConfig,
    bindFreeDistribute,
    getCorrectTaskList,
    getProgrammingTaskDetail,
    bindFreeScore,
  };
};
