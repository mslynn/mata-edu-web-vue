

<template>
  <div class="h-full flex flex-col bg-white overflow-hidden">
    <!-- Row 1: Breadcrumb & Custom Exercise Button (White Background) -->
    <div class="pl-[6%] pr-[5%] py-4 flex items-center justify-between">
      <div class="flex items-center text-sm text-gray-500">
        <span class="hover:text-gray-700 transition-colors cursor-pointer"   @click="goHome">{{ $t('nav.home') }}</span>
        <span class="mx-2 text-gray-400">&gt;</span>
        <span class="text-gray-900 font-medium">{{ $t('taskManagement.title') }}</span>
      </div>
      <MButton type="primary" class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] shadow-md shadow-orange-500/20 active:scale-95 transition-all" @click="handleCustomTask">
        {{ $t('taskManagement.customExercise') }}
      </MButton>
    </div>

    <!-- Row 2: Pending Review Cards (Separate Background Block) -->
    <div v-if="pendingReviewTasks.length > 0" class="mx-[6%] mr-[5%] mb-3 bg-[#e3ebf3]/60 rounded-xl px-5 py-4">
      <div class="flex flex-wrap gap-3">
        <div 
          v-for="(task, index) in pendingReviewTasks" 
          :key="index"
          class="bg-white rounded-lg px-4 py-3 cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
          @click="selectedPendingIndex = index"
        >
          <!-- 待批改标签 - 右上角斜角 -->
          <div class="absolute -right-6 -top-1 bg-[#FF9900] text-white text-xs px-8 py-1 rotate-[30deg] origin-center">
            {{ $t('taskManagement.pendingReview') }}
          </div>
          
          <div class="pr-12">
            <span class="text-gray-800 font-medium text-base block">{{ task.className }}</span>
            <span class="text-sm text-gray-400 mt-1 block">{{ task.taskName }}</span>
          </div>
          
          <!-- 选中时底部的主题色线条 -->
          <div 
            v-if="selectedPendingIndex === index" 
            class="absolute bottom-0 left-4 right-4 h-1 bg-[#FF9900] rounded-full"
          ></div>
        </div>
      </div>
    </div>

    <!-- Row 3: Filters & Main Content (Separate Background Block) -->
    <div class="flex-1 flex flex-col overflow-hidden mx-[6%] mr-[5%] mb-4 bg-[#e3ebf3]/60 rounded-xl">
      <!-- Filters Row -->
      <div class="px-5 py-4 relative z-50">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-600">{{ $t('class.className') }}</span>
            <MSelect 
              v-model="filters.class" 
              :options="classOptions" 
              class="w-[200px]"
              placeholder="请选择班级"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-600">{{ $t('course.courseName') }}</span>
            <MSelect 
              v-model="filters.course" 
              :options="courseOptions" 
              class="w-[200px]"
              placeholder="请选择课程"
            />
          </div>
          <div class="flex items-center gap-2">
            <MSelect 
              v-model="filters.topic" 
              :options="topicOptions" 
              class="w-[240px]"
              placeholder="主题12-噪声检测仪"
            />
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 flex overflow-hidden px-5 pb-5 gap-5">
        <!-- Left Sidebar -->
        <div class="w-[200px] flex flex-col bg-white rounded-xl overflow-hidden shrink-0">
          <div class="p-4 border-b border-gray-100 flex flex-col gap-3">

            <!-- Custom Underline Tabs -->
            <div class="flex">
              <button 
                v-for="tab in tabs" 
                :key="tab.value"
                :class="[
                  'px-3 py-1.5 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.value 
                    ? 'text-[#FF9900] border-[#FF9900]' 
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                ]"
                @click="activeTab = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>
          
          <div class="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
             <MTree
              :data="treeData"
              node-key="id"
              label-key="label"
              :selected-key="selectedTaskKey"
              :expanded-keys="expandedKeys"
              @select="handleNodeSelect"
              @expand="handleNodeExpand"
              class="text-gray-700"
             >

             </MTree>
          </div>
        </div>

        <div class="flex-1 flex flex-col bg-white rounded-xl relative">
          <div class="flex-1 w-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <div class="min-h-full w-full">
              
              <!-- Cards Grid (Free Creation / Tools) - Only show when task not issued -->
              <div v-if="selectedTaskKey === 'free_creation' && !isTaskIssued" class="w-full min-h-full flex flex-col justify-center items-center p-8 text-center max-w-5xl mx-auto">
                  <div class="mb-8 text-gray-500 space-y-3 max-w-2xl mx-auto">
                     <div class="text-lg font-medium text-gray-700">{{ $t('taskManagement.description1') }}</div>
                     <div>{{ $t('taskManagement.description2') }}</div>
                     <div class="text-xs text-orange-500/80 bg-orange-50 py-2 px-4 rounded-full inline-block mt-4">{{ $t('taskManagement.disclaimer') }}</div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4">
                    <div 
                        v-for="(editor, index) in editorsList" 
                        :key="index"
                        class="bg-white rounded-2xl transition-all duration-300 overflow-hidden group cursor-pointer border relative"
                        :class="selectedEditor === editor.id 
                          ? 'border-[#FF9900] shadow-xl ring-4 ring-[#FF9900]/10 -translate-y-2' 
                          : 'border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-2 hover:border-gray-200'"
                        @click="selectedEditor = editor.id"
                    >
                      <div class="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 relative items-center justify-center flex group-hover:from-gray-100 group-hover:to-gray-200 transition-colors">
                         <!-- Decorative elements -->
                         <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ddd_1px,transparent_1px)] [background-size:16px_16px]"></div>
                         
                         <!-- Label text placeholder -->
                         <div class="relative z-10 flex flex-col items-center">
                            <div class="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 text-2xl font-bold text-gray-400">
                                {{ editor.name.charAt(0) }}
                            </div>
                         </div>
                      </div>
                      
                      <div class="p-4 flex flex-col items-center">
                        <h3 class="font-bold text-gray-800 text-lg mb-2 group-hover:text-[#FF9900] transition-colors">{{ editor.name }}</h3>
                        <div class="text-sm text-gray-500 mb-4 line-clamp-2 px-2 h-10">{{ editor.desc }}</div>
                        
                        <label class="flex items-center gap-3 cursor-pointer select-none">
                            <div 
                                class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                                :class="selectedEditor === editor.id ? 'border-[#FF9900] bg-[#FF9900]' : 'border-gray-300 bg-transparent group-hover:border-gray-400'"
                            >
                                <svg v-if="selectedEditor === editor.id" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <span class="font-medium transition-colors" :class="selectedEditor === editor.id ? 'text-[#FF9900]' : 'text-gray-600 group-hover:text-gray-900'">{{ $t('taskManagement.pushToStudents') }}</span>
                         </label>
                      </div>
                    </div>
                  </div>
                
                  <div class="mt-10 pb-8">
                    <MButton 
                        type="primary"
                        class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                        :class="{ '!bg-gray-200 !text-gray-400 !shadow-none !cursor-not-allowed hover:!bg-gray-200': !selectedEditor }"
                        :disabled="!selectedEditor"
                        @click="openIssueModal"
                    >
                        {{ $t('taskManagement.issueTask') }}
                    </MButton>
                  </div>
              </div>

            <!-- Task Issued View (for AI Chat) -->
            <div v-else-if="isTaskIssued" class="w-full flex-1 flex flex-col min-h-0 overflow-visible">

               <!-- Header Stats & Actions -->
               <div class="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-100 overflow-visible relative z-50">
                  <div class="flex items-center text-sm text-gray-600">
                     <span>{{ issueType === 'group' ? $t('taskManagement.currentGroupSubmitted') : $t('taskManagement.currentStudentSubmitted') }}：</span>
                     <span class="text-[#1890FF] font-medium mx-1">{{ submittedCount }}</span>
                     <span>{{ $t('taskManagement.itemUnit') }}，{{ $t('taskManagement.unsubmitted') }}：</span>
                     <span class="text-[#FF4D4F] font-medium mx-1">{{ unsubmittedCount }}</span>
                     <span>{{ $t('taskManagement.itemUnit') }}</span>
                  </div>

                  <div class="flex items-center gap-3">
                     <!-- Custom Exercise Actions -->
                     <template v-if="isCustomExercise">
                         <!-- Batch Mode: Only show Cancel button -->
                         <template v-if="isBatchMode">
                            <MButton 
                               class="!bg-white !text-[#FF4D4F] !border-[#FF4D4F] hover:!bg-red-50 px-4 py-1.5 h-9 shadow-sm"
                               @click="exitBatchMode"
                            >
                               {{ $t('user.cancelBatchOperation') }}
                            </MButton>
                         </template>

                         <!-- Normal Mode: Show all buttons -->
                         <template v-else>
                            <!-- Answer Analysis Toggle -->
                            <div class="flex items-center gap-2 text-sm text-gray-600 relative group">
                               <span>{{ $t('taskManagement.answerAnalysis') }}</span>
                               <button 
                                  @click="toggleAnswerAnalysis"
                                  class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
                                  :class="answerAnalysisEnabled ? 'bg-[#FF9900]' : 'bg-gray-300'"
                               >
                                  <span 
                                     class="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200"
                                     :class="answerAnalysisEnabled ? 'left-6' : 'left-1'"
                                  ></span>
                               </button>
                               <!-- Tooltip -->
                               <div class="absolute top-full left-0 mt-2 z-[9999] hidden group-hover:block pointer-events-none">
                                  <div class="bg-black/90 text-white text-sm px-4 py-2.5 rounded-md shadow-lg relative text-center whitespace-nowrap">
                                     <!-- Arrow -->
                                     <div class="absolute -top-1 left-16 w-2 h-2 bg-black/90 rotate-45"></div>
                                     {{ $t('taskManagement.answerAnalysisTip') }}
                                  </div>
                               </div>
                            </div>

                            <!-- View Details -->
                            <MButton 
                               type="primary" 
                               class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] px-4 py-1.5 h-9 shadow-sm"
                               @click="console.log('View details')"
                            >
                               {{ $t('taskManagement.viewTaskFileDetails') }}
                            </MButton>

                            <!-- Withdraw -->
                            <MButton 
                               class="!bg-white !text-[#FF4D4F] !border-gray-200 hover:!bg-red-50 hover:!border-red-200 px-4 py-1.5 h-9 shadow-sm"
                               @click="showWithdrawModal = true"
                            >
                               {{ $t('taskManagement.withdrawTask') }}
                            </MButton>

                            <!-- Batch Operation -->
                            <MButton 
                               class="!bg-white !text-gray-600 !border-gray-200 hover:!bg-gray-50 px-4 py-1.5 h-9 shadow-sm"
                               @click="enterBatchMode"
                            >
                               {{ $t('taskManagement.batchOperation') }}
                            </MButton>
                            
                            <!-- Refresh Button with Tooltip -->
                            <div class="relative group">
                              <MButton 
                                 class="!bg-white !text-[#FF9900] !border-gray-200 hover:!bg-orange-50 hover:!border-[#FF9900] px-4 py-1.5 h-9 shadow-sm"
                                 @click="console.log('Refresh')"
                              >
                                 {{ $t('taskManagement.refreshList') }}
                              </MButton>
                              <!-- Tooltip -->
                              <div class="absolute top-full right-0 mt-2 z-[9999] hidden group-hover:block pointer-events-none">
                                 <div class="bg-black/90 text-white text-sm px-4 py-2.5 rounded-md shadow-lg relative text-center whitespace-nowrap">
                                    <!-- Arrow -->
                                    <div class="absolute -top-1 right-8 w-2 h-2 bg-black/90 rotate-45"></div>
                                    {{ $t('taskManagement.refreshTip') }}
                                 </div>
                              </div>
                            </div>
                         </template>
                     </template>

                     <!-- Upload Task Actions: View Details, Withdraw, Refresh -->
                     <template v-else-if="isUploadTask">
                         <!-- View Details -->
                         <MButton 
                            type="primary" 
                            class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] px-4 py-1.5 h-9 shadow-sm"
                            @click="console.log('View details')"
                         >
                            {{ $t('taskManagement.viewTaskFileDetails') }}
                         </MButton>

                         <!-- Withdraw -->
                         <MButton 
                            class="!bg-white !text-[#FF4D4F] !border-gray-200 hover:!bg-red-50 hover:!border-red-200 px-4 py-1.5 h-9 shadow-sm"
                            @click="showWithdrawModal = true"
                         >
                            {{ $t('taskManagement.withdrawTask') }}
                         </MButton>
                         
                         <!-- Refresh Button with Tooltip -->
                         <div class="relative group">
                           <button class="px-4 py-1.5 h-9 bg-white text-[#FF9900] border border-gray-200 text-sm rounded-md hover:bg-orange-50 hover:border-[#FF9900] transition-colors font-medium shadow-sm">
                              {{ $t('taskManagement.refreshList') }}
                           </button>
                           <!-- Tooltip -->
                           <div class="absolute top-full right-0 mt-2 z-50 hidden group-hover:block w-max max-w-[200px] whitespace-normal text-center">
                              <div class="bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-md shadow-lg relative">
                                 <!-- Arrow - positioned to right -->
                                 <div class="absolute -top-1 right-6 w-2 h-2 bg-black/80 rotate-45"></div>
                                 {{ $t('taskManagement.refreshTip') }}
                              </div>
                           </div>
                         </div>
                     </template>

                     <!-- Training Task Actions: Badge, Refresh, More Actions -->
                     <template v-else>
                         <!-- QA Assistant Status -->
                         <div class="px-3 py-1.5 bg-gray-50 text-gray-400 text-sm rounded-md border border-gray-200 flex items-center gap-2 cursor-not-allowed select-none h-9">
                            <span class="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">AI</span>
                            {{ $t('taskManagement.qaPushed') }}
                         </div>
                         
                         <!-- Refresh Button with Tooltip -->
                         <div class="relative group">
                           <button class="px-4 py-1.5 h-9 bg-white text-[#FF9900] border border-gray-200 text-sm rounded-md hover:bg-orange-50 hover:border-[#FF9900] transition-colors font-medium shadow-sm">
                              {{ $t('taskManagement.refreshList') }}
                           </button>
                           <!-- Tooltip -->
                           <div class="absolute top-full right-0 mt-2 z-50 hidden group-hover:block w-max max-w-[200px] whitespace-normal text-center">
                              <div class="bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-md shadow-lg relative">
                                 <!-- Arrow - positioned to right -->
                                 <div class="absolute -top-1 right-6 w-2 h-2 bg-black/80 rotate-45"></div>
                                 {{ $t('taskManagement.refreshTip') }}
                              </div>
                           </div>
                         </div>
                         
                         <!-- More Actions Dropdown -->
                         <div class="w-[105px]">
                           <MSelect
                             v-model="moreActionValue"
                             :options="moreActionOptions"
                             :placeholder="$t('taskManagement.moreActions')"
                             trigger="hover"
                             placement="bottom-center"
                             dropdown-class="w-[160px]"
                             @update:model-value="handleMoreAction"
                           />
                         </div>
                     </template>
                  </div>
               </div>

               <!-- Table -->
               <div class="flex-1 flex flex-col min-h-0 bg-white">
                  <!-- Blue Hint Bar for Upload Tasks -->
                  <div v-if="isUploadTask && isTaskIssued" class="mx-6 mt-4 px-4 py-2.5 bg-[#E6F7FF] border border-[#91D5FF] rounded-md flex items-center gap-2">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-[#1890FF] shrink-0">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                     </svg>
                     <span class="text-sm text-[#1890FF]">{{ $t('taskManagement.uploadTaskHint') }}</span>
                  </div>

                  <div class="flex-1 px-6 py-4 overflow-auto">
                     <MTable 
                        :columns="currentColumns" 
                        :data="groupTaskData" 
                        class="rounded-lg overflow-hidden border border-gray-100"
                        :show-index="true"
                        :selectable="isBatchMode && isCustomExercise"
                        :selected-keys="selectedRowKeys"
                        @select="handleTableSelect"
                        @select-all="handleTableSelectAll"
                     >
                     <!-- Custom Header for Submission Status Filter -->
                     <template #header-submissionStatus="{ column }">
                        <MFilterPopover v-model="submissionFilter" :options="submissionFilterOptions">
                           <template #trigger>
                              <div class="flex items-center justify-center gap-1 cursor-pointer hover:text-[#FF9900] transition-colors">
                                 {{ column.title }}
                                 <svg 
                                    width="10" height="6" viewBox="0 0 10 6" fill="none" 
                                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                                    class="transition-transform duration-200 group-hover:rotate-180"
                                 >
                                    <path d="M1 1l4 4 4-4"/>
                                 </svg>
                              </div>
                           </template>
                        </MFilterPopover>
                     </template>

                     <!-- Custom Header for Grade with Tooltip -->
                     <template #header-grade="{ column }">
                        <div class="relative group flex items-center justify-center gap-1">
                           <span>{{ column.title }}</span>
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" class="cursor-help">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                              <line x1="12" y1="17" x2="12.01" y2="17"/>
                           </svg>
                           <!-- Grade Tooltip -->
                           <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 hidden group-hover:block">
                              <div class="bg-black/90 text-white text-xs px-4 py-3 rounded-md shadow-lg relative text-center w-[280px]">
                                 <!-- Arrow -->
                                 <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45"></div>
                                 <div class="mb-2 leading-relaxed">{{ $t('taskManagement.gradeTooltipTitle') }}</div>
                                 <div class="space-y-0.5 text-gray-300">
                                    <div>[0%-17%] [0-1/6] 0.5颗</div>
                                    <div>[17%-34%] [1/6-1/3] 1颗</div>
                                    <div>[34%-50%] [1/3-1/2] 1.5颗</div>
                                    <div>[50%-67%] [1/2-2/3] 2颗</div>
                                    <div>[67%-84%] [2/3-5/6] 2.5颗</div>
                                    <div>[84%-100%] [5/6-1] 3颗</div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </template>

                     <!-- Custom Cell for Submission Status -->
                     <template #cell-submissionStatus="{ row }">
                        <span 
                           class="px-2 py-1 rounded text-xs"
                           :class="row.submissionStatus === 'submitted' 
                              ? 'bg-[#E6F7FF] text-[#1890FF]' 
                              : 'bg-[#FFF1F0] text-[#FF4D4F]'"
                        >
                           {{ row.submissionStatus === 'submitted' ? $t('taskManagement.submitted') : $t('taskManagement.unsubmitted') }}
                        </span>
                     </template>

                     <!-- Custom Cell for Score/Total -->
                     <template #cell-scoreTotal="{ row }">
                        <span class="text-sm text-gray-600">{{ row.scoreTotal || '-' }}</span>
                     </template>

                     <!-- Custom Cell for Grade (Star Rating) -->
                     <template #cell-grade="{ row }">
                        <StarRating 
                           :model-value="row.grade || 0" 
                           :size="16" 
                           wrapper-class="justify-center"
                           readonly
                        />
                     </template>

                     <!-- Custom Cell for Teacher Score (Star Rating) -->
                     <template #cell-teacherScore="{ row }">
                        <StarRating 
                           v-if="row.teacherScore !== undefined && row.teacherScore !== null"
                           :model-value="row.teacherScore" 
                           :size="20" 
                           wrapper-class="justify-center"
                           readonly
                        />
                        <span v-else class="text-gray-400">-</span>
                     </template>

                     <!-- Custom Cell for Actions -->
                     <template #cell-action="{ row }">
                        <div class="flex items-center justify-center gap-2">
                           <!-- Custom Exercise: 查看 + 打回重做 -->
                           <template v-if="isCustomExercise && row.submissionStatus === 'submitted'">
                              <button 
                                 class="px-3 py-1 text-xs text-[#FF9900] border border-[#FF9900] rounded hover:bg-[#FFF7E6] transition-colors"
                                 @click="handleViewAndGrade(row)"
                              >
                                 {{ $t('taskManagement.view') }}
                              </button>
                              <button 
                                 class="px-3 py-1 text-xs text-[#FF9900] border border-[#FF9900] rounded hover:bg-[#FFF7E6] transition-colors"
                                 @click="handleReturnToRedo(row)"
                              >
                                 {{ $t('taskManagement.returnToRedo') }}
                              </button>
                           </template>
                           <!-- Free Coding: 查看并评分 -->
                           <template v-else-if="isFreeCoding && row.submissionStatus === 'submitted'">
                              <button 
                                 class="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                 @click="handleViewAndScore(row)"
                              >
                                 {{ $t('taskManagement.viewAndScore') }}
                              </button>
                           </template>
                        </div>
                     </template>

                     <template #empty>
                        <div class="flex flex-col items-center justify-center py-20">
                           <!-- Empty State Icon matching screenshot -->
                           <div class="w-24 h-24 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full flex items-center justify-center mb-4 relative">
                              <!-- Document with magnifier icon -->
                              <svg width="56" height="56" viewBox="0 0 64 64" fill="none" class="text-[#91D5FF]">
                                 <!-- Document base -->
                                 <rect x="12" y="8" width="32" height="40" rx="4" fill="#E6F7FF" stroke="#91D5FF" stroke-width="2"/>
                                 <!-- Document lines -->
                                 <path d="M20 18h16M20 26h12M20 34h8" stroke="#91D5FF" stroke-width="2" stroke-linecap="round"/>
                                 <!-- Magnifier circle -->
                                 <circle cx="44" cy="44" r="12" fill="#E6F7FF" stroke="#91D5FF" stroke-width="2"/>
                                 <!-- Magnifier handle -->
                                 <path d="M52 52l6 6" stroke="#91D5FF" stroke-width="3" stroke-linecap="round"/>
                                 <!-- Check mark in magnifier -->
                                 <path d="M39 44l3 3 6-6" stroke="#69C0FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>
                           </div>
                           <div class="text-gray-400 text-sm">{{ $t('common.noData') }}</div>
                        </div>
                     </template>
                  </MTable>
                  </div>

                  <!-- Batch Operation Footer Bar -->
                  <div v-if="isBatchMode && isCustomExercise" class="shrink-0 border-t border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
                     <div class="flex items-center gap-4">
                        <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                           <div 
                              class="w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors"
                              :class="isAllSelected ? 'bg-[#FF9900] border-[#FF9900]' : 'border-gray-300 bg-white'"
                              @click="handleSelectAllCheckbox"
                           >
                              <svg v-if="isAllSelected" width="10" height="8" viewBox="0 0 10 8" fill="none">
                                 <path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>
                           </div>
                           {{ $t('class.selectAll') }}
                        </label>
                        <span class="text-sm text-gray-500">
                           {{ $t('taskManagement.selectedCount', { count: selectedRowKeys.length }) }}
                        </span>
                     </div>
                     <div class="flex items-center gap-3">
                        <button 
                           class="flex items-center gap-1.5 px-4 py-1.5 text-sm text-[#FF9900] hover:text-[#e68a00] transition-colors"
                           @click="handleBatchReturnToRedo"
                        >
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                              <path d="M3 3v5h5"/>
                           </svg>
                           {{ $t('taskManagement.batchReturnToRedo') }}
                        </button>
                        <button 
                           class="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                           @click="exitBatchMode"
                        >
                           {{ $t('user.cancelBatchOperation') }}
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            <!-- Empty State for AI Chat Model (Task Not Issued) -->
            <div v-else class="flex-1 flex flex-col items-center justify-center w-full h-full pb-20 max-w-5xl mx-auto text-center">
              <div class="w-64 h-64 bg-blue-50/50 rounded-full flex items-center justify-center mb-8 relative">
                 <div class="absolute inset-0 bg-blue-100/30 rounded-full animate-pulse"></div>
                 <!-- Placeholder Icon similar to screenshot -->
                 <Transition name="icon-fade" mode="out-in">
                   <svg :key="selectedTaskKey" width="120" height="120" viewBox="0 0 24 24" fill="none" class="text-blue-300 relative z-10">
                      <rect x="4" y="3" width="16" height="18" rx="2" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
                      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      <circle cx="16" cy="16" r="6" fill="#EEF2FF" stroke="currentColor" stroke-width="1.5"/>
                      <path d="M14.5 15l1 1 2.5-2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                   </svg>
                 </Transition>
              </div>
              
              <h2 class="text-xl font-bold text-gray-800 mb-3">{{ $t('taskManagement.taskNotIssued') }}</h2>
              <p class="text-gray-500 text-sm max-w-md mx-auto mb-10 leading-relaxed">
                  {{ $t('taskManagement.taskNotIssuedDesc') }}
              </p>
              
              <div class="flex items-center gap-6">
                 <MButton 
                    type="primary" 
                    class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] px-8 py-2.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                    @click="openIssueModal"
                 >
                    {{ $t('taskManagement.issueTask') }}
                 </MButton>
                 
                 <MButton 
                    class="!bg-white !text-gray-600 border !border-gray-200 hover:!bg-gray-50 px-8 py-2.5 shadow-sm active:scale-95 transition-all"
                 >
                    {{ $t('taskManagement.viewDetails') }}
                 </MButton>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <TaskIssueModal
       v-model="showIssueModal"
       :class-name="filters.class"
       :task-name="currentTaskLabel"
       :has-ai-settings="!isUploadTask && !isCustomExercise"
       :is-free-coding="isFreeCoding"
       :editor-name="selectedEditor"
       @confirm-group="handleIssueGroup"
       @confirm-student="handleIssueStudent"
    />

    <TaskWithdrawModal
       v-model="showWithdrawModal"
       @confirm="handleWithdrawConfirm"
    />

    <ViewAndScoreModal
       :visible="showViewScoreModal"
       :row-data="currentScoreRow"
       :has-next-submission="hasNextSubmission"
       @close="showViewScoreModal = false"
       @save="handleScoreSave"
       @next="handleScoreNext"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const router = useRouter()

