import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'

interface CheckInCalendarProps {
  checkInDates: string[]
  onCheckIn: () => void
}

export const CheckInCalendar = ({ checkInDates, onCheckIn }: CheckInCalendarProps): JSX.Element => {
  const [currentDate, setCurrentDate] = useState(new Date())

  // 获取当前月份的天数
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  // 获取当月第一天是星期几
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  // 生成日历数据
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // 添加上个月的天数
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // 添加当月的天数
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  // 检查某天是否打卡
  const isCheckedIn = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return checkInDates.includes(dateStr)
  }

  // 切换月份
  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1))
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-700 rounded">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <span className="text-lg font-semibold">
          {currentDate.toLocaleString('default', { year: 'numeric', month: 'long' })}
        </span>
        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-700 rounded">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
          <div key={day} className="text-gray-400 text-sm">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {generateCalendarDays().map((day, index) => (
          <div
            key={index}
            className={`
              aspect-square flex items-center justify-center rounded-full text-sm
              ${day === null ? 'invisible' : ''}
              ${isCheckedIn(day) ? 'bg-green-500 text-white' : 'hover:bg-gray-700'}
            `}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <div className="text-sm text-gray-400 mb-2">
          本月已打卡{' '}
          {
            checkInDates.filter((date) =>
              date.startsWith(
                `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
              )
            ).length
          }{' '}
          天
        </div>
        <button
          onClick={onCheckIn}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
        >
          打卡
        </button>
      </div>
    </div>
  )
}
