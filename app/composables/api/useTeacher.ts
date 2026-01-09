/**
 * 教师相关 API
 */
import { useHttp } from "./useHttp";
import { ElMessage } from "~/components/ui";

export const useTeacher = () => {
  const http = useHttp();

  //获取老师的左侧菜单信息
  const getTeacherMenu = async () => {
    try {
      const response = await http.get("/system/menu/getRouters");
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 获取教师信息
  const getTeacherInfo = async () => {
    try {
      const response = await http.get("/teacher/info");
      if (response.code !== 200) {
        throw new Error(response.msg || "获取教师信息失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 获取开课设置列表
  const getTeachList = async (chapterId?: string) => {
    try {
      const response = await http.get("/system/teach/list", { chapterId });
      if (response.code !== 200) {
        throw new Error(response.msg || "获取开课设置失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 获取年级字典
  const getGradeDict = async () => {
    try {
      const response = await http.get("/system/dict/data/type/edu_grade_type");
      if (response.code !== 200) {
        throw new Error(response.msg || "获取年级字典失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  // 获取班级列表
  const getClassList = async () => {
    try {
      const response = await http.get("/system/class/grade");
      if (response.code !== 200) {
        throw new Error(response.msg || "获取班级列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 根据年级获取班级列表
  const getClassByGrade = async (grade: string) => {
    try {
      const response = await http.get(`/system/class/grade/${grade}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取班级列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 获取学生列表
  const getStudentList = async (data: {
    classId: string;
    numberName?: string;
  }) => {
    try {
      // 构建查询参数，numberName 需要转换为 params[numberName] 格式
      const queryParams: Record<string, any> = { classId: data.classId };
      if (data.numberName) {
        queryParams["params[numberName]"] = data.numberName;
      }
      const response = await http.get("/system/student/list", queryParams);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学生列表失败");
      }
      return response.rows || response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 获取课程列表
  const getCourseList = async () => {
    try {
      const response = await http.get("/teacher/course/list");
      if (response.code !== 200) {
        throw new Error(response.msg || "获取课程列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 创建班级
  const createClass = async (data: {
    className: string;
    grade: number;
    gradeName: string;
  }) => {
    try {
      const response = await http.post("/system/class", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "创建班级失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 更新班级
  const updateClass = async (data: {
    id: string;
    className: string;
    grade: number;
    gradeName: string;
    schoolId?: string;
  }) => {
    try {
      const response = await http.put("/system/class", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "编辑班级失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 删除班级
  const deleteClass = async (id: string) => {
    try {
      const response = await http.del(`/system/class/${id}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //添加学生
  const addStudent = async (data: { classId: string; studentName: string }) => {
    try {
      const response = await http.post("/system/student", data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  // 重置密码
  const resetPassword = async (ids: string[]) => {
    try {
      const response = await http.post("/system/student/reset", { ids });
      if (response.code !== 200) {
        throw new Error(response.msg || "重置密码失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //移班
  const transferClass = async (data: {
    ids: string[];
    classId: string;
    teacherId: string;
  }) => {
    try {
      const response = await http.post("/system/student/move", data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 删除学生
  const removeStudent = async (ids: string[]) => {
    try {
      const response = await http.del(`/system/student/${ids.join(",")}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "删除学生失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 创建快捷登录
  const createQuickLogin = async (classId: string) => {
    try {
      const response = await http.get(`/system/class/code/enable/${classId}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询班级码信息
  const getQuickLoginInfo = async () => {
    try {
      const response = await http.get("/system/class/getClassLoginPassword");
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //停用快捷登录
  const stopQuickLogin = async (classId: string) => {
    try {
      const response = await http.get(`/system/class/code/stop/${classId}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //导出学生信息（文件流下载）
  const exportStudentInfo = async (filename: string = "学生账号信息.xlsx") => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();

      const response = await fetch(
        `${config.public.apiBaseUrl}/system/student/export`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("导出失败");
      }

      // 下载文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error: any) {
      throw error;
    }
  };

  //下载导入模板（文件流下载）
  const downloadTemplate = async () => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();

      const response = await fetch(
        `${config.public.apiBaseUrl}/system/student/template`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("下载失败");
      }

      const filename = "学生账号批量导入模板.xlsx";

      // 下载文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error: any) {
      throw error;
    }
  };
  //导入学生信息（文件上传）
  const importStudent = async (file: File, classId: string) => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("classId", classId);

      const response = await fetch(
        `${config.public.apiBaseUrl}/system/student/importData`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: formData,
        }
      );

      const result = await response.json();
      // 不管成功失败都提示接口返回的msg
      if (result.msg) {
        if (result.code === 200) {
          ElMessage.success(result.msg);
        } else {
          ElMessage.error(result.msg);
        }
      }
      if (result.code !== 200) {
        throw new Error(result.msg || "导入失败");
      }
      return result.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 获取学生统一密码
  const getStudentPassword = async () => {
    try {
      const response = await http.get("/system/org/getPwd");
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学生统一密码失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 班级码登录
  const classCodeLogin = async (data: {
    classCode: string;
    classPassword: string;
  }) => {
    try {
      const response = await http.post("/system/class/code/login", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "登录失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //小组管理列表
  const getGroupList = async (data?: {
    classId?: string;
    teamLeader?: string;
  }) => {
    try {
      const queryParams: Record<string, any> = {};
      if (data?.classId) {
        queryParams.classId = data.classId;
      }
      if (data?.teamLeader) {
        queryParams["params[teamLeader]"] = data.teamLeader;
      }
      const response = await http.get("/system/team/list", queryParams);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //新增小组
  const addGroup = async (data: {
    classId: string;
    teamName: string;
    remarks?: string;
    studentList?: {
      studentNumber: string;
      studentName: string;
      isLeader: 0 | 1;
      delFlag?: 0 | 1;
    }[];
  }) => {
    try {
      const response = await http.post("/system/team", data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询添加学员列表
  const getAddStudentList = async (classId: string) => {
    try {
      const response = await http.get(`/system/team/student/list/${classId}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //删除小组
  const deleteGroup = async (ids: string[]) => {
    try {
      const response = await http.del(`/system/team/${ids.join(",")}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //编辑小组
  const updateGroup = async (data: {
    id: string;
    classId: string;
    teamName: string;
    remarks?: string;
    studentList?: {
      studentNumber: string;
      studentName: string;
      isLeader: 0 | 1;
      delFlag: 0 | 1;
    }[];
  }) => {
    try {
      const response = await http.put("/system/team", data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //查询小组成员信息
  const getGroupMemberList = async (id: string) => {
    try {
      const response = await http.get(`/system/team/${id}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //查询授课记录课程章节列表
  const getTeachChapterList = async (courseId: string, classId: string) => {
    try {
      const response = await http.get(`/system/teach/chapter/list`, {
        courseId,
        classId,
      });

      if (response.code !== 200) {
        throw new Error(response.msg || "获取查询授课记录课程章节列表失败");
      }

      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //查询班级列表（不分页）
  const getClassListNoPage = async () => {
    try {
      const response = await http.get("/system/class/list");
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //开课设置 获取课程菜单树形结构列表
  const getCourseMenuTree = async () => {
    try {
      const response = await http.get("/system/course/tree");
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 开始上课
  const beginClass = async (data: {
    classId: string;
    courseId: string;
    chapterId: string;
    peerId?: string;
  }) => {
    try {
      const response = await http.post("/system/teach/begin", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "开始上课失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //下课
  const endClass = async (data: {
    classId: string;
    courseId: string;
    chapterId: string;
    peerId?: string;
  }) => {
    try {
      const response = await http.post("/system/teach/end", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "下课失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 踢出学生登录
  const kickoutStudent = async (studentId: string) => {
    try {
      const response = await http.get(`/system/student/kickout/${studentId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "踢出失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询课件列表
  const getCoursewareList = async (data: { chapterId: string }) => {
    try {
      const response = await http.get("/system/teach/resource/list", data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //发送课件
  const sendCourseware = async (data: {
    classId: string | number;
    peerId: string | number;
    coursewareList: Array<{
      resourceId: string | number;
      fileName: string;
      resourceUrl: string;
    }>;
  }) => {
    try {
      const response = await http.post("/system/teach/courseware/send", {
        ...data,
        peerId: Number(data.peerId)
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //撤回发送

  const withdrawSend = async (data: {
    classId: string | number;
    peerId: string | number;
    coursewareList: Array<{
      resourceId: string | number;
      fileName: string;
      resourceUrl: string;
    }>;
  }) => {
    try {
      const response = await http.post("/system/teach/courseware/revoke", {
        ...data,
        peerId: Number(data.peerId)
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  return {
    getTeacherMenu,
    getTeacherInfo,
    getGradeDict,
    getClassList,
    getClassByGrade,
    getStudentList,
    getCourseList,
    createClass,
    updateClass,
    deleteClass,
    addStudent,
    resetPassword,
    transferClass,
    removeStudent,
    createQuickLogin,
    getQuickLoginInfo,
    stopQuickLogin,
    exportStudentInfo,
    downloadTemplate,
    importStudent,
    getStudentPassword,
    classCodeLogin,
    getGroupList,
    addGroup,
    getAddStudentList,
    deleteGroup,
    getGroupMemberList,
    updateGroup,
    getTeachList,
    getTeachChapterList,
    getClassListNoPage,
    getCourseMenuTree,
    beginClass,
    endClass,
    kickoutStudent,
    getCoursewareList,
    sendCourseware,
    withdrawSend,
  };
};
