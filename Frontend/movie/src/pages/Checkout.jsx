import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bookEvent } from "../../services/bookingService";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";
import { formatDate } from "../../utils/formatDate";

const buildDemoQrUrl = (amount) => {
  const upiPayload = `upi://pay?pa=moviemeet-demo@upi&pn=MovieMeet&am=${amount}&cu=INR&tn=MovieMeet ticket checkout`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(upiPayload)}`;
};

export default function Checkout() {
  const { isAuthenticated } = useAuth();
  const { items, totalItems, totalAmount, removeSeat, removeSeats, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentReady, setPaymentReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const groupedItems = useMemo(() => {
    const groupedMap = new Map();

    items.forEach((item) => {
      if (!groupedMap.has(item.eventId)) {
        groupedMap.set(item.eventId, {
          eventId: item.eventId,
          title: item.title,
          date: item.date,
          location: item.location,
          seats: [],
          total: 0,
        });
      }

      const entry = groupedMap.get(item.eventId);
      entry.seats.push(item);
      entry.total += Number(item.price ?? 0);
    });

    return Array.from(groupedMap.values());
  }, [items]);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!paymentReady) {
      setError("Please scan the QR and mark payment as completed before checkout.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const successfulCartKeys = [];
      const failedBookings = [];

      for (const item of items) {
        try {
          await bookEvent(item.eventId, item.seatNumber);
          successfulCartKeys.push(item.cartKey);
        } catch (err) {
          failedBookings.push(
            `${item.title} seat ${item.seatNumber}: ${
              err.response?.data?.message || "Booking failed."
            }`
          );
        }
      }

      if (successfulCartKeys.length > 0) {
        removeSeats(successfulCartKeys);
      }

      if (failedBookings.length === 0) {
        setSuccess(
          `${successfulCartKeys.length} seat${
            successfulCartKeys.length === 1 ? "" : "s"
          } booked successfully.`
        );
        setPaymentReady(false);
        return;
      }

      if (successfulCartKeys.length > 0) {
        setSuccess(
          `${successfulCartKeys.length} seat${
            successfulCartKeys.length === 1 ? "" : "s"
          } booked successfully.`
        );
      }

      setError(failedBookings.join(" "));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 px-6 py-8 text-white shadow-[0_25px_90px_-45px_rgba(15,23,42,0.8)] sm:px-8 lg:px-10">
        <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
          Cart Checkout
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
          Review your selected seats and complete the booking from one place.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
          This checkout includes a demo QR payment block. After payment, confirm the
          checkout and we will create the real bookings for the seats still available.
        </p>
      </div>

      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            Your cart is empty right now.
          </h2>
          <p className="mt-3 text-slate-600">
            Explore page se seats select karke cart mein add karo, phir yahan checkout
            complete karo.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            {!isAuthenticated ? (
              <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-amber-700">
                  Login Required
                </p>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                  Checkout complete karne ke liye login karo.
                </h2>
                <p className="mt-3 text-slate-600">
                  Cart seats safe rahenge. Login ke baad isi page par aake checkout finish
                  kar sakte ho.
                </p>
                <Link
                  to="/login"
                  className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Go to Login
                </Link>
              </div>
            ) : null}

            <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
                    Cart Items
                  </p>
                  <h2 className="text-3xl font-black tracking-tight text-slate-950">
                    Selected seats
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={clearCart}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:border-slate-950"
                >
                  Clear cart
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {groupedItems.map((group) => (
                  <article
                    key={group.eventId}
                    className="rounded-[1.7rem] border border-slate-200 bg-slate-50/80 p-5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-black tracking-tight text-slate-950">
                          {group.title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">
                          {formatDate(group.date)} at {group.location || "Venue to be announced"}
                        </p>
                      </div>
                      <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                        {group.seats.length} seat{group.seats.length === 1 ? "" : "s"}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {group.seats
                        .slice()
                        .sort((firstSeat, secondSeat) => firstSeat.seatNumber - secondSeat.seatNumber)
                        .map((seat) => (
                          <div
                            key={seat.cartKey}
                            className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2"
                          >
                            <span className="text-sm font-bold text-slate-900">
                              Seat {seat.seatNumber}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                              Rs {seat.price}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeSeat(seat.cartKey)}
                              className="text-xs font-bold uppercase tracking-[0.16em] text-rose-600 transition hover:text-rose-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)]">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
                Payment
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                Demo QR payment
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Scan this QR with any UPI app as a placeholder payment step. This is a
                demo QR for now, not a live payment gateway integration.
              </p>

              <div className="mt-6 rounded-[1.75rem] bg-gradient-to-br from-amber-100 via-orange-50 to-white p-5">
                <img
                  src={buildDemoQrUrl(totalAmount)}
                  alt="Demo payment QR"
                  className="mx-auto h-64 w-64 rounded-[1.5rem] border border-white bg-white p-3 shadow-sm"
                />
                <div className="mt-4 rounded-[1.3rem] bg-white/90 p-4 text-sm text-slate-700">
                  <p className="font-bold text-slate-950">UPI ID: moviemeet-demo@upi</p>
                  <p className="mt-2">Amount: Rs {totalAmount}</p>
                  <p className="mt-1">Tickets: {totalItems}</p>
                </div>
              </div>

              <label className="mt-5 flex items-start gap-3 rounded-[1.4rem] bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={paymentReady}
                  onChange={(event) => setPaymentReady(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-slate-950"
                />
                <span className="text-sm leading-6 text-slate-700">
                  I have completed the payment and I want to confirm these bookings now.
                </span>
              </label>
            </div>

            <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.45)]">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
                Summary
              </p>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Total tickets</span>
                  <span className="font-bold text-slate-950">{totalItems}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Price per seat</span>
                  <span className="font-bold text-slate-950">Rs 249</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-white">
                  <span>Total payable</span>
                  <span className="text-lg font-black">Rs {totalAmount}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={submitting || items.length === 0}
                onClick={handleCheckout}
                className="mt-5 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? "Processing checkout..." : "Pay and Confirm Booking"}
              </button>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:border-slate-950"
                >
                  Add More Seats
                </Link>
                <Link
                  to="/bookings"
                  className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:border-slate-950"
                >
                  Open My Bookings
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
