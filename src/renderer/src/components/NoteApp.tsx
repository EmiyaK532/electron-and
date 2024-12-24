import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon, SearchIcon, AdjustmentsIcon } from '@heroicons/react/solid'
import { useSpring, animated } from 'react-spring'
import { Menu } from '@headlessui/react'

interface Note {
  id: number
  content: string
  timestamp: Date
  category: 'work' | 'personal' | 'ideas' | 'todos'
  isCompleted?: boolean
  repeatType?: 'once' | 'daily'
  lastCompletedDate?: string
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-gray-100">
      <div className="container mx-auto p-6 max-w-6xl">
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
                {searchedNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`group bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-200 ${
                      note.isCompleted ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {note.category === 'todos' && (
                        <div className="flex flex-col items-center space-y-2">
                          <button
                            onClick={() => toggleTodoComplete(note.id)}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                              note.isCompleted
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-500 hover:border-green-500'
                            }`}
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
                          <button
                            onClick={() => toggleTodoRepeatType(note.id)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                              note.repeatType === 'daily'
                                ? 'text-blue-400'
                                : 'text-gray-500 hover:text-blue-400'
                            }`}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                      <div className="flex-1">
                        <p
                          className={`text-gray-100 whitespace-pre-wrap mb-4 leading-relaxed ${
                            note.isCompleted ? 'line-through text-gray-400' : ''
                          }`}
                        >
                          {note.content}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-400">
                              {note.timestamp.toLocaleString()}
                            </span>
                            <span
                              className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
                                note.category === 'work'
                                  ? 'bg-blue-500/20 text-blue-300 group-hover:bg-blue-500/30'
                                  : note.category === 'personal'
                                    ? 'bg-green-500/20 text-green-300 group-hover:bg-green-500/30'
                                    : note.category === 'ideas'
                                      ? 'bg-purple-500/20 text-purple-300 group-hover:bg-purple-500/30'
                                      : 'bg-yellow-500/20 text-yellow-300 group-hover:bg-yellow-500/30'
                              }`}
                            >
                              {note.category === 'work'
                                ? '📝 工作'
                                : note.category === 'personal'
                                  ? '👤 个人'
                                  : note.category === 'ideas'
                                    ? '💡 想法'
                                    : `✓ 待办 ${note.repeatType === 'daily' ? '(每日)' : ''}`}
                            </span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-400 hover:text-red-300 transition-colors p-2 opacity-0 group-hover:opacity-100"
                          >
                            <svg
                              className="w-5 h-5"
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
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
