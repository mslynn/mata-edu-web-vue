<template>
  <Teleport to="body">
    <Transition name="viewer-fade">
      <div v-if="visible" class="viewer-overlay" @click.self="handleClose">
        <div class="viewer-container">
          <!-- 顶部工具栏 -->
          <div class="viewer-header">
            <div class="file-info">
              <span class="file-name">{{ fileName }}</span>
              <span class="page-info" v-if="totalPages > 0">{{ currentPage }} / {{ totalPages }}</span>
            </div>
            <div class="toolbar">
              <button class="tool-btn" @click="zoomOut" title="缩小">-</button>
              <span class="zoom-text">{{ Math.round(scale * 100) }}%</span>
              <button class="tool-btn" @click="zoomIn" title="放大">+</button>
              <div class="toolbar-divider"></div>
              <button class="tool-btn" :class="{ active: currentTool === 'laser' }" @click="setTool('laser')" title="激光笔">🔴</button>
              <button class="tool-btn" :class="{ active: currentTool === 'pen' }" @click="setTool('pen')" title="画笔">✏️</button>
              <button class="tool-btn" :class="{ active: currentTool === 'highlighter' }" @click="setTool('highlighter')" title="荧光笔">🖍️</button>
              <button class="tool-btn" @click="clearDrawing" title="清除">🗑️</button>
              <div class="toolbar-divider"></div>
              <button class="tool-btn" @click="toggleFullscreen" title="全屏">⛶</button>
              <button class="tool-btn close-btn" @click="handleClose" title="关闭">✕</button>
            </div>
          </div>

          <!-- 内容区域 -->
          <div class="viewer-content" ref="contentRef" @mousemove="handleMouseMove">
            <div v-if="loading" class="loading-state">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </div>

            <!-- PDF 渲染 -->
            <div v-else-if="fileType === 'pdf'" class="pdf-container" :style="{ transform: `scale(${scale})` }">
              <canvas ref="pdfCanvasRef"></canvas>
              <canvas ref="drawCanvasRef" class="draw-canvas" 
                @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing" @mouseleave="stopDrawing"></canvas>
            </div>

            <!-- Word 渲染 -->
            <div v-else-if="fileType === 'word'" class="word-container" :style="{ transform: `scale(${scale})` }">
              <div ref="wordContainerRef" class="word-content" v-html="wordHtml"></div>
              <canvas ref="drawCanvasRef" class="draw-canvas"
                @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing" @mouseleave="stopDrawing"></canvas>
            </div>

            <!-- 激光笔 -->
            <div v-if="currentTool === 'laser' && laserVisible" class="laser-pointer" 
              :style="{ left: laserX + 'px', top: laserY + 'px' }"></div>
          </div>

          <!-- 底部翻页 -->
          <div v-if="totalPages > 1" class="viewer-footer">
            <button class="page-btn" :disabled="currentPage <= 1" @click="prevPage">← 上一页</button>
            <button class="page-btn" :disabled="currentPage >= totalPages" @click="nextPage">下一页 →</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
  visible: boolean
  fileUrl: string
  fileName: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:visible': [value: boolean] }>()

const loading = ref(false)
const fileType = ref<'pdf' | 'word' | 'unknown'>('unknown')
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1)
const currentTool = ref<'none' | 'laser' | 'pen' | 'highlighter'>('none')
const wordHtml = ref('')

const contentRef = ref<HTMLElement | null>(null)
const pdfCanvasRef = ref<HTMLCanvasElement | null>(null)
const wordContainerRef = ref<HTMLElement | null>(null)
const drawCanvasRef = ref<HTMLCanvasElement | null>(null)

let pdfDoc: any = null
const isDrawing = ref(false)
const laserX = ref(0)
const laserY = ref(0)
const laserVisible = ref(false)
let drawCtx: CanvasRenderingContext2D | null = null

const getFileType = (url: string): 'pdf' | 'word' | 'unknown' => {
  const ext = url.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext || '')) return 'word'
  return 'unknown'
}

const loadFile = async () => {
  if (!props.fileUrl) return
  loading.value = true
  fileType.value = getFileType(props.fileUrl)
  
  try {
    if (fileType.value === 'pdf') {
      await loadPdf()
    } else if (fileType.value === 'word') {
      await loadWord()
    }
  } catch (error) {
    console.error('加载文件失败:', error)
  } finally {
    loading.value = false
  }
}

const loadPdf = async () => {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  
  const loadingTask = pdfjsLib.getDocument(props.fileUrl)
  pdfDoc = await loadingTask.promise
  totalPages.value = pdfDoc.numPages
  currentPage.value = 1
  await renderPdfPage()
}

const renderPdfPage = async () => {
  if (!pdfDoc || !pdfCanvasRef.value) return
  const page = await pdfDoc.getPage(currentPage.value)
  const viewport = page.getViewport({ scale: 1.5 })
  
  const canvas = pdfCanvasRef.value
  const context = canvas.getContext('2d')
  canvas.height = viewport.height
  canvas.width = viewport.width
  
  await page.render({ canvasContext: context, viewport }).promise
  initDrawCanvas(viewport.width, viewport.height)
}

