import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/authservice";
import { useAuth } from "../context/useAuth";

export default function Register() {
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      const res = await register(data);

      if (!res.token) {
        throw new Error(res.message || "Registration failed");
      }

      setToken({ token: res.token, role: res.role });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
            Register
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Join karke bookings track karo, seats save karo, aur movie plans manage karo.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleRegister}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Full Name</span>
            <input
              placeholder="Enter your name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            />
          </label>

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
              placeholder="Choose a strong password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-amber-200"
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-bold text-slate-950 underline decoration-amber-400 underline-offset-4"
          >
            Login here
          </Link>
        </p>
      </div>

      <div className="rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-sky-100 via-cyan-50 to-white p-8 shadow-[0_25px_80px_-35px_rgba(14,116,144,0.35)]">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-sky-700">
          Why Join
        </p>
        <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
          One account for browsing, seats, and bookings.
        </h2>
        <div className="mt-8 space-y-4">
          <div className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Bookings</p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              Keep all your selected events in one tidy list.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Seats</p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              Pick your seats, hold them in cart, and checkout when ready.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Flow</p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              Cleaner screens, stronger contrast, and a friendlier booking journey.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
