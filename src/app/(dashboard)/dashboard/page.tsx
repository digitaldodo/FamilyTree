'use client';

import { Users, GitMerge, Image as ImageIcon, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMembers } from '@/hooks/use-members';

export default function DashboardPage() {
  const { members } = useMembers();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your family tree and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Members", value: members.length.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Generations", value: "3", icon: History, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Relationships", value: "12", icon: GitMerge, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "Media Uploads", value: "45", icon: ImageIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Additions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.slice(0, 3).map((m) => (
                <div key={m.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    {m.firstName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{m.firstName} {m.lastName}</p>
                    <p className="text-xs text-muted-foreground">Added to Generation {m.generation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors font-medium text-sm">
              + Add Family Member
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors font-medium text-sm">
              + Invite Collaborator
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors font-medium text-sm">
              + Upload Photos
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
