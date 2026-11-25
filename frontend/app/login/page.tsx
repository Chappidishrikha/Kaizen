
"use client";

import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      sessionStorage.setItem("kaizen_token", data.token);
      sessionStorage.setItem("kaizen_user", JSON.stringify(data.user));

      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen w-full bg-white md:grid-cols-2">

      {/* Left branding panel */}
      <section className="relative min-h-[380px] overflow-hidden bg-[#F8F5EF] md:min-h-screen">
        <img
          src="/kaizen-brand-panel.png"
          alt="Kaizen by Shrikha"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </section>

      {/* Right login panel */}
      <section className="flex min-h-[600px] items-center justify-center bg-[#FAFAF8] px-7 py-16 sm:px-12 md:min-h-screen lg:px-16 xl:px-24">

        <div className="w-full max-w-[420px]">

          <div className="mb-8">
            <h1 className="font-serif text-[27px] font-semibold tracking-tight text-[#253039]">
              Welcome back
            </h1>

            <p className="mt-2 text-[14px] text-[#71808A]">
              Sign in to continue to Kaizen.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-[#29343D]">
                Email
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-12 w-full rounded-xl border border-[#D9DEE1] bg-transparent px-4 text-sm text-[#29343D] outline-none transition focus:border-[#78866D] focus:ring-2 focus:ring-[#78866D]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#29343D]">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-[#D9DEE1] bg-transparent px-4 pr-16 text-sm text-[#29343D] outline-none transition focus:border-[#78866D] focus:ring-2 focus:ring-[#78866D]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#78866D]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-[52px] w-full rounded-xl bg-[#426F59] text-sm font-semibold text-white transition hover:bg-[#355D49] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          <p className="mt-7 text-center text-xs text-[#849099]">
            Secure access to your Kaizen workspace.
          </p>

        </div>
      </section>
    </main>
  );
}