// --- Filter Data & State ---
const filters = ref({
  class: '1年级1111111',
  course: 'AI上全能助手',
  topic: 'topic1'
})

const classOptions = [
  { label: '1年级1111111', value: '1年级1111111' },
  { label: '12年级333', value: '12年级333' },
  { label: '11年级222', value: '11年级222' }
]

const courseOptions = [
  { label: 'AI上全能助手', value: 'AI上全能助手' },
  { label: 'Python基础', value: 'Python基础' }
]

const topicOptions = [
  { label: '主题12-噪声检测仪', value: 'topic1' },
  { label: '主题13-智能台灯', value: 'topic2' }
]

// --- Sidebar Data & State ---
const activeTab = ref('tasks')
const tabs = computed(() => [
  { label: t('taskManagement.courseTasks'), value: 'tasks' },
  { label: t('taskManagement.courseAssessment'), value: 'assessment' }
])

const selectedTaskKey = ref('ai_chat')
const expandedKeys = ref<(string | number)[]>(['personal_training', 'personal_upload', 'custom_exercise', 'free_code'])

const treeData = computed(() => [
  {
    id: 'personal_training',
    label: t('taskManagement.personalTraining'),
    children: [
      { id: 'ai_chat', label: t('taskManagement.aiChat') },
      { id: 'cluster_analysis', label: t('taskManagement.clusterAnalysis') }
    ]
  },
  {
    id: 'personal_upload',
    label: t('classroom.personalUploadTask'),
    children: [
      { id: 'smart_supermarket', label: '智慧超市（完整版）' },
      { id: 'unnamed', label: '未命名' }
    ]
  },
  {
    id: 'custom_exercise',
    label: t('taskManagement.customExercise'),
    children: [
      { id: 'today_shortcuts', label: '今天学习的几个快捷键' },
      { id: 'three_people', label: '三人四' },  
      { id: 'three_people2', label: '三人三2' },
 
    ]
  },
  {
    id: 'free_code',
    label: t('taskManagement.freeCoding'),
    children: [
      { id: 'free_creation', label: t('taskManagement.freeCreationTask') }
    ]
  }
])

