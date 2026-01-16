<template>
  <div class="topic-detail-page flex-1 flex flex-col">
    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
        <h3 class="text-lg font-medium text-gray-800 mb-4">确认删除</h3>
        <p class="text-gray-600 mb-6">确定要删除这个话题吗？删除后无法恢复。</p>
        <div class="flex justify-end gap-3">
          <button class="px-4 py-2 text-gray-600 hover:text-gray-800" @click="showDeleteConfirm = false">取消</button>
          <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50" :disabled="submitting" @click="confirmDeleteTopic">删除</button>
        </div>
      </div>
    </div>

    <!-- 顶部导航 -->
    <div class="detail-header flex items-center gap-4 px-6 py-4 bg-white">
      <button class="back-btn" @click="goBack">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="breadcrumb text-sm text-gray-500">
        <span class="cursor-pointer hover:text-[#FF9900]" @click="goBack">{{ $t('growth.teacherCommunity') }}</span>
        <span class="mx-2">></span>
        <span class="text-gray-800">{{ topicDetail.title }}</span>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 overflow-auto bg-white">
      <div class="content-wrapper">
        <!-- 标题 -->
        <h1 class="text-xl font-medium text-gray-800 text-center py-6">{{ topicDetail.title }}</h1>
        
        <!-- 文章内容区 -->
        <div class="article-area">
          <!-- 文章内容 -->
          <div class="article-content" v-html="topicDetail.content"></div>
          
          <!-- 日期和点赞评论 -->
          <div class="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
            <div class="flex items-center gap-2 text-sm text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
                <path stroke-linecap="round" stroke-width="1.5" d="M12 6v6l4 2"/>
              </svg>
              <span>{{ topicDetail.date }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button class="flex items-center gap-1 text-gray-400 hover:text-[#FF9900]" @click="handleLike">
               
                <img :src="topicDetail.isLiked ? dianzhanActiveIcon : dianzhanIcon" class="w-5 h-5" alt="" />
                <span :class="{ 'text-[#FF9900]': topicDetail.isLiked }">{{ topicDetail.likes }}</span>
              </button>
              <button class="flex items-center gap-1 text-gray-400 hover:text-[#FF9900]" @click="handleCollect">
                <svg class="w-5 h-5" :class="{ 'text-[#FF9900]': topicDetail.isCollected }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="topicDetail.isCollected" fill="currentColor" stroke="none" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
                <span :class="{ 'text-[#FF9900]': topicDetail.isCollected }">{{ topicDetail.collects }}</span>
              </button>
              <div class="flex items-center gap-1 text-gray-400">
                <img :src="pinlunIcon" class="w-5 h-5" alt="" />
                <span>{{ topicDetail.commentCount }}</span>
              </div>
            </div>
          </div>
          
          <!-- 评论输入框 -->
          <div class="flex items-start gap-4 mt-6 pt-6 border-t border-gray-100">
            <span class="text-gray-600 flex-shrink-0 pt-2">{{ $t('growth.comment') }}</span>
            <div class="flex-1 flex gap-4">
              <textarea 
                v-model="commentContent"
                :placeholder="$t('growth.commentPlaceholder')"
                class="flex-1 border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-[#FF9900] resize-none"
                rows="3"
                maxlength="1500"
              ></textarea>
              <button 
                class="self-end px-6 py-2 bg-[#FF9900] text-white text-sm rounded hover:bg-[#E68A00] transition-colors disabled:opacity-50"
                :disabled="!commentContent.trim() || submitting"
                @click="handleComment"
              >
                {{ $t('growth.publish') }}
              </button>
            </div>
          </div>
          
          <!-- 评论列表 -->
          <div class="comment-list mt-6">
            <div v-for="comment in commentList" :key="comment.id" class="comment-item py-4 border-t border-gray-100">
              <div class="flex gap-3">
                <div class="w-8 h-8 bg-[#FF6B6B] rounded-full flex-shrink-0 flex items-center justify-center">
                  <span class="text-white text-xs">{{ comment.author?.charAt(0) }}</span>
                </div>
                <div class="flex-1">
                  <div class="font-medium text-gray-800 mb-1">{{ comment.author }}</div>
                  <div class="text-sm text-gray-600 leading-relaxed mb-2">{{ comment.content }}</div>
                  <div class="flex items-center justify-between text-sm text-gray-400">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
                        <path stroke-linecap="round" stroke-width="1.5" d="M12 6v6l4 2"/>
                      </svg>
                      <span>{{ comment.date }}</span>
                    </div>
                    <div class="flex items-center gap-4">
                      <button class="flex items-center gap-1 hover:text-[#FF9900]" @click="handleCommentLike(comment)">
                        <img :src="comment.isLiked ? dianzhanActiveIcon : dianzhanIcon" class="w-4 h-4" alt="" />
                        <span :class="{ 'text-[#FF9900]': comment.isLiked }">{{ comment.likes }}</span>
                      </button>
                      <button class="flex items-center gap-1 hover:text-[#FF9900]" @click="handleReplyClick(comment)">
                        <img :src="pinlunIcon" class="w-4 h-4" alt="" />
                        <span>{{ $t('growth.reply') }}</span>
                      </button>
                      <button v-if="comment.isMine" class="flex items-center gap-1 hover:text-red-500" @click="handleDeleteComment(comment)">
                        <span>{{ $t('common.delete') }}</span>
                      </button>
                    </div>
                  </div>
                  
                  <!-- 回复输入框 -->
                  <div v-if="replyingTo?.id === comment.id" class="mt-3 p-3 bg-gray-50 rounded-lg">
                    <textarea v-model="replyContent" :placeholder="'回复 ' + comment.author" class="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#FF9900] resize-none" rows="2" maxlength="1500"></textarea>
                    <div class="flex items-center justify-end gap-2 mt-2">
                      <button class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700" @click="cancelReply">{{ $t('common.cancel') }}</button>
                      <button class="px-3 py-1 bg-[#FF9900] text-white text-sm rounded hover:bg-[#E68A00] disabled:opacity-50" :disabled="!replyContent.trim() || submitting" @click="handleReply">{{ $t('growth.reply') }}</button>
                    </div>
                  </div>

                  <!-- 子评论 -->
                  <div v-if="comment.children?.length" class="mt-3 space-y-2 pl-2">
                    <CommentItem
                      v-for="child in comment.children"
                      :key="child.id"
                      :comment="child"
                      :level="2"
                      :replying-to-id="replyingTo?.id"
                      :reply-content="replyContent"
                      :submitting="submitting"
                      @like="handleCommentLike"
                      @reply="handleReplyClick"
                      @delete="handleDeleteComment"
                      @cancel-reply="cancelReply"
                      @submit-reply="handleReply"
                      @update:reply-content="replyContent = $event"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="!commentList.length" class="text-center text-gray-400 py-10">
              {{ $t('growth.noComment') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { growthAdmin } from '~/composables/api/growth'

import dianzhanIcon from '~/assets/images/dianzhan.png'
import dianzhanActiveIcon from '~/assets/images/dianzhan_yes.png' // TODO: 替换为高亮图片
import pinlunIcon from '~/assets/images/pinlun.png'

definePageMeta({
  layout: 'sidebar'
})

const route = useRoute()
const router = useRouter()
const { getTeacherTopicDetail, getLeaveaComment, getLeaveaCommentList, delCommentList, getLike, delTeacherTopic } = growthAdmin()

interface TopicDetail {
  id: string
  title: string
  author: string
  avatar?: string
  date: string
  content: string
  source?: string
  likes: number
  collects: number
  commentCount: number
  isLiked: boolean
  isCollected: boolean
  browseCount: number
  createBy?: string
  isMine?: boolean
}

const topicDetail = ref<TopicDetail>({
  id: '',
  title: '',
  author: '',
  avatar: '',
  date: '',
  content: '',
  source: '',
  likes: 0,
  collects: 0,
  commentCount: 0,
  isLiked: false,
  isCollected: false,
  browseCount: 0,
  createBy: '',
  isMine: false
})

const loading = ref(false)
const commentContent = ref('')
const submitting = ref(false)
const replyingTo = ref<Comment | null>(null)
const replyContent = ref('')
const showDeleteConfirm = ref(false)

interface Comment {
  id: number
  author: string
  avatar?: string
  content: string
  date: string
  likes: number
  children?: Comment[]
  isMine?: boolean
  createBy?: string
  isLiked?: boolean
}

const commentList = ref<Comment[]>([])

const getCurrentUserId = () => {
  if (typeof window !== 'undefined') {
    const userInfo = localStorage.getItem('user_info')
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo)
        return user.user_id || ''
      } catch {
        return ''
      }
    }
  }
  return ''
}

