import * as React from "react"
import Link from "next/link"

export default function Sidebar({ className = "" }: { className?: string }) {
  return (
    <aside className={`hidden md:block w-64 p-4 ${className}`}>
      <div className="mb-6">
        <div className="text-sm text-muted-foreground">General</div>
        <nav className="mt-2 flex flex-col gap-1">
          <Link href="/dashboard/teacher" className="px-3 py-2 rounded hover:bg-muted">Dashboard</Link>
          <Link href="/search" className="px-3 py-2 rounded hover:bg-muted">Search</Link>
          <Link href="/messages" className="px-3 py-2 rounded hover:bg-muted">Messages</Link>
        </nav>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Other</div>
        <nav className="mt-2 flex flex-col gap-1">
          <Link href="/profile" className="px-3 py-2 rounded hover:bg-muted">Profile</Link>
          <Link href="/settings" className="px-3 py-2 rounded hover:bg-muted">Settings</Link>
        </nav>
      </div>
    </aside>
  )
}