const handleNodeSelect = (node: any) => {
  selectedTaskKey.value = node.id
}

const handleNodeExpand = (key: string | number, expanded: boolean) => {
  if (expanded) {
    if (!expandedKeys.value.includes(key)) {
       expandedKeys.value.push(key)
    }
  } else {
    expandedKeys.value = expandedKeys.value.filter(k => k !== key)
  }
}

import { ElMessage } from 'element-plus'

// --- Main Content Data & State ---
const selectedEditor = ref('ucode4')
const showIssueModal = ref(false)
// Task Status Management (Per Task)
interface TaskStatus {
  issued: boolean
  type: 'group' | 'student'
}
const taskStatusMap = ref<Record<string, TaskStatus>>({})

const isTaskIssued = computed({
  get: () => taskStatusMap.value[selectedTaskKey.value]?.issued ?? false,
  set: (val) => {
    if (!taskStatusMap.value[selectedTaskKey.value]) {
       taskStatusMap.value[selectedTaskKey.value] = { issued: false, type: 'group' }
    }
    taskStatusMap.value[selectedTaskKey.value]!.issued = val
  }
})

const editorsList = computed(() => [
  { id: 'ucode4', name: 'uCode4', desc: 'AI编程教育' },
  { id: 'python', name: 'uPython', desc: 'Python编程' },
  { id: 'ucode', name: 'uCode', desc: 'uCode' }
])