const goBack = () => {
  router.back()
}

const handleLike = async () => {
  if (submitting.value) return
  const topicId = route.params.id as string
  submitting.value = true
  try {
    await getLike({ topicId, type: '1' })
    const data = await getTeacherTopicDetail(topicId)
    if (data) {
      topicDetail.value.isLiked = data.isLiked || false
      topicDetail.value.likes = data.likeCount || 0
    }
  } catch (error) {
    console.error('点赞失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleCollect = async () => {
  if (submitting.value) return
  const topicId = route.params.id as string
  submitting.value = true
  try {
    await getLike({ topicId, type: '2' })
    const data = await getTeacherTopicDetail(topicId)
    if (data) {
      topicDetail.value.isCollected = data.isCollected || false
      topicDetail.value.collects = data.collectCount || 0
    }
  } catch (error) {
    console.error('收藏失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleComment = async () => {
  if (!commentContent.value.trim() || submitting.value) return
  const topicId = route.params.id as string
  submitting.value = true
  try {
    await getLeaveaComment({ topicId, content: commentContent.value.trim() })
    commentContent.value = ''
    await loadCommentList()
  } catch (error) {
    console.error('发表评论失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleReplyClick = (comment: Comment) => {
  replyingTo.value = comment
  replyContent.value = ''
}

const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

const handleReply = async () => {
  if (!replyContent.value.trim() || !replyingTo.value || submitting.value) return
  const topicId = route.params.id as string
  submitting.value = true
  try {
    await getLeaveaComment({ topicId, content: replyContent.value.trim(), parentId: String(replyingTo.value.id) })
    replyContent.value = ''
    replyingTo.value = null
    await loadCommentList()
  } catch (error) {
    console.error('回复失败:', error)
  } finally {
    submitting.value = false
  }
}

const loadTopicDetail = async () => {
  const topicId = route.params.id as string
  const currentUserId = getCurrentUserId()
  loading.value = true
  try {
    const data = await getTeacherTopicDetail(topicId)
    if (data) {
      topicDetail.value = {
        id: data.topicId || data.id || topicId,
        title: data.title || '',
        author: data.nickName || data.author || '',
        avatar: data.avatar || '',
        date: data.createTime || '',
        content: data.content || '',
        source: data.source || '',
        likes: data.likeCount || 0,
        collects: data.collectCount || 0,
        commentCount: data.commentCount || 0,
        isLiked: data.isLiked === true,
        isCollected: data.isCollected === true,
        browseCount: data.browseCount || 0,
        createBy: data.createBy || '',
        isMine: currentUserId && String(data.createBy) === String(currentUserId)
      }
    }
    await loadCommentList()
  } catch (error) {
    console.error('加载话题详情失败:', error)
  } finally {
    loading.value = false
  }
}

const loadCommentList = async () => {
  const topicId = route.params.id as string
  const currentUserId = getCurrentUserId()
  const mapComment = (item: any): Comment => ({
    id: item.commentId || item.id,
    author: item.createByName || item.nickName || item.author || '',
    avatar: item.createByAvatar || item.avatar || '',
    content: item.content || '',
    date: item.createTime || '',
    likes: item.likeCount || 0,
    createBy: item.createBy || '',
    isMine: currentUserId && String(item.createBy) === String(currentUserId),
    isLiked: item.isLiked || false,
    children: (item.children || []).map(mapComment)
  })
  try {
    const data = await getLeaveaCommentList(topicId)
    if (data) {
      commentList.value = (Array.isArray(data) ? data : []).map(mapComment)
    }
  } catch (error) {
    console.error('加载评论列表失败:', error)
    commentList.value = []
  }
}

const handleCommentLike = async (comment: Comment) => {
  if (submitting.value) return
  const topicId = route.params.id as string
  submitting.value = true
  try {
    await getLike({ topicId, commentId: String(comment.id), type: '1' })
    await loadCommentList()
  } catch (error) {
    console.error('评论点赞失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleDeleteComment = async (comment: Comment) => {
  if (!comment.isMine || submitting.value) return
  submitting.value = true
  try {
    await delCommentList(String(comment.id))
    await loadCommentList()
  } catch (error) {
    console.error('删除评论失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleDeleteTopic = () => {
  if (!topicDetail.value.isMine || submitting.value) return
  showDeleteConfirm.value = true
}

const confirmDeleteTopic = async () => {
  submitting.value = true
  try {
    await delTeacherTopic(topicDetail.value.id)
    showDeleteConfirm.value = false
    router.back()
  } catch (error) {
    console.error('删除话题失败:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadTopicDetail()
})
</script>

<style scoped>
.topic-detail-page {
  height: calc(100vh - 70px);
  overflow: hidden;
}

.back-btn {
  width: 69px;
  height: 50px;
  background: #FF9900;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: none;
  cursor: pointer;
}

.back-btn:hover {
  background: #E68A00;
}

.content-wrapper {
  width: 77.6%;
  max-width: 1490px;
  margin: 0 auto;
  padding: 0 0 40px;
}

.article-area {
  background: #FFFFFF;
  border-radius: 10px;
  padding: 30px 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.article-content {
  font-size: 14px;
  line-height: 2;
  color: #333;
}

.article-content :deep(p) {
  margin-bottom: 1em;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4) {
  font-weight: 500;
  margin-bottom: 0.5em;
  color: #333;
}
</style>
