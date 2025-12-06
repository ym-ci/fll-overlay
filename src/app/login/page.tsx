"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/server/better-auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/controller";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (isSignUp) {
                await authClient.signUp.email({
                    email,
                    password,
                    name: email.split("@")[0] ?? "User", // Use email prefix as name
                });
            } else {
                await authClient.signIn.email({
                    email,
                    password,
                });
            }

            // Redirect to callback URL after successful login
            router.push(callbackUrl);
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Authentication failed. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute -right-1/4 bottom-0 h-96 w-96 animate-pulse rounded-full bg-blue-500/20 blur-3xl delay-1000" />
            </div>

            <Card className="relative w-full max-w-md border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-xl">
                <CardHeader className="space-y-1">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-center text-3xl font-bold text-white">
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </CardTitle>
                    <CardDescription className="text-center text-slate-400">
                        {isSignUp
                            ? "Sign up to access the controller dashboard"
                            : "Sign in to access the controller dashboard"}
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="border-slate-700 bg-slate-800/50 pl-10 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="border-slate-700 bg-slate-800/50 pl-10 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transition-all hover:from-purple-700 hover:to-blue-700 hover:shadow-xl disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isSignUp ? "Creating account..." : "Signing in..."}
                                </>
                            ) : (
                                <>{isSignUp ? "Sign Up" : "Sign In"}</>
                            )}
                        </Button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError("");
                            }}
                            className="text-sm text-slate-400 transition-colors hover:text-white"
                        >
                            {isSignUp
                                ? "Already have an account? Sign in"
                                : "Don't have an account? Sign up"}
                        </button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
