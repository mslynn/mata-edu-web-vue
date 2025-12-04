<template>
  <div class="flex justify-start gap-20 mt-8 pt-9 text-lg">
    <button 
      @click="$emit('classcode-login')"
      class="flex items-center gap-2 bg-transparent border-none text-gray-400 text-sm cursor-pointer transition-colors hover:text-[#e8a063]"
    >
      <img src="~/assets/images/classcode.png" alt="班级码" class="w-6 h-6 " />
      <span>班级码登录</span>
    </button>
    <button 
      @click="$emit('apply-account')"
      class="flex items-center gap-2 bg-transparent border-none text-gray-400 text-sm cursor-pointer transition-colors hover:text-[#e8a063]"
    >
      <img src="~/assets/images/apply.png" alt="申请" class="w-6 h-6 " />
      <span>申请体验账号</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  'classcode-login': []
  'apply-account': []
}>()
</script>

