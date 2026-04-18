import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBookings } from "../../services/bookingService";
import Loader from "../components/Loader";
import { useAuth } from "../context/useAuth";
import { formatDate } from "../../utils/formatDate";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadBookings = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getBookings();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Bookings load nahi ho payi.");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)] backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
          My Bookings
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Booking history dekhne ke liye login karo.
        </h1>
        <p className="mt-3 text-slate-600">
          Once you sign in, yahin par saare booked events visible honge.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Login to continue
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
            Saved Tickets
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            My bookings
          </h1>
        </div>
        <Link
          to="/"
          className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:border-slate-950"
        >
          Browse more events
        </Link>
      </div>

      {loading ? <Loader label="Bookings load ho rahi hain..." /> : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      {!loading && bookings.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center text-slate-600">
          Abhi tak koi booking nahi hai. Home page se event select karke booking karo.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {bookings.map((booking) => (
          <article
            key={booking._id}
            className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
              Confirmed Booking
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
              {booking.eventId?.title || "Event unavailable"}
            </h2>

            <div className="mt-5 grid gap-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">
                  Seat
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {booking.seatNumber ? `Seat ${booking.seatNumber}` : "Seat not assigned"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  Date
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {formatDate(booking.eventId?.date)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  Location
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {booking.eventId?.location || "Venue to be announced"}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
