/**
 *  教室成长中心
 */
import { useHttp } from "./useHttp";

export interface growth {
  growthId: string;
  growthName: string;
  growthDescription: string;
  growthType: string;
  growthStatus: string;
  growthCreateTime: string;
  growthUpdateTime: string;
}

export const growthAdmin = () => {
  const http = useHttp();
  // 获取教师课程菜单树形结构列表
  const getTeacherCourseMenuTree = async () => {
    try {
      const response = await http.get("/system/teacher/course/menu/tree");
      if (response.code !== 200) {
        throw new Error(response.msg || "获取教师课程菜单树形结构列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询教师课程列表（不分页）
  const getTeacherCourseList = async (menuId: number, openStatus?: number) => {
    try {
      const response = await http.get("/system/teacher/course/list", {
        menuId,
        openStatus,
      });
      if (response.code !== 200) {
        throw new Error(response.msg || "获取教师课程列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //获取教师课程详细信息
  const getTeacherCourseDetail = async (courseId: string) => {
    try {
      const response = await http.get(`/system/teacher/course/${courseId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取教师课程详细信息失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询教师课程章节资源列表
  const getTeacherCourseChapterResourceList = async (chapterId: string) => {
    try {
      const response = await http.get(`/system/teacher/course/resource/list`, {
        chapterId,
      });
      if (response.code !== 200) {
        throw new Error(response.msg || "查询教师课程章节资源列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //社区
  //查询话题列表
  const getTeacherCourseTopicList = async (params: {
    isTop?: number;
    isOfficial?: number;
    isPremium?: number;
    pageNum?: number;
    pageSize?: number;
    title?: string;
    orderByColumn?: string;
  }) => {
    try {
      const response = await http.get(
        `/system/teacher/community/topic/page`,
        params
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "查询话题列表失败");
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  //获取我的话题
  const getMyTeacherCourseTopicList = async (params: {
    pageNum?: number;
    pageSize?: number;
    title?: string;
    orderByColumn?: string;
  }) => {
    try {
      const response = await http.get(
        `/system/teacher/community/topic/my`,
        params
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取我的话题失败");
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  };
  //获取我评论过的话题
  const getMyCommentedTeacherCourseTopicList = async (params: {
    pageNum?: number;
    pageSize?: number;
    title?: string;
    orderByColumn?: string;
  }) => {
    try {
      const response = await http.get(
        `/system/teacher/community/topic/myCommented`,
        params
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取我的话题失败");
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  };
  //发布话题
  const publishTeacherCourseTopic = async (data: {
    title: string;
    content: string;
  }) => {
    try {
      const response = await http.post(`/system/teacher/community/topic`, data);
      if (response.code !== 200) {
        throw new Error(response.msg || "发布话题失败");
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  //获取话题详细信息
  const getTeacherTopicDetail = async (topicId: string) => {
    try {
      const response = await http.get(
        `/system/teacher/community/topic/${topicId}`
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取话题详细信息失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //发表评论/回复
  const getLeaveaComment = async (data: {
    topicId: string;
    content: string;
    parentId?: string;
  }) => {
    try {
      const response = await http.post(
        `/system/teacher/community/topic/comment`,
        data
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "发表评论/回复失败");
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  };
  //获取话题评论列表
  const getLeaveaCommentList = async (topicId: string) => {
    try {
      const response = await http.get(
        `/system/teacher/community/topic/comment/${topicId}`
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "获取话题评论列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //删除评论
  const delCommentList = async (commentIds: string) => {
    try {
      const response = await http.del(
        `/system/teacher/community/topic/comment/${commentIds}`
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "删除评论失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //互动（点赞、收藏）
  const getLike = async (data: {
    topicId?: string;
    commentId?: string;
    type: string;
  }) => {
    try {
      const response = await http.post(
        `/system/teacher/community/topic/interaction`,
        data
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "互动（点赞、收藏）失败");
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  // 删除话题
  const delTeacherTopic = async (topicIds: string) => {
    try {
      const response = await http.del(
        `/system/teacher/community/topic/${topicIds}`
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "删除话题失败");
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  //图书馆
  //获取教师图书菜单树形结构列表

  const getTeacherbookMenuTree = async () => {
    try {
      const response = await http.get("/system/teacher/library/book/menu/tree");
      if (response.code !== 200) {
        throw new Error(response.msg || "获取教师图书菜单树形结构列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //查询教师图书列表

  const getTeacherbookList = async (menuId: number) => {
    try {
      const response = await http.get("/system/teacher/library/book/page", {
        menuId,
      });
      if (response.code !== 200) {
        throw new Error(response.msg || "查询教师图书列表失败");
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  //获取教师图书详细信息
  const getBookdetail = async (bookId: string) => {
    try {
      const response = await http.get(`/system/teacher/library/book/${bookId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取教师图书详细信息");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询教师图书资源列表
  const getBookresourceList = async (bookId: string) => {
    try {
      const response = await http.get("/system/teacher/library/book/resource/list", {
        bookId,
      });
      if (response.code !== 200) {
        throw new Error(response.msg || "获取教师图书资源列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  return {
    getTeacherCourseMenuTree,
    getTeacherCourseList,
    getTeacherCourseDetail,
    getTeacherCourseChapterResourceList,
    getTeacherCourseTopicList,
    getMyTeacherCourseTopicList,
    getMyCommentedTeacherCourseTopicList,
    publishTeacherCourseTopic,
    getTeacherTopicDetail,
    getLeaveaComment,
    getLeaveaCommentList,
    delCommentList,
    getLike,
    delTeacherTopic,
    getTeacherbookMenuTree,
    getTeacherbookList,
    getBookdetail,
    getBookresourceList,
  };
};
