import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBookings } from "../../services/bookingService";
import { getEvents } from "../../services/eventService";
import Loader from "../components/Loader";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";
import { formatDate } from "../../utils/formatDate";

export default function Dashboard() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventError, setEventError] = useState("");
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setEventError("");
        setBookingError("");

        const eventsData = await getEvents();
        if (isMounted) {
          setEvents(Array.isArray(eventsData) ? eventsData : []);
        }

        if (isAuthenticated) {
          try {
            const bookingsData = await getBookings();
            if (isMounted) {
              setBookings(Array.isArray(bookingsData) ? bookingsData : []);
            }
          } catch (err) {
            if (isMounted) {
              setBookingError(
                err.response?.data?.message || "Bookings abhi dashboard par load nahi ho pa rahi."
              );
            }
          }
        } else if (isMounted) {
          setBookings([]);
        }
      } catch (err) {
        if (isMounted) {
          setEventError(err.response?.data?.message || "Dashboard events load nahi ho paye.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const now = Date.now();
  const upcomingEvents = events.filter((event) => {
    const eventTime = new Date(event.date).getTime();
    return Number.isFinite(eventTime) && eventTime >= now;
  });
  const featuredEvents = (upcomingEvents.length > 0 ? upcomingEvents : events).slice(0, 3);
  const nextEvent = (upcomingEvents.length > 0 ? upcomingEvents : events)[0];
  const upcomingBookings = bookings
    .filter((booking) => {
      const bookingTime = new Date(booking.eventId?.date).getTime();
      return Number.isFinite(bookingTime) && bookingTime >= now;
    })
    .sort(
      (firstBooking, secondBooking) =>
        new Date(firstBooking.eventId?.date).getTime() -
        new Date(secondBooking.eventId?.date).getTime()
    );
  const nextBooking = upcomingBookings[0] || bookings[0];
  const bookedSeats = bookings.length;

  const statCards = [
    {
      label: "Live Events",
      value: events.length,
      tone: "from-amber-200 to-orange-100",
      text: "Shows you can browse right now",
    },
    {
      label: "Upcoming",
      value: upcomingEvents.length,
      tone: "from-sky-200 to-cyan-100",
      text: "Fresh screenings still ahead",
    },
    {
      label: "My Bookings",
      value: isAuthenticated ? bookedSeats : "Locked",
      tone: "from-emerald-200 to-lime-100",
      text: isAuthenticated ? "Confirmed tickets in your account" : "Login to unlock your tickets",
    },
    {
      label: "Cart Seats",
      value: totalItems,
      tone: "from-violet-200 to-fuchsia-100",
      text: isAuthenticated
        ? "Selected seats waiting for checkout"
        : "Login to save seats into cart",
    },
  ];

  const actionCards = [
    {
      eyebrow: "01",
      title: "Browse live screenings",
      description: "Jump back to explore and pick a show that matches your plan.",
      to: "/",
      cta: "Explore Now",
    },
    {
      eyebrow: "02",
      title: "Track your booked shows",
      description: "Review confirmed seats and revisit the event details in one place.",
      to: isAuthenticated ? "/bookings" : "/login",
      cta: isAuthenticated ? "Open Bookings" : "Unlock Bookings",
    },
    {
      eyebrow: "03",
      title: "Checkout your cart",
      description: `Review ${totalItems} selected seat${totalItems === 1 ? "" : "s"} and finish payment with the QR checkout flow.`,
      to: "/checkout",
      cta: "Open Cart",
    },
  ];

  if (isAdmin) {
    actionCards.push({
      eyebrow: "04",
      title: "Open organizer tools",
      description: "Create a new event listing and manage the publishing side from here.",
      to: "/create",
      cta: "Create Event",
    });
  }

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-8 text-white shadow-[0_25px_90px_-45px_rgba(15,23,42,0.8)] sm:px-8 lg:px-10">
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute right-0 top-6 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
              Client Hub
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              Your place to track tickets, cart seats, and the next movie plan.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              {isAuthenticated
                ? "You are signed in. Review upcoming bookings, finish checkout, and jump into fresh screenings anytime."
                : "Explore the platform freely. Login to save seats, checkout tickets, and unlock your personal booking space."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/"
                className="rounded-full bg-amber-300 px-6 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-200"
              >
                Explore Events
              </Link>
              <Link
                to={isAuthenticated ? "/bookings" : "/login"}
                className="rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/12"
              >
                {isAuthenticated ? "My Bookings" : "Login to Continue"}
              </Link>
              {isAdmin ? (
                <Link
                  to="/create"
                  className="rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/12"
                >
                  Organizer Tools
                </Link>
              ) : null}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-6 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/45">
              {isAuthenticated && nextBooking ? "Next Ticket" : "Next Highlight"}
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight">
              {isAuthenticated && nextBooking?.eventId?.title
                ? nextBooking.eventId.title
                : nextEvent?.title || "Fresh events are being prepared"}
            </h2>
            <p className="mt-3 text-sm text-white/70">
              {isAuthenticated && nextBooking?.eventId
                ? `${formatDate(nextBooking.eventId.date)} at ${nextBooking.eventId.location || "Venue to be announced"}${nextBooking.seatNumber ? `, seat ${nextBooking.seatNumber}` : ""}`
                : nextEvent
                  ? `${formatDate(nextEvent.date)} at ${nextEvent.location || "Venue to be announced"}`
                  : "Fresh screenings will appear here as soon as they are available."}
            </p>
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-black/15 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">Session</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {isAuthenticated ? "Member mode active" : "Guest mode active"}
                </p>
              </div>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-100"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/register"
                  className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-100"
                >
                  Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? <Loader label="Dashboard insights load ho rahe hain..." /> : null}

      {eventError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {eventError}
        </div>
      ) : null}

      {bookingError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {bookingError}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article
            key={card.label}
            className={`rounded-[1.75rem] border border-slate-200/70 bg-gradient-to-br ${card.tone} p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.35)]`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              {card.label}
            </p>
            <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              {card.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{card.text}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
                Quick Actions
              </p>
              <h2 className="text-3xl font-black tracking-tight text-slate-950">
                What would you like to do next?
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Fast routes for viewers and attendees
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            {actionCards.map((action) => (
              <Link
                key={action.title}
                to={action.to}
                className="group rounded-[1.6rem] border border-slate-200 bg-slate-50/90 p-5 transition hover:-translate-y-0.5 hover:border-slate-950 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                      {action.eyebrow}
                    </p>
                    <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">
                      {action.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      {action.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition group-hover:bg-amber-400 group-hover:text-slate-950">
                    {action.cta}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)] backdrop-blur">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
              Upcoming Lineup
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Next events to watch
            </h2>

            <div className="mt-5 space-y-3">
              {featuredEvents.length > 0 ? (
                featuredEvents.map((event, index) => (
                  <div
                    key={event._id}
                    className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                          Slot {index + 1}
                        </p>
                        <h3 className="mt-2 text-lg font-black tracking-tight text-slate-950">
                          {event.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {formatDate(event.date)}
                        </p>
                      </div>
                      <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                        {Number(event.seats ?? 0)} seats
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {event.location || "Venue to be announced"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center text-sm text-slate-600">
                  Upcoming lineup abhi empty hai. Explore page par fresh screenings milte hi yahan dikhengi.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)] backdrop-blur">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
              Personal Snapshot
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              {isAuthenticated ? "Your account pulse" : "Unlock your personal panel"}
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.4rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  Bookings
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {isAuthenticated ? bookedSeats : 0}
                </p>
              </div>
              <div className="rounded-[1.4rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  Next Move
                </p>
                <p className="mt-2 text-base font-bold text-slate-950">
                  {isAuthenticated
                    ? bookedSeats > 0
                      ? "Review your next confirmed show"
                      : "Book your first event from Explore"
                    : "Login and unlock bookings history"}
                </p>
              </div>
              <div className="rounded-[1.4rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  Cart Seats
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">{totalItems}</p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] bg-gradient-to-r from-amber-100 via-orange-50 to-white p-5">
              <p className="text-sm leading-7 text-slate-700">
                {isAuthenticated
                  ? "You are all set. Keep browsing new screenings, save seats in cart, and come back here to stay on top of your plans."
                  : "Guest mode is great for browsing, but this space becomes much more useful once you sign in and start booking tickets."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
