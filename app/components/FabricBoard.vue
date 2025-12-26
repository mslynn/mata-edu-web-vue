<template>
  <div class="fabric-board" ref="containerRef">
    <!-- 工具栏收起按钮 -->
    <button class="toolbar-toggle" :class="{ collapsed: toolbarCollapsed }" @click="toolbarCollapsed = !toolbarCollapsed">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path :d="toolbarCollapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'"/>
      </svg>
    </button>
    <div class="board-toolbar-left" :class="{ collapsed: toolbarCollapsed }">
      <button class="tool-btn" :class="{ active: currentTool === 'select' }" @click="setTool('select')" title="选择">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
        </svg>
      </button>
      <button class="tool-btn" :class="{ active: currentTool === 'pan' }" @click="setTool('pan')" title="拖拽平移">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
        </svg>
      </button>
      <button class="tool-btn" :class="{ active: currentTool === 'pen' }" @click="setTool('pen')" title="画笔">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
        </svg>
      </button>
      <button class="tool-btn" :class="{ active: currentTool === 'text' }" @click="setTool('text')" title="文字">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
        </svg>
      </button>
      <button class="tool-btn" :class="{ active: currentTool === 'rect' }" @click="setTool('rect')" title="矩形">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        </svg>
      </button>
      <button class="tool-btn" :class="{ active: currentTool === 'circle' }" @click="setTool('circle')" title="圆形">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      </button>
      <button class="tool-btn" :class="{ active: currentTool === 'line' }" @click="setTool('line')" title="直线">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="19" x2="19" y2="5"/>
        </svg>
      </button>
      <button class="tool-btn" :class="{ active: currentTool === 'eraser' }" @click="setTool('eraser')" title="橡皮擦">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L13.4 2.8c.8-.8 2-.8 2.8 0L21 7.6c.8.8.8 2 0 2.8L11 20"/>
        </svg>
      </button>
      <button class="tool-btn" :class="{ active: currentTool === 'laser' }" @click="setTool('laser')" title="激光笔">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" fill="#FF0000"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/>
          <path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/>
        </svg>
      </button>
      <div class="tool-divider"></div>
      <button class="tool-btn" @click="showColorPicker = !showColorPicker" title="颜色">
        <span class="color-indicator" :style="{ background: strokeColor }"></span>
      </button>
      <button class="tool-btn" @click="clearBoard" title="清空">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
      <div v-if="showColorPicker" class="color-picker-popup">
        <button v-for="c in colors" :key="c" class="color-option" :class="{ active: strokeColor === c }" 
          :style="{ background: c }" @click="strokeColor = c; showColorPicker = false"></button>
      </div>
    </div>
    <!-- 激光笔光点 -->
    <div v-if="currentTool === 'laser' && laserPos.visible" class="laser-dot" :style="{ left: laserPos.x + 'px', top: laserPos.y + 'px' }"></div>
    <div class="canvas-wrapper" :class="{ 'toolbar-collapsed': toolbarCollapsed }"><canvas ref="canvasEl"></canvas></div>
    <div class="board-bottom-bar" :class="{ 'toolbar-collapsed': toolbarCollapsed }">
      <div class="bottom-left">
        <button class="ctrl-btn" @click="undo" :disabled="!canUndo" title="撤销">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 7"/>
          </svg>
        </button>
        <button class="ctrl-btn" @click="redo" :disabled="!canRedo" title="重做">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 7v6h-6"/><path d="M21 13a9 9 0 1 1-3-7.7L21 7"/>
          </svg>
        </button>
      </div>
      <div class="bottom-right">
        <button class="ctrl-btn" :disabled="currentPage <= 1" @click="prevPage" title="上一页">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <span class="page-info">{{ currentPage }}/{{ totalPages }}</span>
        <button class="ctrl-btn" :disabled="currentPage >= totalPages" @click="nextPage" title="下一页">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        <button class="ctrl-btn" @click="addPage" title="新增页">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Canvas, PencilBrush, Rect, Circle, Line, IText, type FabricObject } from 'fabric'

const containerRef = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
let fabricCanvas: Canvas | null = null

