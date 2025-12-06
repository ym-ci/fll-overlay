"use client"

import { useEffect, useState } from "react"
import { api } from "@/trpc/react"
import type { Field } from "@/server/db/schema"

interface TimerProps {
    field: Field
}

export function Timer({ field }: TimerProps) {
    const [currentTime, setCurrentTime] = useState(0)

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

        const updateTimer = () => {
            if (fieldState.holdStart || !fieldState.timerStart) {
                setCurrentTime(TIMER_DURATION) // Set to 3 minutes when holding start
                return
            }

            const elapsed = Date.now() - new Date(fieldState.timerStart).getTime()
            const remaining = TIMER_DURATION - elapsed
            setCurrentTime(Math.max(0, remaining)) // Count down to 0
        }

        updateTimer()
        const interval = setInterval(updateTimer, 10) // Update every 10ms for smooth animation

        return () => clearInterval(interval)
    }, [fieldState])

    // Format time as MM:SS.mmm
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60

        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    // Check is ?overlay=1 is in the URL
    const overlay = new URLSearchParams(window.location.search).get("overlay")

    return (
        <div className={`flex h-screen w-screen items-center justify-center ${overlay ? "bg-transparent" : "bg-black"}`}>
            <div className="w-full text-center font-mono text-[35vw] font-bold leading-none text-white">
                {formatTime(currentTime)}
            </div>
        </div>
    )
}
