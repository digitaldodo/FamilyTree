import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Mail, User as UserIcon, Calendar, Activity } from "lucide-react";
import { format } from "date-fns";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      trees: true,
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!user) return redirect("/login");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and account settings.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
            <div className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer">
              <div className="w-full h-full rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || 'User avatar'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-primary">{user.name?.[0] || user.email[0].toUpperCase()}</span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-semibold">{user.name || "Unnamed User"}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Joined {format(user.createdAt, "MMMM yyyy")}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-primary" />
              Account Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Trees Owned</span>
                <span className="font-medium">{user.trees.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Activity</span>
                <span className="font-medium">{user.activityLogs.length} Actions</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input defaultValue={user.name?.split(' ')[0]} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input defaultValue={user.name?.split(' ').slice(1).join(' ')} className="pl-9" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input defaultValue={user.email} type="email" className="pl-9" disabled />
                </div>
                <p className="text-xs text-muted-foreground">Contact support to change your email address.</p>
              </div>

              <div className="pt-4 flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </form>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
            {user.activityLogs.length > 0 ? (
              <div className="space-y-4">
                {user.activityLogs.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex flex-shrink-0 items-center justify-center mt-0.5">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm">You performed a <span className="font-semibold">{log.type.toLowerCase()}</span> on a <span className="font-semibold">{log.entityType}</span>.</p>
                      <span className="text-xs text-muted-foreground">{format(new Date(log.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
