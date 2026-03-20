"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import Link from "next/link";
import { X } from "lucide-react";

type AuthMode = "login" | "register";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: AuthMode;
  defaultCountry?: "Nigeria" | "International";
};

export default function AuthModal({
  isOpen,
  onClose,
  mode,
  defaultCountry = "International",
}: AuthModalProps) {
  const [activeMode, setActiveMode] = useState<AuthMode>(mode);
  const title = activeMode === "register" ? "Create your account" : "Sign in";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState<"Nigeria" | "International">(
    defaultCountry,
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => {
        setActiveMode(mode);
        setError(null);
        setBusy(false);
      }, 0);
      return () => clearTimeout(id);
    }
  }, [isOpen, mode]);

  const [oauthProviders, setOauthProviders] = useState<
    Array<{ id: string; label: string }>
  >([]);

  useEffect(() => {
    const load = async () => {
      const p = await getProviders().catch(() => null);
      const list = Object.values(p || {})
        .filter((x) => x && x.id !== "credentials")
        .map((x) => ({ id: x.id, label: `Continue with ${x.name}` }));
      setOauthProviders(list);
    };
    if (isOpen) {
      load();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      if (!normalizedEmail || !password) {
        setError("Email and password are required.");
        setBusy(false);
        return;
      }

      if (activeMode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email: normalizedEmail,
            password,
            country,
          }),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setError(data?.error || "Registration failed.");
          setBusy(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: true,
        callbackUrl: "/",
      });

      if (result && (result as any).error) {
        setError("Invalid credentials.");
        setBusy(false);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Close auth modal"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <div className="text-sm font-semibold">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded hover:bg-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid gap-3">
            {oauthProviders.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => signIn(p.id, { callbackUrl: "/" })}
                className="w-full py-3 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-sm font-semibold transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200" />
            <div className="text-xs text-zinc-500">or</div>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {activeMode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    Full name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-zinc-900 focus:outline-none focus:border-emerald-500/60 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) =>
                      setCountry(
                        e.target.value === "Nigeria"
                          ? "Nigeria"
                          : "International",
                      )
                    }
                    className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-zinc-900 focus:outline-none focus:border-emerald-500/60 transition-colors"
                  >
                    <option value="International">International</option>
                    <option value="Nigeria">Nigeria</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-zinc-900 focus:outline-none focus:border-emerald-500/60 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-zinc-900 focus:outline-none focus:border-emerald-500/60 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded transition-colors disabled:opacity-50"
            >
              {busy
                ? "Please wait..."
                : activeMode === "register"
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <div className="text-center text-sm text-zinc-600">
            {activeMode === "register" ? (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setActiveMode("login");
                }}
                className="text-emerald-700 hover:underline"
              >
                Already have an account? Sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setActiveMode("register");
                }}
                className="text-emerald-700 hover:underline"
              >
                Don&apos;t have an account? Create one
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