type ToolType = 'select' | 'pan' | 'pen' | 'text' | 'rect' | 'circle' | 'line' | 'eraser' | 'laser'
const currentTool = ref<ToolType>('pen')
const strokeColor = ref('#FF6B6B')
const strokeWidth = ref(4)
const showColorPicker = ref(false)
const colors = ['#FFFFFF', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#667eea', '#000000']
const toolbarCollapsed = ref(false)

const history = ref<string[]>([])
const historyIndex = ref(-1)
const canUndo = ref(false)
const canRedo = ref(false)

// 多页支持
const currentPage = ref(1)
const totalPages = ref(1)
const pages = ref<string[]>([])

// 拖拽平移
let isPanning = false
let lastPosX = 0
let lastPosY = 0

// 激光笔
const laserPos = reactive({ x: 0, y: 0, visible: false })

let isDrawingShape = false
let startX = 0
let startY = 0
let tempShape: FabricObject | null = null

const initCanvas = () => {
  if (!canvasEl.value || !containerRef.value) return
  const wrapper = containerRef.value.querySelector('.canvas-wrapper') as HTMLElement
  fabricCanvas = new Canvas(canvasEl.value, {
    width: wrapper.clientWidth,
    height: wrapper.clientHeight,
    backgroundColor: '#2C3E50',
    isDrawingMode: true
  })
  fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas)
  fabricCanvas.freeDrawingBrush.color = strokeColor.value
  fabricCanvas.freeDrawingBrush.width = strokeWidth.value
  fabricCanvas.on('path:created', saveHistory)
  fabricCanvas.on('object:modified', saveHistory)
  fabricCanvas.on('mouse:down', onMouseDown)
  fabricCanvas.on('mouse:move', onMouseMove)
  fabricCanvas.on('mouse:up', onMouseUp)
  // 鼠标滚轮缩放
  fabricCanvas.on('mouse:wheel', onMouseWheel)
  saveHistory()
  // 初始化第一页
  pages.value = [JSON.stringify(fabricCanvas.toJSON())]
}

const setTool = (tool: ToolType) => {
  currentTool.value = tool
  if (!fabricCanvas) return
  
  // 重置激光笔
  laserPos.visible = false
  
  if (tool === 'pen') {
    fabricCanvas.isDrawingMode = true
    fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas)
    fabricCanvas.freeDrawingBrush.color = strokeColor.value
    fabricCanvas.freeDrawingBrush.width = strokeWidth.value
    fabricCanvas.defaultCursor = 'crosshair'
  } else if (tool === 'eraser') {
    fabricCanvas.isDrawingMode = true
    fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas)
    fabricCanvas.freeDrawingBrush.color = '#2C3E50'
    fabricCanvas.freeDrawingBrush.width = strokeWidth.value * 4
    fabricCanvas.defaultCursor = 'crosshair'
  } else if (tool === 'select') {
    fabricCanvas.isDrawingMode = false
    fabricCanvas.selection = true
    fabricCanvas.defaultCursor = 'default'
  } else if (tool === 'pan') {
    fabricCanvas.isDrawingMode = false
    fabricCanvas.selection = false
    fabricCanvas.defaultCursor = 'grab'
  } else if (tool === 'laser') {
    fabricCanvas.isDrawingMode = false
    fabricCanvas.selection = false
    fabricCanvas.defaultCursor = 'none'
  } else if (tool === 'text') {
    fabricCanvas.isDrawingMode = false
    fabricCanvas.selection = false
    fabricCanvas.defaultCursor = 'text'
  } else {
    fabricCanvas.isDrawingMode = false
    fabricCanvas.selection = false
    fabricCanvas.defaultCursor = 'crosshair'
  }
}

const onMouseDown = (opt: any) => {
  if (!fabricCanvas) return
  const tool = currentTool.value
  const pointer = fabricCanvas.getScenePoint(opt.e)
  
  // 拖拽平移
  if (tool === 'pan') {
    isPanning = true
    fabricCanvas.defaultCursor = 'grabbing'
    lastPosX = opt.e.clientX
    lastPosY = opt.e.clientY
    return
  }
  
  // 文字输入
  if (tool === 'text') {
    const text = new IText('输入文字', {
      left: pointer.x,
      top: pointer.y,
      fontSize: 24,
      fill: strokeColor.value,
      fontFamily: 'sans-serif'
    })
    fabricCanvas.add(text)
    fabricCanvas.setActiveObject(text)
    text.enterEditing()
    text.selectAll()
    saveHistory()
    return
  }
  
  // 图形绘制
  if (!['rect', 'circle', 'line'].includes(tool)) return
  startX = pointer.x
  startY = pointer.y
  isDrawingShape = true
}

