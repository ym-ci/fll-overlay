import { redirect } from "next/navigation";
import { getSession } from "@/server/better-auth/server";
import { ControllerDashboard } from "@/components/controller-dashboard";

export default async function ControllerPage() {
    const session = await getSession();

    // Redirect to login if not authenticated
    if (!session) {
        redirect("/login?callbackUrl=/controller");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <ControllerDashboard user={session.user} />
        </div>
    );
}
