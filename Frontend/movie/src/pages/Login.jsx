import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authservice";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { setToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const res = await login(data);
      if (!res.token) {
        throw new Error(res.message || "Login failed");
      }

      setToken({ token: res.token, role: res.role });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[2rem] border border-slate-200/70 bg-slate-950 p-8 text-white shadow-[0_25px_80px_-35px_rgba(15,23,42,0.75)]">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-300">
          Welcome Back
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Pick your next show and book it in a few clicks.
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-white/70">
          Cart access, bookings history, seat selection, aur checkout flow sab ek hi
          place par available hai. Login karke booking continue karo.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] bg-white/8 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Fast Access</p>
            <p className="mt-3 text-xl font-bold">Bookings, cart, seat selection</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/8 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Clean Flow</p>
            <p className="mt-3 text-xl font-bold">Simple auth with direct booking flow</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
            Login
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Sign in to continue
          </h2>
          {isAuthenticated ? (
            <p className="mt-2 text-sm text-emerald-700">
              You are already logged in. My Space open kar sakte ho.
            </p>
          ) : null}
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleLogin}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link
            to="/forgot-password"
            className="font-semibold text-slate-700 underline decoration-amber-400 underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>

        <p className="mt-5 text-sm text-slate-600">
          New here?{" "}
          <Link
            to="/register"
            className="font-bold text-slate-950 underline decoration-amber-400 underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
