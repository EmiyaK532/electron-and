import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon, SearchIcon, AdjustmentsIcon, BellIcon } from '@heroicons/react/solid'
import { useSpring, animated } from 'react-spring'
import { Menu } from '@headlessui/react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { TitleBar } from './TitleBar'

interface Note {
  id: number
  content: string
  timestamp: Date
  category: 'work' | 'personal' | 'ideas' | 'todos'
  isCompleted?: boolean
  repeatType?: 'once' | 'daily' | 'weekly' | 'monthly'
  lastCompletedDate?: string
  dueDate?: Date
  priority?: 'low' | 'medium' | 'high'
  reminder?: Date
}

// 添加拖拽类型定义
interface DragResult {
  destination?: {
    index: number
  }
  source: {
    index: number
  }
}

export const NoteApp = (): JSX.Element => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('notes')
    return savedNotes
      ? JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp)
        }))
      : []
  })

  const [currentNote, setCurrentNote] = useState('')
  const [category, setCategory] = useState<Note['category']>('personal')
  const [filter, setFilter] = useState<Note['category'] | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showReminder, setShowReminder] = useState(false)

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  const handleAddNote = (): void => {
    if (currentNote.trim()) {
      const newNote: Note = {
        id: Date.now(),
        content: currentNote,
        timestamp: new Date(),
        category,
        isCompleted: false,
        repeatType: category === 'todos' ? 'once' : undefined
      }
      setNotes([newNote, ...notes])
      setCurrentNote('')
    }
  }

  const handleDeleteNote = (id: number): void => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  const filteredNotes = filter === 'all' ? notes : notes.filter((note) => note.category === filter)

  const searchedNotes = searchTerm
    ? filteredNotes.filter((note) => note.content.toLowerCase().includes(searchTerm.toLowerCase()))
    : filteredNotes

  const categoryColors = {
    work: 'bg-blue-100 border-blue-300',
    personal: 'bg-green-100 border-green-300',
    ideas: 'bg-purple-100 border-purple-300',
    todos: 'bg-yellow-100 border-yellow-300'
  }

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 }
  })

  const toggleTodoComplete = (id: number): void => {
    setNotes(
      notes.map((note) => {
        if (note.id === id) {
          const today = new Date().toISOString().split('T')[0]
          if (note.repeatType === 'daily') {
            // 如果是每日待办，只在当天标记为完成
            return {
              ...note,
              isCompleted: note.lastCompletedDate !== today,
              lastCompletedDate: note.lastCompletedDate === today ? undefined : today
            }
          }
          // 一次性待办
          return { ...note, isCompleted: !note.isCompleted }
        }
        return note
      })
    )
  }

  const toggleTodoRepeatType = (id: number): void => {
    setNotes(
      notes.map((note) => {
        if (note.id === id) {
          return {
            ...note,
            repeatType: note.repeatType === 'once' ? 'daily' : 'once',
            isCompleted: false,
            lastCompletedDate: undefined
          }
        }
        return note
      })
    )
  }

  const onDragEnd = (result: DragResult) => {
    if (!result.destination) return

    const items = Array.from(notes)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setNotes(items)
  }

  const setNoteReminder = (id: number, date: Date) => {
    setNotes(
      notes.map((note) => {
        if (note.id === id) {
          return { ...note, reminder: date }
        }
        return note
      })
    )
  }

  useEffect(() => {
    const checkReminders = setInterval(() => {
      const now = new Date()
      notes.forEach((note) => {
        if (note.reminder && new Date(note.reminder) <= now) {
          new Notification('待办提醒', {
            body: note.content
          })
          // 清除已触发的提醒
          setNoteReminder(note.id, undefined)
        }
      })
    }, 60000) // 每分钟检查一次

    return () => clearInterval(checkReminders)
  }, [notes])

  // 添加优先级颜色映射
  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    high: 'bg-red-500/10 text-red-400 border-red-500/20'
  }

  // 添加重复类型图标映射
  const repeatTypeIcons = {
    once: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    daily: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    weekly: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    monthly: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-gray-100">
      <TitleBar />
      <div className="container mx-auto p-6 max-w-6xl pt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-blue-500 opacity-10 blur-2xl rounded-full"></div>
          <h1 className="text-5xl font-bold text-center mb-4 relative bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            智能记事本
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </motion.div>

        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="搜索笔记..."
            />
            <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <animated.div style={fadeIn} className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">分类筛选</h2>
                <AdjustmentsIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`w-full p-2 rounded-lg transition-all duration-200 ${
                    filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  全部笔记
                </button>
                {Object.keys(categoryColors).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat as Note['category'])}
                    className={`w-full p-2 rounded-lg transition-all duration-200 ${
                      filter === cat ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {cat === 'work'
                      ? '📝 工作'
                      : cat === 'personal'
                        ? '👤 个人'
                        : cat === 'ideas'
                          ? '💡 想法'
                          : '✓ 待办'}
                  </button>
                ))}
              </div>
            </div>
          </animated.div>

          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700 mb-6">
              <div className="mb-4 space-y-4">
                <Menu as="div" className="relative">
                  <Menu.Button className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 flex items-center justify-between">
                    <span>
                      {category === 'work'
                        ? '📝 工作'
                        : category === 'personal'
                          ? '👤 个人'
                          : category === 'ideas'
                            ? '💡 想法'
                            : '✓ 待办'}
                    </span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Menu.Button>
                  <Menu.Items className="absolute w-full mt-2 bg-gray-700 rounded-lg shadow-lg border border-gray-600 overflow-hidden">
                    {Object.keys(categoryColors).map((cat) => (
                      <Menu.Item key={cat}>
                        {({ active }) => (
                          <button
                            onClick={() => setCategory(cat as Note['category'])}
                            className={`w-full p-3 text-left ${active ? 'bg-gray-600' : ''}`}
                          >
                            {cat === 'work'
                              ? '📝 工作'
                              : cat === 'personal'
                                ? '👤 个人'
                                : cat === 'ideas'
                                  ? '💡 想法'
                                  : '✓ 待办'}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Menu>

                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400"
                  rows={4}
                  placeholder="写下你的想法..."
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddNote}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>添加笔记</span>
                <PlusIcon className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="notes">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {searchedNotes.map((note, index) => (
                          <Draggable key={note.id} draggableId={note.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`
                                  group bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg
                                  border border-gray-700 hover:border-blue-500
                                  transition-all duration-200 overflow-hidden
                                  ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500' : ''}
                                `}
                              >
                                {/* 拖拽手柄 - 更明显的设计 */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="flex items-center justify-center p-2 border-b border-gray-700 bg-gray-800/50 cursor-move group-hover:bg-blue-500/10"
                                >
                                  <div className="flex space-x-1">
                                    <div className="w-1 h-4 rounded-full bg-gray-600 group-hover:bg-blue-400" />
                                    <div className="w-1 h-4 rounded-full bg-gray-600 group-hover:bg-blue-400" />
                                    <div className="w-1 h-4 rounded-full bg-gray-600 group-hover:bg-blue-400" />
                                  </div>
                                </div>

                                <div className="p-6">
                                  {/* 笔记内容区域 */}
                                  <div className="flex items-start space-x-4">
                                    {note.category === 'todos' && (
                                      <div className="flex-shrink-0">
                                        <button
                                          onClick={() => toggleTodoComplete(note.id)}
                                          className={`
                                            w-6 h-6 rounded-lg border-2 flex items-center justify-center
                                            transition-colors duration-200
                                            ${
                                              note.isCompleted
                                                ? 'bg-green-500 border-green-500'
                                                : 'border-gray-500 hover:border-green-500'
                                            }
                                          `}
                                        >
                                          {note.isCompleted && (
                                            <svg
                                              className="w-4 h-4 text-white"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                              />
                                            </svg>
                                          )}
                                        </button>
                                      </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                      {/* 笔记标题和内容 */}
                                      <div className="mb-4">
                                        <p
                                          className={`
                                            text-gray-100 whitespace-pre-wrap leading-relaxed
                                            ${note.isCompleted ? 'line-through text-gray-400' : ''}
                                          `}
                                        >
                                          {note.content}
                                        </p>
                                      </div>

                                      {/* 标签区域 */}
                                      <div className="flex flex-wrap items-center gap-2 mb-4">
                                        {note.dueDate && (
                                          <span className="flex items-center space-x-1 text-xs bg-gray-700/50 px-2 py-1 rounded-full">
                                            <svg
                                              className="w-3 h-3"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                              />
                                            </svg>
                                            <span>
                                              {new Date(note.dueDate).toLocaleDateString()}
                                            </span>
                                          </span>
                                        )}

                                        {note.priority && (
                                          <span
                                            className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full border ${priorityColors[note.priority]}`}
                                          >
                                            <svg
                                              className="w-3 h-3"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 10V3L4 14h7v7l9-11h-7z"
                                              />
                                            </svg>
                                            <span>
                                              {note.priority === 'low'
                                                ? '低'
                                                : note.priority === 'medium'
                                                  ? '中'
                                                  : '高'}
                                              优先级
                                            </span>
                                          </span>
                                        )}

                                        {note.repeatType && (
                                          <span className="flex items-center space-x-1 text-xs bg-gray-700/50 px-2 py-1 rounded-full">
                                            {repeatTypeIcons[note.repeatType]}
                                            <span>
                                              {note.repeatType === 'once'
                                                ? '一次性'
                                                : note.repeatType === 'daily'
                                                  ? '每天'
                                                  : note.repeatType === 'weekly'
                                                    ? '每周'
                                                    : '每月'}
                                            </span>
                                          </span>
                                        )}
                                      </div>

                                      {/* 底部工具栏 */}
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                          <select
                                            value={note.priority || 'low'}
                                            onChange={(e) =>
                                              setNotes(
                                                notes.map((n) =>
                                                  n.id === note.id
                                                    ? {
                                                        ...n,
                                                        priority: e.target.value as Note['priority']
                                                      }
                                                    : n
                                                )
                                              )
                                            }
                                            className="bg-gray-700/50 text-sm rounded-lg px-3 py-1.5"
                                          >
                                            <option value="low">低优先级</option>
                                            <option value="medium">中优先级</option>
                                            <option value="high">高优先级</option>
                                          </select>

                                          <DatePicker
                                            selected={note.dueDate}
                                            onChange={(date) =>
                                              setNotes(
                                                notes.map((n) =>
                                                  n.id === note.id ? { ...n, dueDate: date } : n
                                                )
                                              )
                                            }
                                            className="bg-gray-700/50 text-sm rounded-lg px-3 py-1.5"
                                            placeholderText="设置截止日期"
                                          />

                                          <select
                                            value={note.repeatType || 'once'}
                                            onChange={(e) =>
                                              setNotes(
                                                notes.map((n) =>
                                                  n.id === note.id
                                                    ? {
                                                        ...n,
                                                        repeatType: e.target
                                                          .value as Note['repeatType']
                                                      }
                                                    : n
                                                )
                                              )
                                            }
                                            className="bg-gray-700/50 text-sm rounded-lg px-3 py-1.5"
                                          >
                                            <option value="once">一次性</option>
                                            <option value="daily">每天</option>
                                            <option value="weekly">每周</option>
                                            <option value="monthly">每月</option>
                                          </select>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                          <button
                                            onClick={() => setShowReminder(note.id)}
                                            className="p-2 hover:bg-gray-700 rounded-full"
                                          >
                                            <BellIcon className="w-5 h-5 text-gray-400" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteNote(note.id)}
                                            className="p-2 hover:bg-red-500/20 rounded-full"
                                          >
                                            <svg
                                              className="w-5 h-5 text-red-400"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                              />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {showReminder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">设置提醒</h3>
            <DatePicker
              selected={new Date()}
              onChange={(date) => {
                setNoteReminder(showReminder, date)
                setShowReminder(false)
              }}
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
              className="bg-gray-700 rounded px-3 py-2 w-full"
            />
            <button
              onClick={() => setShowReminder(false)}
              className="mt-4 px-4 py-2 bg-gray-700 rounded"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