const handleCustomTask = () => {
  router.push('/taskmanagement/custom-exercise')
}

// Helper to find label by key in treeData
const findLabel = (nodes: any[], key: string | number): string => {
  for (const node of nodes) {
    if (node.id === key) return node.label
    if (node.children) {
      const found = findLabel(node.children, key)
      if (found) return found
    }
  }
  return ''
}

const currentTaskLabel = computed(() => {
  return findLabel(treeData.value, selectedTaskKey.value)
})

const openIssueModal = () => {
  showIssueModal.value = true
}

const handleIssueGroup = () => {
  issueType.value = 'group'
  isTaskIssued.value = true
  ElMessage.success(t('taskManagement.taskIssuedSuccess') || t('taskManagement.issueSuccess'))
  showIssueModal.value = false
}

const handleIssueStudent = () => {
  issueType.value = 'student'
  isTaskIssued.value = true
  ElMessage.success(t('taskManagement.taskIssuedSuccess') || t('taskManagement.issueSuccess'))
  showIssueModal.value = false
}

// Group Task Columns matching the screenshot
const groupTaskColumns = computed(() => [
  { key: 'groupName', title: t('taskManagement.groupName'), align: 'center' as const, width: '150px' },
  { key: 'leader', title: t('taskManagement.leader'), align: 'center' as const, width: '100px' },
  { key: 'members', title: t('taskManagement.members'), align: 'center' as const, width: '150px' },
  { key: 'submissionStatus', title: t('taskManagement.submissionStatus'), align: 'center' as const, width: '120px' },
  { key: 'duration', title: t('taskManagement.durationMinutes'), align: 'center' as const, width: '120px' },
  { key: 'submissionTime', title: t('taskManagement.submissionTime'), align: 'center' as const, width: '150px' },
  { key: 'qaStatus', title: t('taskManagement.qaPushStatus'), align: 'center' as const, width: '130px' },
  { key: 'action', title: t('common.operation'), align: 'center' as const, width: '100px' }
])

