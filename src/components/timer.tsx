"use client"

import { useEffect, useState } from "react"
import { api } from "@/trpc/react"
import type { Field } from "@/server/db/schema"

interface TimerProps {
    field: Field
}

export function Timer({ field }: TimerProps) {
    const [currentTime, setCurrentTime] = useState(0)
    const [isCountdown, setIsCountdown] = useState(false)

    // Fetch field state
    const { data: fieldState } = api.matches.getFieldState.useQuery(
        { field },
        {
            refetchInterval: 500, // Refetch every second to stay in sync
        }
    )

    // Update timer based on field state
    useEffect(() => {
        if (!fieldState) return

        const TIMER_DURATION = 3 * 60 * 1000 // 3 minutes in milliseconds
        const COUNTDOWN_DURATION = 5000 // 5 seconds countdown

        const updateTimer = () => {
            if (fieldState.holdStart || !fieldState.timerStart) {
                setCurrentTime(TIMER_DURATION) // Set to 3 minutes when holding start
                setIsCountdown(false)
                return
            }

            const now = Date.now()
            const startTime = new Date(fieldState.timerStart).getTime()
            const elapsedTotal = now - startTime

            if (elapsedTotal < COUNTDOWN_DURATION) {
                // In countdown phase
                setIsCountdown(true)
                const remainingCountdown = COUNTDOWN_DURATION - elapsedTotal
                // Show seconds remaining in countdown (5, 4, 3...)
                // Add 999ms to ceil the countdown effectively (4.9s -> 5)
                setCurrentTime(remainingCountdown)
            } else {
                // Match timer phase
                setIsCountdown(false)
                const matchElapsed = elapsedTotal - COUNTDOWN_DURATION
                const remainingMatchTime = TIMER_DURATION - matchElapsed
                setCurrentTime(Math.max(0, remainingMatchTime)) // Count down to 0
            }
        }

        updateTimer()
        const interval = setInterval(updateTimer, 10) // Update every 10ms for smooth animation

        return () => clearInterval(interval)
    }, [fieldState])

    // Format time
    const formatTime = (ms: number) => {
        if (isCountdown) {
            // During countdown, just show the seconds integer
            return Math.ceil(ms / 1000).toString()
        }

        const totalSeconds = Math.floor(ms / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60

        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    // Check is ?overlay=1 is in the URL
    const overlay = new URLSearchParams(window.location.search).get("overlay")

    const getContainerClass = () => {
        if (overlay) {
            return isCountdown ? "bg-transparent animate-pulse" : "bg-transparent"
        }
        return isCountdown ? "bg-red-600" : "bg-black"
    }

    return (
        <div className={`flex h-screen w-screen items-center justify-center ${getContainerClass()}`}>
            <div className="w-full text-center font-mono text-[35vw] font-bold leading-none text-white">
                {formatTime(currentTime)}
            </div>
        </div>
    )
}
