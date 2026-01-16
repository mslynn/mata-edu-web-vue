<template>
  <div class="comment-item-wrapper">
    <div class="flex gap-2 py-3">
      <img v-if="comment.avatar" :src="comment.avatar" class="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
      <div v-else class="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
        <span class="text-gray-500 text-xs">{{ comment.author?.charAt(0) }}</span>
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm text-gray-600 mb-1">
          <span class="font-medium text-gray-800">{{ comment.author }}</span>
          <template v-if="replyToName">
            <span class="text-gray-400 mx-1">{{ $t('growth.reply') }}</span>
            <span class="text-[#FF9900]">@{{ replyToName }}</span>
          </template>
          <span class="mx-1">:</span>
          <span class="break-words">{{ comment.content }}</span>
        </div>
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span>{{ comment.date }}</span>
          <div class="flex items-center gap-3">
            <button 
              :class="comment.isLiked ? 'flex items-center gap-1 text-[#FF9900]' : 'flex items-center gap-1 hover:text-[#FF9900]'"
              @click="$emit('like', comment)"
            >
              <img :src="comment.isLiked ? dianzhanActiveIcon : dianzhanIcon" class="w-3 h-3" alt="" />
              <span>{{ comment.likes }}</span>
            </button>
            <button class="flex items-center gap-1 hover:text-[#FF9900]" @click="$emit('reply', comment)">
              <img :src="pinlunIcon" class="w-3 h-3" alt="" />
              <span>{{ $t('growth.reply') }}</span>
            </button>
            <button v-if="comment.isMine" class="flex items-center gap-1 hover:text-red-500" @click="$emit('delete', comment)">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{{ $t('common.delete') }}</span>
            </button>
          </div>
        </div>
        
        <!-- 回复输入框 -->
        <div v-if="replyingToId === comment.id" class="mt-2 p-2 bg-white rounded-lg border border-gray-200">
          <textarea 
            :value="replyContent"
            @input="$emit('update:replyContent', ($event.target as HTMLTextAreaElement).value)"
            :placeholder="$t('growth.reply') + ' @' + comment.author"
            class="w-full border border-gray-200 rounded p-2 text-xs outline-none focus:border-[#FF9900] resize-none"
            rows="2"
            maxlength="1500"
          ></textarea>
          <div class="flex items-center justify-end gap-2 mt-1">
            <button 
              class="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700"
              @click="$emit('cancelReply')"
            >
              {{ $t('common.cancel') }}
            </button>
            <button 
              class="px-2 py-0.5 bg-[#FF9900] text-white text-xs rounded hover:bg-[#E68A00] transition-colors disabled:opacity-50"
              :disabled="!replyContent?.trim() || submitting"
              @click="$emit('submitReply')"
            >
              {{ $t('growth.reply') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 扁平化渲染所有子评论 -->
    <template v-if="comment.children?.length">
      <!-- 第4级及以上显示折叠按钮 -->
      <div v-if="level >= 3 && !expanded" class="pl-10 py-1">
        <button 
          class="text-xs text-[#FF9900] hover:text-[#E68A00] flex items-center gap-1"
          @click="expanded = true"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          {{ $t('growth.expandReplies', { count: getTotalChildrenCount(comment) }) }}
        </button>
      </div>
      
      <!-- 子评论列表 -->
      <template v-if="level < 3 || expanded">
        <CommentItem
          v-for="child in comment.children"
          :key="child.id"
          :comment="child"
          :reply-to-name="comment.author"
          :level="level + 1"
          :is-nested="true"
          :replying-to-id="replyingToId"
          :reply-content="replyContent"
          :submitting="submitting"
          @like="$emit('like', $event)"
          @reply="$emit('reply', $event)"
          @delete="$emit('delete', $event)"
          @cancel-reply="$emit('cancelReply')"
          @submit-reply="$emit('submitReply')"
          @update:reply-content="$emit('update:replyContent', $event)"
        />
      </template>
      
      <!-- 收起按钮 - 只在第3级显示 -->
      <div v-if="level === 3 && expanded" class="pl-10 py-1">
        <button 
          class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          @click="expanded = false"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
          {{ $t('growth.collapse') }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import dianzhanIcon from '~/assets/images/dianzhan.png'
import dianzhanActiveIcon from '~/assets/images/dianzhan_yes.png' // TODO: 替换为高亮图片
import pinlunIcon from '~/assets/images/pinlun.png'

interface Comment {
  id: number
  author: string
  avatar?: string
  content: string
  date: string
  likes: number
  children?: Comment[]
  isMine?: boolean
  isLiked?: boolean
}

const props = withDefaults(defineProps<{
  comment: Comment
  replyToName?: string
  level?: number
  isNested?: boolean
  replyingToId?: number | null
  replyContent?: string
  submitting?: boolean
}>(), {
  level: 1,
  replyToName: '',
  isNested: false
})

defineEmits<{
  like: [comment: Comment]
  reply: [comment: Comment]
  delete: [comment: Comment]
  cancelReply: []
  submitReply: []
  'update:replyContent': [value: string]
}>()

// 折叠状态
const expanded = ref(false)

// 递归计算所有子评论数量
const getTotalChildrenCount = (comment: Comment): number => {
  let count = comment.children?.length || 0
  if (comment.children) {
    for (const child of comment.children) {
      count += getTotalChildrenCount(child)
    }
  }
  return count
}
</script>