// Student Task Columns
const studentTaskColumns = computed(() => [
  { key: 'studentName', title: t('taskManagement.studentName'), align: 'center' as const, width: '150px' },
  { key: 'studentAccount', title: t('taskManagement.studentAccount'), align: 'center' as const, width: '150px' },
  { key: 'submissionStatus', title: t('taskManagement.submissionStatus'), align: 'center' as const, width: '120px' },
  { key: 'duration', title: t('taskManagement.durationMinutes'), align: 'center' as const, width: '120px' },
  { key: 'submissionTime', title: t('taskManagement.submissionTime'), align: 'center' as const, width: '150px' },
  { key: 'qaStatus', title: t('taskManagement.qaPushStatus'), align: 'center' as const, width: '130px' },
  { key: 'action', title: t('common.operation'), align: 'center' as const, width: '100px' }
])

// Student Task Columns for Custom Exercise (matching screenshot)
const customExerciseColumns = computed(() => [
  { key: 'studentName', title: t('taskManagement.studentName'), align: 'center' as const, width: '120px' },
  { key: 'studentAccount', title: t('taskManagement.studentAccount'), align: 'center' as const, width: '150px' },
  { key: 'submissionStatus', title: t('taskManagement.submissionStatus'), align: 'center' as const, width: '100px' },
  { key: 'scoreTotal', title: t('taskManagement.scoreTotal'), align: 'center' as const, width: '100px' },
  { key: 'duration', title: t('taskManagement.durationMinutes'), align: 'center' as const, width: '120px' },
  { key: 'submissionTime', title: t('taskManagement.submissionTime'), align: 'center' as const, width: '150px' },
  { key: 'grade', title: t('taskManagement.grade'), align: 'center' as const, width: '120px' },
  { key: 'action', title: t('common.operation'), align: 'center' as const, width: '180px' }
])

