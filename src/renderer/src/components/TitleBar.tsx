import { ArrowsExpandIcon, MinusSmIcon, XIcon } from '@heroicons/react/solid'

export const TitleBar = (): JSX.Element => {
  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-gray-900/95 backdrop-blur-sm flex items-center justify-between px-4 select-none drag z-50 border-b border-gray-800">
      <div className="text-gray-400 text-sm">HoWhite记事本</div>
      <div className="flex space-x-2">
        <button
          onClick={() => window.api.windowControl.minimize()}
          className="p-1 hover:bg-gray-700 rounded"
        >
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={() => window.api.windowControl.maximize()}
          className="p-1 hover:bg-gray-700 rounded"
        >
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
        <button
          onClick={() => window.api.windowControl.close()}
          className="p-1 hover:bg-red-500 rounded group"
        >
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
