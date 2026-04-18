import { useState } from "react";
import { Link } from "react-router-dom";
import { createEvent } from "../../services/eventService";
import { useAuth } from "../context/useAuth";

export default function CreateEvent() {
  const [data, setData] = useState({
    title: "", date: "", location: "", seats: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await createEvent({
        ...data,
        seats: Number(data.seats),
      });

      setSuccess("Event created successfully.");
      setData({ title: "", date: "", location: "", seats: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Event create nahi ho paya.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)] backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
          Organizer Tool
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Ye screen hosts ke liye hai. Event create karne ke liye login zaroori hai.
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Client-side booking flow alag hai. Agar aap apna screening publish karna chahte ho,
          to pehle account access lo.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/login"
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Go to Login
          </Link>
          <Link
            to="/register"
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:border-slate-950"
          >
            Create Account
          </Link>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)] backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
          Admin Only
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Ye page sirf admin account ke liye available hai.
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Aap client-side booking flow use kar sakte ho. Agar aap admin email se login
          karoge, tab organizer tools unlock ho jayenge.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/dashboard"
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Go to My Space
          </Link>
          <Link
            to="/"
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:border-slate-950"
          >
            Explore Events
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
            Organizer Corner
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Create a new event
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Ye page un users ke liye hai jo apna event publish karna chahte hain.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {success}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleCreate}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Title</span>
            <input
              placeholder="Marvel Movie Marathon"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Date & Time</span>
            <input
              type="datetime-local"
              value={data.date}
              onChange={(e) => setData({ ...data, date: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Location</span>
            <input
              placeholder="PVR Cinemas, Noida"
              value={data.location}
              onChange={(e) => setData({ ...data, location: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Seats</span>
            <input
              type="number"
              min="1"
              placeholder="120"
              value={data.seats}
              onChange={(e) => setData({ ...data, seats: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>

      <div className="rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-orange-100 via-amber-50 to-white p-8 shadow-[0_25px_80px_-35px_rgba(251,146,60,0.35)]">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-orange-700">
          Publishing Tips
        </p>
        <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
          Make the event page feel ready before attendees arrive.
        </h2>
        <div className="mt-8 space-y-4">
          <div className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Title</p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              Clear naming helps users spot the event instantly.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Schedule</p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              Exact date and time reduce last-minute confusion.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Capacity</p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              Seat count keeps availability honest and bookings smooth.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