// Upload Task Columns for Student (Personal Upload / Free Coding)
const uploadTaskStudentColumns = computed(() => [
  { key: 'studentName', title: t('taskManagement.studentName'), align: 'center' as const, width: '120px' },
  { key: 'studentAccount', title: t('taskManagement.studentAccount'), align: 'center' as const, width: '150px' },
  { key: 'submissionStatus', title: t('taskManagement.submissionStatus'), align: 'center' as const, width: '100px' },
  { key: 'duration', title: t('taskManagement.durationMinutes'), align: 'center' as const, width: '100px' },
  { key: 'submissionTime', title: t('taskManagement.submissionTime'), align: 'center' as const, width: '160px' },
  { key: 'teacherScore', title: t('taskManagement.teacherScore'), align: 'center' as const, width: '160px' },
  { key: 'action', title: t('common.operation'), align: 'center' as const, width: '120px' }
])

// Upload Task Columns for Group (Personal Upload / Free Coding)
const uploadTaskGroupColumns = computed(() => [
  { key: 'groupName', title: t('taskManagement.groupName'), align: 'center' as const, width: '150px' },
  { key: 'submissionStatus', title: t('taskManagement.submissionStatus'), align: 'center' as const, width: '100px' },
  { key: 'duration', title: t('taskManagement.durationMinutes'), align: 'center' as const, width: '100px' },
  { key: 'submissionTime', title: t('taskManagement.submissionTime'), align: 'center' as const, width: '160px' },
  { key: 'teacherScore', title: t('taskManagement.teacherScore'), align: 'center' as const, width: '160px' },
  { key: 'action', title: t('common.operation'), align: 'center' as const, width: '120px' }
])

