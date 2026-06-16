export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account, tree permissions, and subscription.</p>
      </div>

      <div className="p-12 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-muted rounded-2xl mb-4 flex items-center justify-center text-muted-foreground">
          {/* Placeholder Icon */}
          <span className="text-2xl">⚙️</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">Settings Panel</h3>
        <p className="text-muted-foreground max-w-md">
          Administrative controls and tree configurations will be implemented here.
        </p>
      </div>
    </div>
  );
}
