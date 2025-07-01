"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Animation end handler
  useEffect(() => {
    if (animating) {
      const timeout = setTimeout(() => setAnimating(false), 1400) // 1.4s for slower animation
      return () => clearTimeout(timeout)
    }
  }, [animating])

  const handleClick = (e: React.MouseEvent) => {
    // Get the button's position relative to the viewport
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    // Get the click position relative to the container
    const x = rect.left + rect.width / 2 - (containerRef.current?.getBoundingClientRect().left ?? 0)
    const y = rect.top + rect.height / 2 - (containerRef.current?.getBoundingClientRect().top ?? 0)
    setCoords({ x, y })
    setAnimating(true)
    setTimeout(() => {
      setTheme(theme === "light" ? "dark" : "light")
    }, 600) // Delay theme change a bit more for effect
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <div className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative z-10"
        style={{ overflow: "hidden" }}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      {animating && (
        <span
          className="pointer-events-none absolute rounded-full bg-gray-900 dark:bg-white"
          style={{
            left: coords.x,
            top: coords.y,
            width: 0,
            height: 0,
            transform: "translate(-50%, -50%)",
            animation: "theme-spread 1.4s cubic-bezier(.4,0,.2,1) forwards", // 1.4s for slower spread
            zIndex: 9,
            opacity: 0.15,
          }}
        />
      )}
      <style>{`
        @keyframes theme-spread {
          to {
            width: 2000px;
            height: 2000px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
