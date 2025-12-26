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
    const getCursorList = async (data?: {menuId:number, openStatus?: number;courseType?:number,coursePermission?:number, name?: string }) => {
    try {
      const queryParams: Record<string, any> = {}
      if (data?.menuId) {
        queryParams.menuId = data.menuId
      }
      if (data?.openStatus !== undefined) {
        queryParams.openStatus = data.openStatus
      }
      if (data?.courseType) {
        queryParams.courseType = data.courseType
      }
      if (data?.coursePermission !== undefined) {
        queryParams.coursePermission = data.coursePermission
      }
      if (data?.name) {
        queryParams['params[name]'] = data.name
      }

      const response = await http.get('/system/course/list', queryParams)
      return response.data
    } catch (error: any) {
      console.log(error)
      throw error
    }
  }

  // 获取课程详细信息
  const getCursorDetail = async (courseId: string) => {
    try {
      const response = await http.get(`/system/course/${courseId}`)
      if (response.code !== 200) {
        throw new Error(response.msg || '获取课程详细信息失败')
      }
      return response.data
    } catch (error: any) {
      throw error
    }
  }
  //编辑课程
  const editCursor = async (data: {
    courseId: string
    courseName: string
    courseCoverUrl: string
    courseDesc: string
    coursePermission: number
    chapterList: any[]
  }) => {
    try {
      const response = await http.put('/system/course', data)
      if (response.code !== 200) {
        throw new Error(response.msg || '编辑课程失败')
      }
      return response.data
    } catch (error: any) {
      throw error
    }
  }
  //复制课程
  const copyCursor = async (courseId: string) => {
    try {
      const response = await http.get(`/system/course/copy/${courseId}`)
      if (response.code !== 200) {
        throw new Error(response.msg || '复制课程失败')
      }
      return response.data
    } catch (error: any) {
      throw error
    }
  }
  //删除课程
  const deleteCursor = async (courseIds: string) => {
    try {
      const response = await http.del(`/system/course/${courseIds}`)
      if (response.code !== 200) {
        throw new Error(response.msg || '删除课程失败')
      }
      return response.data
    } catch (error: any) {
      throw error
    }
  }
  // 上传OSS对象存储
  const uploadOSS = async (file: File) => {
    try {
      const config = useRuntimeConfig()
      const token = http.getToken()
      
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await fetch(`${config.public.apiBaseUrl}/resource/oss/upload`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      })
      
      const response = await res.json()
      if (response.code !== 200) {
        throw new Error(response.msg || '上传OSS对象存储失败')
      }
      return response.data // 返回 { url, fileName, ossId }
    } catch (error: any) {
      throw error
    }
  }
// 下载oss（返回 blob URL 用于显示图片）
  const downloadOSS = async (ossId: string) => {
    try {
      const config = useRuntimeConfig()
      const token = http.getToken()
      const response = await fetch(`${config.public.apiBaseUrl}/resource/oss/download/${ossId}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      return blobUrl
    } catch (error: any) {
      throw error
    }
  }
  // 新增课程
  const createCursor = async (data: {
    courseName: string
    courseCoverUrl: string
    courseDesc: string
    coursePermission: number
    chapterList: any[]
  }) => {
    try {
      const response = await http.post('/system/course', data)
      if (response.code !== 200) {
        throw new Error(response.msg || '新增课程失败')
      }
      return response.data
    } catch (error: any) {
      throw error
    }
  }
  
  //查询课程章节资源列表
  const getChapterResourceList = async (chapterId: string, resourceType?: number) => {
    try {

        const queryParams: Record<string, any> = {}
        if (chapterId) {
          queryParams.chapterId = chapterId
        }
        if (resourceType !== undefined) {
          queryParams.resourceType = resourceType
        }
   
        
      const response = await http.get('/system/course/resource/list',queryParams)
      if (response.code !== 200) {
        throw new Error(response.msg || '获取课程章节资源列表失败')
      }
      return response.data
    } catch (error: any) {
      throw error
    }
  }
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
 const startPrepare = async (chapterId: string) => {
    try {
      const response = await http.get(`/system/course/chapter/prepare/${chapterId}`)
      if (response.code !== 200) {
        throw new Error(response.msg || '开始备课失败')
      }
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  //新增课程章节资源
  const createChapterResource = async (data: {
    chapterId: string
    resourceType: number
    ossId: string
    fileName: string
 
  }) => {
    try {
      const response = await http.post('/system/course/resource/add', data)
      if (response.code !== 200) {
        throw new Error(response.msg || '新增课程章节资源失败')
      }
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  //删除课程章节资源
  const deleteChapterResource = async (resourceId: string) => {
    try {
      const response = await http.del(`/system/course/resource/remove/${resourceId}`)
      if (response.code !== 200) {
        throw new Error(response.msg || '删除课程章节资源失败')
      }
      return response.data
    } catch (error: any) {
      throw error
    }
  }


  //复制课程章节资源
  const copyChapterResource = async (resourceId: string) => {
    try {
      const response = await http.get(`/system/course/resource/copy/${resourceId}`)
      console.log(response,'复制课程章节资源')
      if (response.code !== 200) {
        throw new Error(response.msg || '复制课程章节资源失败')
      }
      return response
    } catch (error: any) {
      throw error
    }
  }



//获取编程字典

  const getResourceeDict = async () => {
    try {
      const response = await http.get('/system/dict/data/type/resource_file_type')
      if (response.code !== 200) {
        throw new Error(response.msg || '获取编程字典失败')
      }
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  //查询课程章节资源列表（分页）
  const getChapterResourceListPage = async (data: {
    chapterId: string
    resourceType?: number
    page: number
    pageSize: number
  }) => {
    try {
      const response = await http.get('/system/course/resource/page', data)
      if (response.code !== 200) {
        throw new Error(response.msg || '获取课程章节资源列表（分页）失败')
      }
      return response.rows
    } catch (error: any) {
      throw error
    }
  } 

  //设置课程章节资源可见学生
  const setChapterResourceVisibleStudent = async (data: {
    resourceList: { resourceId: string; isVisible: number }[]
  }) => {
    try {
      const response = await http.post('/system/course/resource/set/student/visible', data)
      if (response.code !== 200) {
        throw new Error(response.msg || '设置课程章节资源可见学生失败')
      }
      return response.data
    } catch (error: any) {
      throw error
    }
  }














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
    setChapterResourceVisibleStudent

  };    
};
