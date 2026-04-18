import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/authservice";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !otp) {
      setError("Email aur OTP dono required hain.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const res = await resetPassword({ email, otp, password });
      setMessage(res.message || "Password reset successful.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Reset failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-amber-200 via-orange-100 to-white p-8 shadow-[0_25px_80px_-35px_rgba(251,146,60,0.35)]">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-orange-700">
          Reset Access
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
          Choose a fresh password and get back in.
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-slate-700">
          Mail me aaya 6-digit OTP enter karo, phir yahin se new password set hoga.
          Uske baad login screen par wapas redirect ho jaoge.
        </p>

        <div className="mt-8 space-y-4">
          <div className="rounded-[1.5rem] bg-white/70 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Security</p>
            <p className="mt-3 text-xl font-bold text-slate-950">
              Expired ya invalid OTP par reset allow nahi hoga.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white/70 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tip</p>
            <p className="mt-3 text-xl font-bold text-slate-950">
              Strong password choose karo and phir login karo.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
            Reset Password
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Enter OTP and set a new password
          </h2>
        </div>

        {message ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">OTP</span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">New Password</span>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Confirm Password
            </span>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Want to sign in instead?{" "}
          <Link
            to="/login"
            className="font-bold text-slate-950 underline decoration-amber-400 underline-offset-4"
          >
            Back to login
          </Link>
        </p>
      </div>
    </section>
  );
}