const onMouseMove = (opt: any) => {
  if (!fabricCanvas) return
  const tool = currentTool.value
  
  // 激光笔
  if (tool === 'laser') {
    const wrapper = containerRef.value?.querySelector('.canvas-wrapper') as HTMLElement
    if (wrapper) {
      const rect = wrapper.getBoundingClientRect()
      laserPos.x = opt.e.clientX - rect.left + 56 // 加上左侧工具栏宽度
      laserPos.y = opt.e.clientY - rect.top
      laserPos.visible = true
    }
    return
  }
  
  // 拖拽平移
  if (tool === 'pan' && isPanning) {
    const vpt = fabricCanvas.viewportTransform
    if (vpt) {
      vpt[4] += opt.e.clientX - lastPosX
      vpt[5] += opt.e.clientY - lastPosY
      fabricCanvas.requestRenderAll()
      lastPosX = opt.e.clientX
      lastPosY = opt.e.clientY
    }
    return
  }
  
  // 图形绘制
  if (!isDrawingShape) return
  if (!['rect', 'circle', 'line'].includes(tool)) return
  const pointer = fabricCanvas.getScenePoint(opt.e)
  if (tempShape) fabricCanvas.remove(tempShape)
  if (tool === 'rect') {
    tempShape = new Rect({
      left: Math.min(startX, pointer.x), top: Math.min(startY, pointer.y),
      width: Math.abs(pointer.x - startX), height: Math.abs(pointer.y - startY),
      fill: 'transparent', stroke: strokeColor.value, strokeWidth: strokeWidth.value
    })
  } else if (tool === 'circle') {
    const r = Math.sqrt(Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2)) / 2
    tempShape = new Circle({
      left: (startX + pointer.x) / 2 - r, top: (startY + pointer.y) / 2 - r,
      radius: r, fill: 'transparent', stroke: strokeColor.value, strokeWidth: strokeWidth.value
    })
  } else if (tool === 'line') {
    tempShape = new Line([startX, startY, pointer.x, pointer.y], {
      stroke: strokeColor.value, strokeWidth: strokeWidth.value
    })
  }
  if (tempShape) { fabricCanvas.add(tempShape); fabricCanvas.renderAll() }
}

const onMouseUp = () => {
  if (!fabricCanvas) return
  
  // 拖拽平移结束
  if (currentTool.value === 'pan') {
    isPanning = false
    fabricCanvas.defaultCursor = 'grab'
    return
  }
  
  if (isDrawingShape && tempShape) saveHistory()
  isDrawingShape = false
  tempShape = null
}

// 鼠标滚轮缩放
const onMouseWheel = (opt: any) => {
  if (!fabricCanvas) return
  const delta = opt.e.deltaY
  let zoom = fabricCanvas.getZoom()
  zoom *= 0.999 ** delta
  if (zoom > 5) zoom = 5
  if (zoom < 0.2) zoom = 0.2
  const point = fabricCanvas.getScenePoint(opt.e)
  fabricCanvas.zoomToPoint(point, zoom)
  opt.e.preventDefault()
  opt.e.stopPropagation()
}

const saveHistory = () => {
  if (!fabricCanvas) return
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(JSON.stringify(fabricCanvas.toJSON()))
  historyIndex.value = history.value.length - 1
  canUndo.value = historyIndex.value > 0
  canRedo.value = false
}

const undo = async () => {
  if (!canUndo.value || !fabricCanvas) return
  historyIndex.value--
  const json = history.value[historyIndex.value]
  if (json) {
    await fabricCanvas.loadFromJSON(json)
    fabricCanvas.renderAll()
  }
  canUndo.value = historyIndex.value > 0
  canRedo.value = historyIndex.value < history.value.length - 1
}

const redo = async () => {
  if (!canRedo.value || !fabricCanvas) return
  historyIndex.value++
  const json = history.value[historyIndex.value]
  if (json) {
    await fabricCanvas.loadFromJSON(json)
    fabricCanvas.renderAll()
  }
  canUndo.value = historyIndex.value > 0
  canRedo.value = historyIndex.value < history.value.length - 1
}

const clearBoard = () => {
  if (!fabricCanvas) return
  fabricCanvas.clear()
  fabricCanvas.backgroundColor = '#2C3E50'
  fabricCanvas.renderAll()
  saveHistory()
}

// 多页管理
const savePage = () => {
  if (!fabricCanvas) return
  pages.value[currentPage.value - 1] = JSON.stringify(fabricCanvas.toJSON())
}

const loadPage = async (pageIndex: number) => {
  if (!fabricCanvas) return
  const pageData = pages.value[pageIndex]
  if (pageData) {
    await fabricCanvas.loadFromJSON(pageData)
  } else {
    fabricCanvas.clear()
    fabricCanvas.backgroundColor = '#2C3E50'
  }
  fabricCanvas.renderAll()
  // 重置历史
  history.value = [JSON.stringify(fabricCanvas.toJSON())]
  historyIndex.value = 0
  canUndo.value = false
  canRedo.value = false
}

const prevPage = () => {
  if (currentPage.value <= 1) return
  savePage()
  currentPage.value--
  loadPage(currentPage.value - 1)
}

const nextPage = () => {
  if (currentPage.value >= totalPages.value) return
  savePage()
  currentPage.value++
  loadPage(currentPage.value - 1)
}

