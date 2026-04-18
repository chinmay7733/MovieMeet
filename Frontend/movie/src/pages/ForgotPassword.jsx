import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../../services/authservice";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      const res = await forgotPassword({ email });
      setMessage(
        res.message ||
          "If an account exists with this email, a password reset OTP has been sent."
      );
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 900);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-8 text-white shadow-[0_25px_80px_-35px_rgba(15,23,42,0.75)]">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-300">
          Password Help
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Reset access without losing your account.
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-white/70">
          Email address enter karo. Agar account exist karta hai to 6-digit OTP inbox me
          chala jayega.
        </p>

        <div className="mt-8 space-y-4">
          <div className="rounded-[1.5rem] bg-white/8 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Step 1</p>
            <p className="mt-3 text-xl font-bold">Request the OTP</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/8 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Step 2</p>
            <p className="mt-3 text-xl font-bold">Enter OTP and choose a new password</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
            Forgot Password
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Send OTP
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Remembered it?{" "}
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
