
"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: "⌂" },
  { label: "Projects", href: "/projects", icon: "▦" },
  { label: "Tasks", href: "/tasks", icon: "☷" },
  { label: "User Management", href: "/users", icon: "♙" },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("kaizen_user");
    const token = sessionStorage.getItem("kaizen_token");

    if (!token || !storedUser) {
      window.location.href = "/login";
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      sessionStorage.removeItem("kaizen_user");
      sessionStorage.removeItem("kaizen_token");
      window.location.href = "/login";
    }
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("kaizen_token");
    sessionStorage.removeItem("kaizen_user");
    window.location.href = "/login";
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAF8] text-[#465348]">
        Loading Kaizen...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#303A35]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-[#EAE9E2] bg-[#F5F3EC] px-6 py-8 md:flex md:flex-col">
        <div>
          <p className="text-xs tracking-[0.45em] text-[#89917E]">改善</p>
          <h1 className="mt-2 text-[25px] font-semibold tracking-[0.16em] text-[#354239]">
            KAIZEN
          </h1>
          <p className="mt-1 text-[11px] tracking-[0.12em] text-[#92978C]">
            PLAN. COLLABORATE. IMPROVE.
          </p>
        </div>

        <div className="mt-14">
          <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A0A397]">
            Workspace
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const active = item.href === "/dashboard";

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-medium transition ${
                    active
                      ? "bg-[#E5E9DF] text-[#49634E]"
                      : "text-[#777F75] hover:bg-[#EBEAE3] hover:text-[#354239]"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-[#E5E3DB] pt-5">
          <div className="mb-5 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DCE4D7] text-sm font-semibold text-[#49634E]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#3B463D]">
                {user.name}
              </p>
              <p className="text-xs text-[#92978C]">{user.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-[#7C8278] transition hover:bg-[#EBEAE3] hover:text-[#354239]"
          >
            ↗ Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <section className="md:ml-64">
        {/* Header */}
        <header className="flex min-h-[82px] items-center justify-between border-b border-[#ECEBE5] bg-white px-6 py-4 md:px-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#8D9688]">改善</span>
              <span className="text-xs text-[#B0B4AA]">/</span>
              <span className="text-xs text-[#7D857B]">Workspace</span>
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#354239]">
              Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-[#354239]">
                {user.name}
              </p>
              <p className="text-xs text-[#89917E]">{user.role}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DDE4D8] bg-[#EAF0E6] text-sm font-semibold text-[#49634E]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-[#7C8278] hover:text-[#49634E] md:hidden"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="px-6 py-9 md:px-10 md:py-12">
          {/* Welcome */}
          <div className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#849078]">
              KAIZEN WORKSPACE
            </p>
            <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#303A35] md:text-[36px]">
              Welcome back, {user.name}.
            </h1>
            <p className="mt-3 text-sm text-[#858B82]">
              Here's an overview of your workspace and what's moving forward.
            </p>
          </div>

          {/* Overview cards */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Total Projects",
                value: "—",
                description: "Projects in your workspace",
                symbol: "▦",
              },
              {
                title: "Total Tasks",
                value: "—",
                description: "Tasks across all projects",
                symbol: "☷",
              },
              {
                title: "Team Members",
                value: "—",
                description: "People in your workspace",
                symbol: "♙",
              },
              {
                title: "Completed Tasks",
                value: "—",
                description: "Tasks marked as done",
                symbol: "✓",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#EAE9E2] bg-white p-6 transition hover:border-[#D7DFD2] hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-[#777F75]">
                    {item.title}
                  </p>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F2EC] text-base text-[#71816B]">
                    {item.symbol}
                  </span>
                </div>
                <p className="mt-6 text-3xl font-semibold tracking-tight text-[#354239]">
                  {item.value}
                </p>
                <p className="mt-2 text-xs text-[#A0A49B]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Lower sections */}
          <div className="mt-8 grid gap-6 lg:grid-cols-5">
            <div className="rounded-2xl border border-[#EAE9E2] bg-white p-7 lg:col-span-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#92998C]">
                    Getting Started
                  </p>
                  <h3 className="mt-2 font-serif text-xl font-medium text-[#354239]">
                    Build momentum, one step at a time.
                  </h3>
                </div>
                <span className="text-2xl text-[#849078]">↗</span>
              </div>

              <p className="mt-4 max-w-lg text-sm leading-7 text-[#858B82]">
                Your Kaizen workspace is ready. Begin by bringing your team
                together, creating projects, and organising tasks to keep
                everyone moving in the same direction.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="/projects"
                  className="rounded-xl bg-[#536F58] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#405C46]"
                >
                  Explore Projects
                </a>
                <a
                  href="/users"
                  className="rounded-xl border border-[#DDE2D8] px-5 py-3 text-xs font-semibold text-[#536B55] transition hover:bg-[#F5F7F2]"
                >
                  Manage Team
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-[#EAE9E2] bg-[#F3F3EC] p-7 lg:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#92998C]">
                Your Account
              </p>
              <h3 className="mt-2 font-serif text-xl font-medium text-[#354239]">
                Account details
              </h3>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-xs text-[#999F94]">Full name</p>
                  <p className="mt-1 text-sm font-medium text-[#465348]">
                    {user.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#999F94]">Email address</p>
                  <p className="mt-1 break-all text-sm font-medium text-[#465348]">
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#999F94]">Account role</p>
                  <span className="mt-2 inline-flex rounded-full bg-[#E3E9DE] px-3 py-1 text-xs font-medium text-[#536B55]">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-12 border-t border-[#EAE9E2] pt-5 text-center text-[11px] tracking-wide text-[#A0A49B]">
            KAIZEN · PLAN. COLLABORATE. IMPROVE.
          </footer>
        </div>
      </section>
    </main>
  );
}