const addPage = () => {
  savePage()
  pages.value.push('')
  totalPages.value++
  currentPage.value = totalPages.value
  if (fabricCanvas) {
    fabricCanvas.clear()
    fabricCanvas.backgroundColor = '#2C3E50'
    fabricCanvas.setZoom(1)
    fabricCanvas.viewportTransform = [1, 0, 0, 1, 0, 0]
    fabricCanvas.renderAll()
  }
  history.value = [JSON.stringify(fabricCanvas?.toJSON())]
  historyIndex.value = 0
  canUndo.value = false
  canRedo.value = false
}

watch(strokeColor, (c) => {
  if (fabricCanvas?.freeDrawingBrush && currentTool.value === 'pen') {
    fabricCanvas.freeDrawingBrush.color = c
  }
})

const handleResize = () => {
  if (!fabricCanvas || !containerRef.value) return
  const wrapper = containerRef.value.querySelector('.canvas-wrapper') as HTMLElement
  fabricCanvas.setDimensions({ width: wrapper.clientWidth, height: wrapper.clientHeight })
  fabricCanvas.renderAll()
}

// 监听工具栏收起状态变化，重新计算画布尺寸
watch(toolbarCollapsed, () => {
  nextTick(() => handleResize())
})

onMounted(() => { nextTick(() => { initCanvas(); window.addEventListener('resize', handleResize) }) })
onUnmounted(() => { window.removeEventListener('resize', handleResize); fabricCanvas?.dispose() })
</script>

<style scoped>
.fabric-board { width: 100%; height: 100%; position: relative; background: #2C3E50; border-radius: 4px; overflow: hidden; }
.canvas-wrapper { position: absolute; left: 56px; top: 0; right: 0; bottom: 48px; transition: left 0.3s ease; }
.canvas-wrapper canvas { display: block; }
.board-toolbar-left { position: absolute; left: 8px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 4px; padding: 8px; background: rgba(255,255,255,0.95); border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.15); z-index: 10; transition: all 0.3s ease; }
.tool-btn { width: 36px; height: 36px; background: transparent; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #666; transition: all 0.2s; }
.tool-btn:hover { background: #F0F0F0; color: #333; }
.tool-btn.active { background: #E6F4FF; color: #3EAEFF; }
.tool-divider { height: 1px; background: #E5E5E5; margin: 4px 0; }
.color-indicator { width: 20px; height: 20px; border-radius: 4px; border: 2px solid #DDD; }
.color-picker-popup { position: absolute; left: 52px; top: 50%; transform: translateY(-50%); display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); z-index: 20; }
.color-option { width: 24px; height: 24px; border: 2px solid transparent; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
.color-option:hover { transform: scale(1.1); }
.color-option.active { border-color: #3EAEFF; }
.board-bottom-bar { position: absolute; left: 56px; right: 0; bottom: 0; height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; background: rgba(255,255,255,0.95); border-top: 1px solid #E5E5E5; transition: left 0.3s ease; }
.bottom-left, .bottom-right { display: flex; align-items: center; gap: 8px; }
.ctrl-btn { width: 32px; height: 32px; background: #F5F5F5; border: 1px solid #E5E5E5; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #666; font-size: 16px; transition: all 0.2s; }
.ctrl-btn:hover:not(:disabled) { background: #E5E5E5; color: #333; }
.ctrl-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 13px; color: #666; min-width: 40px; text-align: center; }
/* 激光笔 */
.laser-dot { position: absolute; width: 16px; height: 16px; background: radial-gradient(circle, #FF0000 0%, #FF0000 30%, rgba(255,0,0,0.5) 60%, transparent 100%); border-radius: 50%; pointer-events: none; z-index: 100; transform: translate(-50%, -50%); box-shadow: 0 0 20px 8px rgba(255,0,0,0.4); animation: laser-pulse 0.8s ease-in-out infinite; }
@keyframes laser-pulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; } }
/* 工具栏收起按钮 */
.toolbar-toggle { position: absolute; left: 56px; top: 50%; transform: translateY(-50%); width: 20px; height: 48px; background: rgba(255,255,255,0.95); border: none; border-radius: 0 6px 6px 0; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #666; z-index: 11; box-shadow: 2px 0 8px rgba(0,0,0,0.1); transition: all 0.3s ease; }
.toolbar-toggle:hover { background: #F0F0F0; color: #333; }
.toolbar-toggle.collapsed { left: 0; }
/* 工具栏收起状态 */
.board-toolbar-left.collapsed { transform: translateY(-50%) translateX(-100%); opacity: 0; pointer-events: none; }
.canvas-wrapper.toolbar-collapsed { left: 8px; }
.board-bottom-bar.toolbar-collapsed { left: 8px; }
</style>
