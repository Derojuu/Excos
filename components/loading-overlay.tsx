"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
}

export function LoadingOverlay({ isLoading, message = "Loading..." }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center space-y-4 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/20 dark:border-gray-700/20"
          >
            <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
