"use client"

import { use, useEffect, useState } from "react"
import { api } from "@/trpc/react"
import type { Field } from "@/server/db/schema"

interface TeamPageProps {
    params: Promise<{
        field: Field
        table: string
    }>
}

export default function TeamPage({ params }: TeamPageProps) {
    const { field, table } = use(params)
    const [overlay, setOverlay] = useState(false)

    // Check if ?overlay=1 is in the URL (client-side only)
    useEffect(() => {
        const overlayParam = new URLSearchParams(window.location.search).get("overlay")
        setOverlay(overlayParam === "1")
    }, [])

    // Fetch current match with team data
    const { data: matchState } = api.matches.getCurrentMatch.useQuery(
        { field },
        {
            refetchInterval: 1500, // Refetch every 500ms to stay in sync
        }
    )

    // Get the team for the specified table
    const team = table === "a" ? matchState?.match?.teamA : matchState?.match?.teamB

    return (
        <div className={`flex h-screen w-screen items-center justify-center ${overlay ? "bg-transparent" : "bg-black"}`}>
            <div className="w-full text-center">
                {team ? (
                    <>
                        <div className={`font-mono text-[5vw] font-bold leading-none ${overlay ? "text-black" : "text-white"}`}>
                            {team.number} - {team.name}
                        </div>

                    </>
                ) : (
                    <div className="font-mono text-[10vw] font-bold text-gray-600">
                        NO TEAM
                    </div>
                )}
            </div>
        </div>
    )
}