const loadWord = async () => {
  const mammoth = await import('mammoth')
  const response = await fetch(props.fileUrl)
  const arrayBuffer = await response.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer })
  wordHtml.value = result.value
  totalPages.value = 1
  
  await nextTick()
  if (wordContainerRef.value) {
    initDrawCanvas(wordContainerRef.value.offsetWidth, wordContainerRef.value.offsetHeight)
  }
}

const initDrawCanvas = (width: number, height: number) => {
  if (!drawCanvasRef.value) return
  drawCanvasRef.value.width = width
  drawCanvasRef.value.height = height
  drawCtx = drawCanvasRef.value.getContext('2d')
}

const prevPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--
    if (fileType.value === 'pdf') await renderPdfPage()
  }
}

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    if (fileType.value === 'pdf') await renderPdfPage()
  }
}

const zoomIn = () => { if (scale.value < 2) scale.value += 0.1 }
const zoomOut = () => { if (scale.value > 0.5) scale.value -= 0.1 }

const setTool = (tool: 'laser' | 'pen' | 'highlighter') => {
  currentTool.value = currentTool.value === tool ? 'none' : tool
}

const startDrawing = (e: MouseEvent) => {
  if (currentTool.value === 'none' || currentTool.value === 'laser') return
  isDrawing.value = true
  
  if (drawCtx && drawCanvasRef.value) {
    const rect = drawCanvasRef.value.getBoundingClientRect()
    drawCtx.beginPath()
    drawCtx.moveTo((e.clientX - rect.left) / scale.value, (e.clientY - rect.top) / scale.value)
    drawCtx.strokeStyle = currentTool.value === 'pen' ? '#ff0000' : '#ffeb3b'
    drawCtx.lineWidth = currentTool.value === 'pen' ? 2 : 20
    drawCtx.globalAlpha = currentTool.value === 'pen' ? 1 : 0.4
    drawCtx.lineCap = 'round'
  }
}

const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !drawCtx || !drawCanvasRef.value) return
  const rect = drawCanvasRef.value.getBoundingClientRect()
  drawCtx.lineTo((e.clientX - rect.left) / scale.value, (e.clientY - rect.top) / scale.value)
  drawCtx.stroke()
}

const stopDrawing = () => { isDrawing.value = false }

const handleMouseMove = (e: MouseEvent) => {
  if (currentTool.value === 'laser' && contentRef.value) {
    const rect = contentRef.value.getBoundingClientRect()
    laserX.value = e.clientX - rect.left
    laserY.value = e.clientY - rect.top
    laserVisible.value = true
  }
}

const clearDrawing = () => {
  if (drawCtx && drawCanvasRef.value) {
    drawCtx.clearRect(0, 0, drawCanvasRef.value.width, drawCanvasRef.value.height)
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen()
  else document.exitFullscreen()
}

const handleClose = () => { emit('update:visible', false) }

const handleKeydown = (e: KeyboardEvent) => {
  if (!props.visible) return
  if (e.key === 'ArrowLeft') prevPage()
  else if (e.key === 'ArrowRight' || e.key === ' ') nextPage()
  else if (e.key === 'Escape') handleClose()
}

watch(() => props.visible, (val) => {
  if (val) loadFile()
  else {
    pdfDoc = null
    wordHtml.value = ''
    currentPage.value = 1
    totalPages.value = 0
    scale.value = 1
    currentTool.value = 'none'
  }
})

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.viewer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}

.file-info { display: flex; align-items: center; gap: 16px; }
.file-name { color: white; font-size: 14px; }
.page-info { color: #999; font-size: 13px; }

.toolbar { display: flex; align-items: center; gap: 8px; }

.tool-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #ccc;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.tool-btn:hover { background: #333; color: white; }
.tool-btn.active { background: #1890FF; color: white; }
.tool-btn.close-btn:hover { background: #ff4d4f; }

.toolbar-divider { width: 1px; height: 24px; background: #444; margin: 0 8px; }
.zoom-text { color: #999; font-size: 12px; min-width: 40px; text-align: center; }

.viewer-content {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
}

.loading-state { display: flex; flex-direction: column; align-items: center; gap: 12px; color: white; }

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333;
  border-top-color: #1890FF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.pdf-container, .word-container {
  position: relative;
  transform-origin: center center;
  transition: transform 0.2s;
}

.word-content {
  background: white;
  padding: 40px 60px;
  min-width: 800px;
  max-width: 900px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.draw-canvas { position: absolute; top: 0; left: 0; cursor: crosshair; }

.laser-pointer {
  position: absolute;
  width: 16px;
  height: 16px;
  background: radial-gradient(circle, #ff0000 0%, rgba(255, 0, 0, 0.3) 50%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
}

.viewer-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 16px;
  background: #1a1a1a;
  border-top: 1px solid #333;
}

.page-btn {
  padding: 10px 24px;
  background: #333;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) { background: #1890FF; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.viewer-fade-enter-active, .viewer-fade-leave-active { transition: opacity 0.3s ease; }
.viewer-fade-enter-from, .viewer-fade-leave-to { opacity: 0; }
</style>
