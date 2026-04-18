import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getEvents } from "../../services/eventService";
import { getSeatAvailability } from "../../services/bookingService";
import EventCard from "../components/EventCard";
import Loader from "../components/Loader";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [activeSeatEventId, setActiveSeatEventId] = useState("");
  const [seatMap, setSeatMap] = useState({ totalSeats: 0, bookedSeats: [], availableSeats: 0 });
  const [seatLoading, setSeatLoading] = useState(false);
  const [seatError, setSeatError] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const { isAuthenticated } = useAuth();
  const { addSeats, getSeatsForEvent, totalItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Events load nahi ho paye.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const loadSeatMap = async (event) => {
    setActiveSeatEventId(event._id);
    setSeatError("");
    setSelectedSeats([]);

    try {
      setSeatLoading(true);
      const data = await getSeatAvailability(event._id);
      setSeatMap({
        totalSeats: Number(data.totalSeats ?? event.totalSeats ?? event.seats ?? 0),
        bookedSeats: Array.isArray(data.bookedSeats) ? data.bookedSeats : [],
        availableSeats: Number(data.availableSeats ?? event.seats ?? 0)
      });
    } catch (err) {
      setSeatMap({
        totalSeats: Number(event.totalSeats ?? event.seats ?? 0),
        bookedSeats: [],
        availableSeats: Number(event.seats ?? 0)
      });
      setSeatError(
        err.response?.status === 404
          ? "Seat API abhi available nahi hai. Backend restart karke phir try karo."
          : err.response?.data?.message || "Seat map load nahi ho pa raha."
      );
    } finally {
      setSeatLoading(false);
    }
  };

  const handleOpenSeatPicker = async (event) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (activeSeatEventId === event._id) {
      setActiveSeatEventId("");
      setSeatError("");
      setSelectedSeats([]);
      return;
    }

    setFeedback("");
    await loadSeatMap(event);
  };

  const handleToggleSeat = (seatNumber) => {
    setSelectedSeats((currentSeats) => {
      if (currentSeats.includes(seatNumber)) {
        return currentSeats.filter((seat) => seat !== seatNumber);
      }

      return [...currentSeats, seatNumber].sort((firstSeat, secondSeat) => firstSeat - secondSeat);
    });
  };

  const handleAddToCart = (event) => {
    if (selectedSeats.length === 0) {
      setSeatError("Please select at least one seat first.");
      return;
    }

    setFeedback("");
    setSeatError("");

    const addedCount = addSeats(event, selectedSeats);

    if (addedCount === 0) {
      setSeatError("Selected seats are already in your cart.");
      return;
    }

    const duplicateCount = selectedSeats.length - addedCount;
    const baseMessage = `${addedCount} seat${addedCount === 1 ? "" : "s"} added to cart.`;
    const duplicateMessage =
      duplicateCount > 0
        ? ` ${duplicateCount} seat${duplicateCount === 1 ? "" : "s"} were already there.`
        : "";

    setFeedback(`${baseMessage}${duplicateMessage} Open cart from the navbar to checkout.`);
    setSelectedSeats([]);
    setActiveSeatEventId("");
  };

  const totalSeats = events.reduce(
    (count, event) => count + Number(event.seats ?? 0),
    0
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-amber-200 via-orange-100 to-white px-6 py-8 shadow-[0_25px_90px_-45px_rgba(15,23,42,0.55)] sm:px-8 lg:px-10 lg:py-10">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-300/25 blur-3xl" />
        <div className="absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-orange-400/20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.32em] text-slate-700 shadow-sm">
              Now Booking
            </p>
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Find your next movie night, choose seats, and checkout in minutes.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
              Explore fresh screenings, save seats to cart, and track every confirmed
              booking from one smooth client-side flow.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Open My Space
              </Link>
              <Link
                to={isAuthenticated ? "/bookings" : "/login"}
                className="rounded-full border border-slate-300 bg-white/70 px-6 py-3 text-sm font-bold text-slate-900 transition hover:border-slate-950 hover:bg-white"
              >
                {isAuthenticated ? "My Bookings" : "Login to Book"}
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/20">
              <p className="text-xs uppercase tracking-[0.22em] text-white/55">
                Live Events
              </p>
              <p className="mt-3 text-4xl font-black">{events.length}</p>
            </div>
            <div className="rounded-[1.75rem] bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Available Seats
              </p>
              <p className="mt-3 text-4xl font-black text-slate-950">{totalSeats}</p>
            </div>
            <div className="rounded-[1.75rem] bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Cart Seats
              </p>
              <p className="mt-3 text-4xl font-black text-slate-950">{totalItems}</p>
            </div>
          </div>
        </div>
      </section>

      {feedback ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {feedback}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
              Client Picks
            </p>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              Pick a screening that fits your plan
            </h2>
          </div>
          {!isAuthenticated ? (
            <p className="text-sm text-slate-600">
              Book karne ke liye pehle login karo.
            </p>
          ) : totalItems > 0 ? (
            <Link
              to="/checkout"
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:border-slate-950"
            >
              Open Cart ({totalItems})
            </Link>
          ) : null}
        </div>

        {loading ? <Loader label="Events load ho rahe hain..." /> : null}

        {!loading && events.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center text-slate-600">
            Abhi koi live screening available nahi hai. Thodi der baad phir check karo.
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onOpenSeatPicker={handleOpenSeatPicker}
              onBook={handleAddToCart}
              onCloseSeatPicker={() => {
                setActiveSeatEventId("");
                setSelectedSeats([]);
                setSeatError("");
              }}
              onSelectSeat={handleToggleSeat}
              isBooking={false}
              isSeatPickerOpen={activeSeatEventId === event._id}
              seatMap={activeSeatEventId === event._id ? seatMap : null}
              seatLoading={activeSeatEventId === event._id && seatLoading}
              seatError={activeSeatEventId === event._id ? seatError : ""}
              selectedSeats={activeSeatEventId === event._id ? selectedSeats : []}
              cartSeatNumbers={getSeatsForEvent(event._id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
