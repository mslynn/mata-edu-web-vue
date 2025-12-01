/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/components/**/*.{js,vue,ts}",
    "./app/layouts/**/*.vue",
    "./app/pages/**/*.vue",
    "./app/plugins/**/*.{js,ts}",
    "./app/app.vue",
    "./app/error.vue",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FF9900',
        'primary-dark': '#d4956a',
        'orange': '#FFA54D',
        'blue': '#3366FF',
      },
    },
  },
  safelist: [
    // 文字颜色
    'text-[#808080]',
    'text-[#CCCCCC]',
    'text-[#FF9900]',
    'text-[#FFA54D]',
    'text-[#e8a063]',
    'text-[#3366FF]',
    'text-[18px]',
    'text-[16px]',
    // Placeholder 颜色
    'placeholder-[#CCCCCC]',
    // 背景颜色
    'bg-[#FFA54D]',
    'bg-[#e8a063]',
    'bg-[#FAFAFA]',
    'bg-white',
    'bg-transparent',
    // Hover 状态
    'hover:text-[#e8a063]',
    'hover:bg-[#d4956a]',
    'hover:border-[#e8a063]',
    // 边框颜色和样式
    'border-[#808080]',
    'border-[#CCCCCC]',
    'border-red-500',
    'border-gray-300',
    'border-solid',
    'border-b',
    'border-none',
    // 尺寸
    'h-[600px]',
    'max-w-[1000px]',
    'rounded-[40px]',
    // 文字大小
    'text-sm',
    'text-xs',
    'text-red-500',
    'text-gray-300',
    'text-gray-400',
    // Flex
    'flex',
    'flex-col',
    'flex-1',
    'items-center',
    // 间距
    'px-4',
    'py-3',
    'mb-4',
    'mb-6',
    'mr-3',
    'mx-2',
    'mt-1',
  ],
  plugins: [],
}

