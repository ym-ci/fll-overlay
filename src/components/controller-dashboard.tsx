"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/server/better-auth/client";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Play,
    SkipForward,
    SkipBack,
    Clock,
    LogOut,
    User,
    Settings,
    Trophy,
} from "lucide-react";

interface ControllerDashboardProps {
    user: {
        id: string;
        name: string;
        email: string;
    };
}

type Field = "Stone" | "Bronze";

const TIMER_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds

export function ControllerDashboard({ user }: ControllerDashboardProps) {
    const router = useRouter();
    const [selectedField, setSelectedField] = useState<Field>("Stone");
    const [currentMatch, setCurrentMatch] = useState(1);

    // API mutations
    const startTimerMutation = api.matches.startTimer.useMutation();
    const resetTimerMutation = api.matches.resetTimer.useMutation();
    const setFieldMatchMutation = api.matches.setFieldMatch.useMutation();

    // Query field state to keep UI in sync
    const { data: fieldState, refetch } = api.matches.getFieldState.useQuery(
        { field: selectedField },
        {
            refetchInterval: 500, // Refetch every 500ms to stay in sync
        }
    );

    // Derive timer state from field state
    const timerRunning = fieldState ? !fieldState.holdStart && !!fieldState.timerStart : false;

    const [timerValue, setTimerValue] = useState(180); // 3 minutes in seconds

    // Update timer value based on field state
    useEffect(() => {
        if (!fieldState) return;

        if (fieldState.holdStart || !fieldState.timerStart) {
            setTimerValue(180); // Reset to 3 minutes
            return;
        }

        const updateTimer = () => {
            if (!fieldState.timerStart) return;
            const elapsed = Date.now() - new Date(fieldState.timerStart).getTime();
            const remaining = TIMER_DURATION - elapsed;
            const remainingSeconds = Math.max(0, Math.floor(remaining / 1000));
            setTimerValue(remainingSeconds);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 100); // Update every 100ms

        return () => clearInterval(interval);
    }, [fieldState]);

    const handleLogout = async () => {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
    };

    const handleStartTimer = async () => {
        await startTimerMutation.mutateAsync({ field: selectedField });
        await refetch();
    };

    const handleResetTimer = async () => {
        await resetTimerMutation.mutateAsync({ field: selectedField });
        await refetch();
    };

    const handleNextMatch = async () => {
        const newMatch = currentMatch + 1;
        setCurrentMatch(newMatch);
        await setFieldMatchMutation.mutateAsync({
            number: newMatch,
            field: selectedField
        });
        await handleResetTimer();
        await refetch();
    };

    const handlePreviousMatch = async () => {
        const newMatch = Math.max(1, currentMatch - 1);
        setCurrentMatch(newMatch);
        await setFieldMatchMutation.mutateAsync({
            number: newMatch,
            field: selectedField
        });
        await handleResetTimer();
        await refetch();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white">
                            Competition Controller
                        </h1>
                        <p className="mt-2 text-slate-400">
                            Manage matches and timers for FLL competition
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 backdrop-blur-sm">
                            <User className="h-5 w-5 text-purple-400" />
                            <div>
                                <p className="text-sm font-medium text-white">{user.name}</p>
                                <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                        </div>

                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="border-slate-700 bg-slate-800/50 text-white hover:bg-slate-700"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Field Selection */}
                <Card className="mb-6 border-slate-800 bg-slate-900/50 shadow-xl backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white">Select Field</CardTitle>
                        <CardDescription className="text-slate-400">
                            Choose which competition field to control
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSelectedField("Stone")}
                                className={`group relative overflow-hidden rounded-xl border-2 p-6 transition-all ${selectedField === "Stone"
                                    ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/50"
                                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                    }`}
                            >
                                <div className="relative z-10">
                                    <Trophy className="mb-3 h-8 w-8 text-purple-400" />
                                    <h3 className="text-xl font-bold text-white">Stone Field</h3>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Primary competition field
                                    </p>
                                </div>
                                {selectedField === "Stone" && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
                                )}
                            </button>

                            <button
                                onClick={() => setSelectedField("Bronze")}
                                className={`group relative overflow-hidden rounded-xl border-2 p-6 transition-all ${selectedField === "Bronze"
                                    ? "border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/50"
                                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                    }`}
                            >
                                <div className="relative z-10">
                                    <Trophy className="mb-3 h-8 w-8 text-blue-400" />
                                    <h3 className="text-xl font-bold text-white">Bronze Field</h3>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Secondary competition field
                                    </p>
                                </div>
                                {selectedField === "Bronze" && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                                )}
                            </button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Timer Control */}
                    <Card className="border-slate-800 bg-slate-900/50 shadow-xl backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Clock className="h-5 w-5 text-purple-400" />
                                Match Timer
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Control the match countdown timer
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Timer Display */}
                            <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8">
                                <div className="text-center">
                                    <div
                                        className={`text-7xl font-bold tabular-nums transition-colors ${timerValue <= 10 && timerRunning
                                            ? "text-red-400 animate-pulse"
                                            : "text-white"
                                            }`}
                                    >
                                        {formatTime(timerValue)}
                                    </div>
                                    <p className="mt-2 text-sm text-slate-400">
                                        {timerRunning ? "Timer Running" : "Timer Stopped"}
                                    </p>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-700">
                                    <div
                                        className={`h-full transition-all duration-1000 ${timerValue <= 10
                                            ? "bg-gradient-to-r from-red-500 to-red-600"
                                            : "bg-gradient-to-r from-purple-500 to-blue-500"
                                            }`}
                                        style={{ width: `${(timerValue / 180) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Timer Controls */}
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    onClick={handleStartTimer}
                                    disabled={timerRunning || timerValue === 0}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
                                >
                                    <Play className="mr-2 h-4 w-4" />
                                    Start
                                </Button>

                                <Button
                                    onClick={handleResetTimer}
                                    className="bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800"
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Match Control */}
                    <Card className="border-slate-800 bg-slate-900/50 shadow-xl backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Trophy className="h-5 w-5 text-blue-400" />
                                Match Control
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Navigate between matches on {selectedField} field
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Current Match Display */}
                            <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-slate-400">
                                        Current Match
                                    </p>
                                    <div className="mt-2 text-7xl font-bold text-white">
                                        {currentMatch}
                                    </div>
                                    <p className="mt-2 text-sm text-slate-400">
                                        {selectedField} Field
                                    </p>
                                </div>
                            </div>

                            {/* Match Navigation */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={handlePreviousMatch}
                                    disabled={currentMatch <= 1}
                                    className="bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 disabled:opacity-50"
                                >
                                    <SkipBack className="mr-2 h-4 w-4" />
                                    Previous
                                </Button>

                                <Button
                                    onClick={handleNextMatch}
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                                >
                                    Next
                                    <SkipForward className="ml-2 h-4 w-4" />
                                </Button>
                            </div>

                            {/* Quick Actions */}
                            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                                <h4 className="mb-3 text-sm font-medium text-slate-300">
                                    Quick Actions
                                </h4>
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start border-slate-700 bg-transparent text-slate-300 hover:bg-slate-700 hover:text-white"
                                    >
                                        View Match Schedule
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start border-slate-700 bg-transparent text-slate-300 hover:bg-slate-700 hover:text-white"
                                    >
                                        Display on Timer Screen
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Bar */}
                <Card className="mt-6 border-slate-800 bg-slate-900/50 shadow-xl backdrop-blur-xl">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
                                    <span className="text-sm text-slate-400">System Online</span>
                                </div>
                                <div className="h-4 w-px bg-slate-700" />
                                <div className="text-sm text-slate-400">
                                    Field: <span className="font-medium text-white">{selectedField}</span>
                                </div>
                                <div className="h-4 w-px bg-slate-700" />
                                <div className="text-sm text-slate-400">
                                    Match: <span className="font-medium text-white">{currentMatch}</span>
                                </div>
                            </div>
                            <div className="text-xs text-slate-500">
                                Last updated: {new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