// Check if current task is a custom exercise
const isCustomExercise = computed(() => {
  // Check if selected key is under custom_exercise parent
  const customExerciseNode = treeData.value.find(node => node.id === 'custom_exercise')
  if (customExerciseNode && customExerciseNode.children) {
    return customExerciseNode.children.some(child => child.id === selectedTaskKey.value)
  }
  return false
})

// Check if current task is upload task (Personal Upload / Free Coding)
const isUploadTask = computed(() => [
  'smart_supermarket', 'unnamed', 'free_creation'
].includes(selectedTaskKey.value))

// Check if current task is free coding
const isFreeCoding = computed(() => selectedTaskKey.value === 'free_creation')

const issueType = computed({
  get: () => taskStatusMap.value[selectedTaskKey.value]?.type ?? 'group',
  set: (val: 'group' | 'student') => {
    if (!taskStatusMap.value[selectedTaskKey.value]) {
       taskStatusMap.value[selectedTaskKey.value] = { issued: false, type: val }
    } else {
       taskStatusMap.value[selectedTaskKey.value]!.type = val
    }
  }
})
const currentColumns = computed(() => {
  // Custom Exercise uses special columns
  if (isCustomExercise.value) {
    return customExerciseColumns.value
  }
  // Upload Task (Personal Upload / Free Coding) uses upload columns
  if (isUploadTask.value) {
    return issueType.value === 'group' ? uploadTaskGroupColumns.value : uploadTaskStudentColumns.value
  }
  const baseCols = issueType.value === 'group' ? groupTaskColumns.value : studentTaskColumns.value
  return baseCols
})

// Filter State
const submissionFilter = ref('all')
const submissionFilterOptions = computed(() => {
  const options = [
    { label: t('common.all'), value: 'all' },
    { label: t('taskManagement.submitted'), value: 'submitted' },
    { label: t('taskManagement.unsubmitted'), value: 'unsubmitted' }
  ]
  // Upload tasks have additional "resubmitted" option
  if (isUploadTask.value) {
    options.push({ label: t('taskManagement.resubmitted'), value: 'resubmitted' })
  }
  return options
})

const moreActionValue = ref('')
const moreActionOptions = computed(() => [
  { label: t('taskManagement.viewTaskFileDetails'), value: 'view' },
  { label: t('taskManagement.withdrawTask'), value: 'withdraw' }
])
const handleMoreAction = (val: string | number | null) => {
  if (val === 'view') {
    console.log('View details')
  } else if (val === 'withdraw') {
    showWithdrawModal.value = true
  }
  moreActionValue.value = ''
}

// Group Task Data (mock data for demo)
const groupTaskData = ref<any[]>([
  { id: 1, studentName: 'lynn', studentAccount: '4285lynn01', submissionStatus: 'submitted', scoreTotal: '70/100', duration: 0.96, submissionTime: '2025-12-30 11:33:33', grade: 2.5, teacherScore: 2.5, graded: false, qaStatus: 'pushed' },
  { id: 2, studentName: 'tony', studentAccount: '4285tony01', submissionStatus: 'submitted', scoreTotal: '-', duration: 1.2, submissionTime: '2025-12-30 10:20:15', grade: 3, teacherScore: 2.5, graded: false, qaStatus: 'pushed' },
  { id: 3, studentName: 'jack', studentAccount: '4285jack', submissionStatus: 'unsubmitted', scoreTotal: '-', duration: '-', submissionTime: '-', grade: 1.5, teacherScore: null, graded: false, qaStatus: 'pushed' },
  { id: 4, studentName: 'wang', studentAccount: '4285wang09', submissionStatus: 'unsubmitted', scoreTotal: '-', duration: '-', submissionTime: '-', grade: 2, teacherScore: null, graded: false, qaStatus: 'pushed' },
  { id: 5, studentName: 'tony', studentAccount: '4285tony', submissionStatus: 'unsubmitted', scoreTotal: '-', duration: '-', submissionTime: '-', grade: 0.5, teacherScore: null, graded: false, qaStatus: 'pushed' },
  { id: 6, studentName: '1', studentAccount: '4285155', submissionStatus: 'submitted', scoreTotal: '-', duration: 0.8, submissionTime: '2025-12-30 09:15:00', grade: 1, teacherScore: 2.5, graded: false, qaStatus: 'pushed' },
  { id: 7, studentName: 'jack', studentAccount: '4285jack01', submissionStatus: 'submitted', scoreTotal: '-', duration: 1.5, submissionTime: '2025-12-30 14:30:00', grade: 3, teacherScore: 3, graded: false, qaStatus: 'pushed' },
  { id: 8, studentName: '2', studentAccount: '4285237', submissionStatus: 'unsubmitted', scoreTotal: '-', duration: '-', submissionTime: '-', grade: 2.5, teacherScore: null, graded: false, qaStatus: 'pushed' },
  { id: 9, studentName: 'wang', studentAccount: '4285wang010', submissionStatus: 'unsubmitted', scoreTotal: '-', duration: '-', submissionTime: '-', grade: 1.5, teacherScore: null, graded: false, qaStatus: 'pushed' }
])

