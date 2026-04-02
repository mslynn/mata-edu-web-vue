/**
 * 课程中心接
 */
import { useHttp } from "./useHttp";

export interface cursor {
  courseId: string;
  courseName: string;
  courseDescription: string;
  courseCover: string;
  courseStatus: string;
  courseType: string;
  courseCategory: string;
  courseSubCategory: string;
  coursePrice: number;
  courseOriginalPrice: number;
  courseDiscount: number;
  courseDiscountPrice: number;
}

export const cursorAdmin = () => {
  const http = useHttp();

  //获取课程菜单树形结构列表
  const getCursorTreeMenu = async () => {
    try {
      const response = await http.get(`/system/course/menu/tree`);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取课程中心树菜单失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //获取课程列表
  const getCursorList = async (data?: {
    menuId: number;
    openStatus?: number;
    courseType?: number;
    coursePermission?: number;
    name?: string;
  }) => {
    try {
      const queryParams: Record<string, any> = {};
      if (data?.menuId) {
        queryParams.menuId = data.menuId;
      }
      if (data?.openStatus !== undefined) {
        queryParams.openStatus = data.openStatus;
      }
      if (data?.courseType) {
        queryParams.courseType = data.courseType;
      }
      if (data?.coursePermission !== undefined) {
        queryParams.coursePermission = data.coursePermission;
      }
      if (data?.name) {
        queryParams["params[name]"] = data.name;
      }

      const response = await http.get("/system/course/list", queryParams);
      return response.data;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  };

  // 获取课程详细信息
  const getCursorDetail = async (courseId: string) => {
    try {
      const response = await http.get(`/system/course/${courseId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取课程详细信息失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //编辑课程
  const editCursor = async (data: {
    courseId: string;
    courseName: string;
    courseCoverUrl: string;
    courseDesc: string;
    coursePermission: number;
    chapterList: any[];
  }) => {
    try {
      const response = await http.put("/system/course", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "编辑课程失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //复制课程
  const copyCursor = async (courseId: string) => {
    try {
      const response = await http.get(`/system/course/copy/${courseId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "复制课程失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //删除课程
  const deleteCursor = async (courseIds: string) => {
    try {
      const response = await http.del(`/system/course/${courseIds}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "删除课程失败");
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
  // 下载oss（返回 blob URL 用于显示图片）
  const downloadOSS = async (ossId: string) => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();
      const response = await fetch(
        `${config.public.apiBaseUrl}/resource/oss/download/${ossId}`,
        {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      return blobUrl;
    } catch (error: any) {
      throw error;
    }
  };
  // 新增课程
  const createCursor = async (data: {
    courseName: string;
    courseCoverUrl: string;
    courseDesc: string;
    coursePermission: number;
    chapterList: any[];
  }) => {
    try {
      const response = await http.post("/system/course", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "新增课程失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //查询课程章节资源列表
  const getChapterResourceList = async (
    chapterId: string,
    resourceType?: number,
  ) => {
    try {
      const queryParams: Record<string, any> = {};
      if (chapterId) {
        queryParams.chapterId = chapterId;
      }
      if (resourceType !== undefined) {
        queryParams.resourceType = resourceType;
      }

      const response = await http.get(
        "/system/course/resource/visible/list",
        queryParams,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取课程章节资源列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //根据章节id获取课程章节资源列表
  // const getChapterResourceList = async (chapterId: string) => {
  //     try {
  //       const response = await http.get(`/system/course/chapter/${chapterId}`)
  //       if (response.code !== 200) {
  //         throw new Error(response.msg || '获取课程章节资源列表失败')
  //       }
  //       return response.data
  //     } catch (error: any) {
  //       throw error
  //     }
  //   }
  //开始备课
  const startPrepare = async (chapterId: string, courseId: string) => {
    try {
      const queryParams: Record<string, any> = {};
      if (chapterId) {
        queryParams.chapterId = chapterId;
      }
      if (courseId !== undefined) {
        queryParams.courseId = courseId;
      }
      const response = await http.post(
        "/system/course/chapter/prepare",
        queryParams,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "开始备课失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //新增课程章节资源
  const createChapterResource = async (data: {
    chapterId: string;
    resourceType: number;
    ossId: string;
    fileName: string;
  }) => {
    try {
      const response = await http.post("/system/course/resource/add", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "新增课程章节资源失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //删除课程章节资源
  const deleteChapterResource = async (resourceId: string) => {
    try {
      const response = await http.del(
        `/system/course/resource/remove/${resourceId}`,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "删除课程章节资源失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //复制课程章节资源
  const copyChapterResource = async (resourceId: string) => {
    try {
      const response = await http.get(
        `/system/course/resource/copy/${resourceId}`,
      );
      console.log(response, "复制课程章节资源");
      if (response.code !== 200) {
        throw new Error(response.msg || "复制课程章节资源失败");
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  //获取编程字典

  const getResourceeDict = async () => {
    try {
      const response = await http.get(
        "/system/dict/data/type/resource_file_type",
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取编程字典失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //查询课程章节资源列表（分页）
  const getChapterResourceListPage = async (data: {
    chapterId: string;
    resourceType?: number;
    page: number;
    pageSize: number;
  }) => {
    try {
      const response = await http.get("/system/course/resource/page", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取课程章节资源列表（分页）失败");
      }
      return response.rows;
    } catch (error: any) {
      throw error;
    }
  };

  //设置课程章节资源可见学生
  const setChapterResourceVisibleStudent = async (data: {
    chapterId: string;
    resourceIds: string[];
  }) => {
    try {
      const response = await http.post("/system/course/resource/set", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "设置课程章节资源可见学生失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //获取学生可见资源列表
  const getResourceeVisible = async (data: { chapterId: string }) => {
    try {
      const response = await http.get("/system/course/resource/visible", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学生可见资源列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //获取课程可见班级列表
  const GetChapterCourse = async (courseId: string) => {
    try {
      const response = await http.get(`/system/course/class/${courseId}`);
      console.log(response, "获取课程可见班级列表");
      if (response.code !== 200) {
        throw new Error(response.msg || "获取课程可见班级列表失败");
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  // 设置可见班级
  const setChapterResourceVisibleClass = async (data: {
    courseId: string | number;
    classIds: string[];
  }) => {
    try {
      const response = await http.post("/system/course/set", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "设置可见班级失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //查询课程测评列表
  const getCourseEvaluationList = async (courseId: string) => {
    try {
      const response = await http.get(`system/course/exercise/${courseId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "查询课程测评列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //查询课程测评详情
  const getCourseEvaluationDetail = async (exerciseId: string) => {
    try {
      const response = await http.get(
        `system/course/exercise/detail/${exerciseId}`,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "查询课程测评列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //查询设置考试列表
  const setCourseEvaluationList = async (data: {
    courseId: string;
    exerciseId: string;
  }) => {
    try {
      const response = await http.get(`system/course/exercise/set/list`, data);
      if (response.code !== 200) {
        throw new Error(response.msg || "查询设置考试列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //下发测评
  const startDistribute = async (data: {
    courseId: string;
    exerciseId: string;
    classId: string;
    examDate: string;
    examTime: string;
    examDuration: number;
    evaluationIds?: Array<string | number>;
  }) => {
    try {
      const response = await http.post(`/system/evaluation/distribute`, data);
      if (response.code !== 200) {
        throw new Error(response.msg || "下发测评失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //撤回测评
  const withdrawExam = async (data: {
    exerciseId: string;
    classId: string;
  }) => {
    try {
      const response = await http.post(`/system/evaluation/withdraw`, data);
      if (response.code !== 200) {
        throw new Error(response.msg || "撤回测评失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //获取已设置考试的班级列表
  const getChapterExerciseclass = async (data: {
    exerciseId: string;
    courseId: string;
  }) => {
    try {
      const response = await http.get(
        "/system/course/exercise/class/list",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取已设置考试的班级列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //备课-保存素养评价配置
  const saveLiteracyConfig = async (data: {
    objectType: number;
    configList: Array<{
      objectId: string | number;
      quotaIds: Array<string | number>;
    }>;
  }) => {
    try {
      const response = await http.post(
        "/system/course/resource/eval-config",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "保存素养评价配置失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  // 备课 - 查询素养评价配置
  const getResourceeDictEvalconfig = async (
    objectId: string | number,
    objectType: number,
  ) => {
    try {
      const response = await http.get(
        `/system/course/resource/eval-config/${objectId}/${objectType}`,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "查询素养评价配置失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //备课 -分页查询练习题列表(弹窗关联自定义练习题)
  const getExerciseListPage = async (data: {
    chapterId: string | number;
    pageSize: string | number;
    pageNum: number;
  }) => {
    try {
      const response = await http.get("/system/exercise/page", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "分页查询作品列表失败");
      }
      return {
        rows: response.rows || [],
        total: response.total || 0,
      };
    } catch (error: any) {
      throw error;
    }
  };
  //备课 -分页查询作品列表(弹窗关联作品管理文件)
  const getChapterResourceOpusListPage = async (data: {
    chapterId: string | number;
    opusType: string | number;
    pageSize: string | number;
    pageNum: number;
  }) => {
    try {
      const response = await http.get("/system/user/profile/opus/page", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "分页查询作品列表失败");
      }
      return {
        rows: response.rows || [],
        total: response.total || 0,
      };
    } catch (error: any) {
      throw error;
    }
  };
  //关联/取消关联课程章节(弹窗关联作品管理文件)
  const toggleChapterResource = async (data: {
    opusId: string | number;
    chapterId: string | number;
    type: string | number; // 1-关联 2-取消关联
  }) => {
    try {
      const response = await http.post("/system/user/profile/opus/bind", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "关联/取消关联课程章节失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //AI 查询AI实践列表
  const getCursorOptList = async (data: {
    chapterId: string;
    optType: string; // 图像分类:image_cls 语音分类:audio_cls 姿态分类:pose_cls 手势分类:gesture_cls
  }) => {
    try {
      const response = await http.get("/system/opt/page", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "查询AI实践列表失败");
      }
      return {
        rows: response.rows || [],
        total: response.total || 0,
      };
    } catch (error: any) {
      throw error;
    }
  };
  // AI 关联/取消关联课程章节
  const toggleChapterOpt = async (data: {
    optId: string | number;
    chapterId: string | number;
    type: string | number; // 1-关联 2-取消关联
  }) => {
    try {
      const response = await http.post("/system/opt/bind", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "关联/取消关联课程章节失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //AI -修改AI实践
  const editCursorOpt = async (data: {
    optId: string | number;
    optName?: string;
  }) => {
    try {
      const response = await http.put("/system/opt", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "修改AI实践失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //AI-删除AI实践
  const deleteCursorOpt = async (optIds: string) => {
    try {
      const response = await http.del(`/system/opt/${optIds}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "删除AI实践失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  // AI-查询非模型关联的实践列表

  const getCursorOptListNoModel = async ( chapterId: string) => {
    try
     {
      const response = await http.get(`/system/opt/bond/${chapterId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "查询非模型关联的实践列表失败");
      }
      return {
        rows: Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.rows)
            ? response.rows
            : [],
        total: Number(response.total || response.data?.length || 0),
      };
    } catch (error: any) {
      throw error;
    }
  };
  // AI-非模型关联/取消关联课程章节
    const toggleChapterOptNoModel = async (data: {
    optType: string ;
    chapterId: string | number;
    type: string | number; // 1-关联 2-取消关联
  }) => {
    try {
      const response = await http.post("/system/opt/bond", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "非模型关联/取消关联课程章节失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  return {
    getCursorTreeMenu,
    getCursorList,
    createCursor,
    getCursorDetail,
    editCursor,
    uploadOSS,
    downloadOSS,
    deleteCursor,
    getChapterResourceList,

    startPrepare,
    createChapterResource,
    deleteChapterResource,
    copyChapterResource,
    copyCursor,
    getResourceeDict,
    getChapterResourceListPage,
    setChapterResourceVisibleStudent,
    setChapterResourceVisibleClass,
    GetChapterCourse,
    getResourceeVisible,
    getCourseEvaluationList,
    getCourseEvaluationDetail,
    setCourseEvaluationList,
    startDistribute,
    withdrawExam,
    getChapterExerciseclass,
    saveLiteracyConfig,
    getResourceeDictEvalconfig,
    getChapterResourceOpusListPage,
    getExerciseListPage,
    toggleChapterResource,
    getCursorOptList,
    toggleChapterOpt,
    editCursorOpt,
    deleteCursorOpt,
    getCursorOptListNoModel,
    toggleChapterOptNoModel,
  };
};