// Withdraw Modal State
const showWithdrawModal = ref(false)

// View and Score Modal State
const showViewScoreModal = ref(false)
const currentScoreRow = ref<any>(null)

// Check if there's a next submission to score
const hasNextSubmission = computed(() => {
  if (!currentScoreRow.value) return false
  const currentIndex = groupTaskData.value.findIndex(r => r.id === currentScoreRow.value?.id)
  return groupTaskData.value.slice(currentIndex + 1).some(r => r.submissionStatus === 'submitted')
})

// Answer Analysis Toggle
const answerAnalysisEnabled = ref(false)

const toggleAnswerAnalysis = () => {
  answerAnalysisEnabled.value = !answerAnalysisEnabled.value
  if (answerAnalysisEnabled.value) {
    ElMessage.success(t('taskManagement.answerAnalysisEnabled'))
  } else {
    ElMessage.success(t('taskManagement.answerAnalysisDisabled'))
  }
}

// Computed counts for submitted/unsubmitted
const submittedCount = computed(() => {
  return groupTaskData.value.filter(item => item.submissionStatus === 'submitted').length
})

const unsubmittedCount = computed(() => {
  return groupTaskData.value.filter(item => item.submissionStatus !== 'submitted').length
})

// Pending review count (submitted but not graded)
const pendingReviewCount = computed(() => {
  return groupTaskData.value.filter(item => item.submissionStatus === 'submitted' && !item.graded).length
})

// Pending review tasks list (mock data for demo)
const pendingReviewTasks = ref([
  { className: '1年级1111111', taskName: 'AI未来实验室（硬件版）/第2课 你画我猜' },
  { className: '2年级3班', taskName: 'Python基础/第5课 循环语句' }
])

// Selected pending review task index (default first one)
const selectedPendingIndex = ref(0)

const goHome  = ()=>{
  router.push('/teacher')
}
// Action handlers
const handleViewAndGrade = (row: any) => {
  console.log('View and grade:', row)
}

const handleViewAndScore = (row: any) => {
  currentScoreRow.value = row
  showViewScoreModal.value = true
}

const handleScoreSave = (data: any) => {
  console.log('Score saved:', data)
  showViewScoreModal.value = false
}

const handleScoreNext = () => {
  // Find next submitted row
  const currentIndex = groupTaskData.value.findIndex(r => r.id === currentScoreRow.value?.id)
  const nextRow = groupTaskData.value.slice(currentIndex + 1).find(r => r.submissionStatus === 'submitted')
  if (nextRow) {
    currentScoreRow.value = nextRow
  } else {
    ElMessage.info(t('taskManagement.noMoreSubmissions') || '没有更多待评分的作业了')
    showViewScoreModal.value = false
  }
}

const handleReturnToRedo = (row: any) => {
  console.log('Return to redo:', row)
}

const handleWithdrawConfirm = () => {
  isTaskIssued.value = false
  ElMessage.success(t('taskManagement.withdrawSuccess'))
}

// Batch Operation State
const isBatchMode = ref(false)
const selectedRowKeys = ref<(string | number)[]>([])

const enterBatchMode = () => {
  isBatchMode.value = true
  selectedRowKeys.value = []
}

const exitBatchMode = () => {
  isBatchMode.value = false
  selectedRowKeys.value = []
}

const isAllSelected = computed(() => {
  if (!groupTaskData.value.length) return false
  return groupTaskData.value.every(row => selectedRowKeys.value.includes(row.id))
})

const handleTableSelect = (keys: (string | number)[], rows: any[]) => {
  selectedRowKeys.value = keys
}

const handleTableSelectAll = (selected: boolean) => {
  if (selected) {
    selectedRowKeys.value = groupTaskData.value.map(row => row.id)
  } else {
    selectedRowKeys.value = []
  }
}

const handleSelectAllCheckbox = () => {
  if (isAllSelected.value) {
    selectedRowKeys.value = []
  } else {
    selectedRowKeys.value = groupTaskData.value.map(row => row.id)
  }
}

const handleBatchReturnToRedo = () => {
  if (selectedRowKeys.value.length === 0) {
    ElMessage.warning(t('taskManagement.noDataSelectedTip'))
    return
  }
  console.log('Batch return to redo:', selectedRowKeys.value)
  ElMessage.success(t('taskManagement.batchReturnSuccess'))
  exitBatchMode()
}
</script>

<style scoped>
/* Ensure the page takes full height of its container if setup in a layout */

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.3s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>