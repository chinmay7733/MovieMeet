import { formatDate } from "../../utils/formatDate";

const getRowLabel = (rowIndex) => {
  let label = "";
  let currentIndex = rowIndex;

  do {
    label = String.fromCharCode(65 + (currentIndex % 26)) + label;
    currentIndex = Math.floor(currentIndex / 26) - 1;
  } while (currentIndex >= 0);

  return label;
};

const getSeatsPerRow = (totalSeats) => {
  if (totalSeats >= 90) {
    return 10;
  }

  if (totalSeats >= 48) {
    return 8;
  }

  return 6;
};

export default function EventCard({
  event,
  onOpenSeatPicker,
  onBook,
  onCloseSeatPicker,
  onSelectSeat,
  isBooking = false,
  isSeatPickerOpen = false,
  seatMap = null,
  seatLoading = false,
  seatError = "",
  selectedSeats = [],
  cartSeatNumbers = []
}) {
  const seatsLeft = Number(event.seats ?? 0);
  const totalSeats = Number(seatMap?.totalSeats ?? event.totalSeats ?? event.seats ?? 0);
  const bookedSeats = new Set(
    Array.isArray(seatMap?.bookedSeats) ? seatMap.bookedSeats.map(Number) : []
  );
  const cartSeats = new Set(cartSeatNumbers.map(Number));
  const soldOut = seatsLeft <= 0;
  const seatNumbers = Array.from({ length: totalSeats }, (_, index) => index + 1);
  const seatsPerRow = getSeatsPerRow(totalSeats);
  const theatreRows = Array.from(
    { length: Math.ceil(seatNumbers.length / seatsPerRow) },
    (_, rowIndex) => {
      const rowSeats = seatNumbers
        .slice(rowIndex * seatsPerRow, (rowIndex + 1) * seatsPerRow)
        .map((seatNumber, seatIndex) => ({
          seatNumber,
          label: `${getRowLabel(rowIndex)}${seatIndex + 1}`,
        }));
      const splitIndex = Math.ceil(rowSeats.length / 2);

      return {
        rowLabel: getRowLabel(rowIndex),
        leftSeats: rowSeats.slice(0, splitIndex),
        rightSeats: rowSeats.slice(splitIndex),
      };
    }
  );
  const selectedSeatLabels = theatreRows.flatMap((row) =>
    [...row.leftSeats, ...row.rightSeats]
      .filter((seat) => selectedSeats.includes(seat.seatNumber))
      .map((seat) => seat.label)
  );

  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.55)] backdrop-blur">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-sky-500" />

      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-amber-700">
            Live Event
          </p>
          <h3 className="text-2xl font-black tracking-tight text-slate-900">
            {event.title}
          </h3>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] ${
            soldOut
              ? "bg-rose-100 text-rose-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {soldOut ? "Sold Out" : `${seatsLeft} Seats Left`}
        </div>
      </div>

      <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
            Schedule
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {formatDate(event.date)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
            Venue
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {event.location || "Venue to be announced"}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={soldOut || isBooking}
        onClick={() => onOpenSeatPicker(event)}
        className={`mt-6 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold transition ${
          soldOut || isBooking
            ? "cursor-not-allowed bg-slate-200 text-slate-500"
            : "bg-slate-950 text-white hover:-translate-y-0.5 hover:bg-slate-800"
        }`}
      >
        {soldOut
          ? "No Seats Available"
          : isSeatPickerOpen
            ? "Hide Seat Picker"
            : "Select Seats"}
      </button>

      {isSeatPickerOpen ? (
        <div className="mt-5 space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/90 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                Choose Your Seat
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {seatLoading
                  ? "Loading live seat map..."
                  : `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left out of ${totalSeats}.`}
              </p>
            </div>
            <button
              type="button"
              onClick={onCloseSeatPicker}
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
            >
              Close
            </button>
          </div>

          {seatError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              {seatError}
            </div>
          ) : null}

          {!seatLoading && seatNumbers.length > 0 ? (
            <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-slate-950 text-white shadow-inner">
              <div className="bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_38%),linear-gradient(180deg,_#0f172a_0%,_#111827_50%,_#1e293b_100%)] px-3 py-5 sm:px-4">
                <div className="mx-auto max-w-xl">
                  <div className="mx-auto w-[88%] rounded-b-[999px] rounded-t-[1rem] border border-white/20 bg-gradient-to-b from-white to-slate-200 px-4 py-2 text-center text-[10px] font-black uppercase tracking-[0.34em] text-slate-900 shadow-[0_18px_50px_-12px_rgba(255,255,255,0.45)]">
                    Screen
                  </div>
                  <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
                    Theatre View
                  </p>

                  <div className="mt-5 max-h-80 space-y-2 overflow-y-auto rounded-[1.5rem] bg-white/5 px-2 py-3 ring-1 ring-white/10">
                    {theatreRows.map((row) => (
                      <div
                        key={row.rowLabel}
                        className="flex items-center gap-2 sm:gap-3"
                      >
                        <div className="w-6 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white/55 sm:w-8 sm:text-xs">
                          {row.rowLabel}
                        </div>

                        <div className="flex min-w-max flex-1 items-center justify-center gap-3 sm:gap-6">
                          <div className="flex gap-1.5 sm:gap-2">
                            {row.leftSeats.map((seat) => {
                              const isBooked = bookedSeats.has(seat.seatNumber);
                              const isInCart = cartSeats.has(seat.seatNumber);
                              const isSelected = selectedSeats.includes(seat.seatNumber);

                              return (
                                <button
                                  key={seat.seatNumber}
                                  type="button"
                                  disabled={isBooked || isInCart || isBooking}
                                  onClick={() => onSelectSeat(seat.seatNumber)}
                                  aria-label={`Seat ${seat.label}`}
                                  className={`h-10 min-w-10 rounded-t-xl rounded-b-md border px-1 text-[10px] font-black transition sm:h-11 sm:min-w-11 sm:text-xs ${
                                    isBooked
                                      ? "cursor-not-allowed border-slate-600 bg-slate-700 text-slate-300"
                                      : isInCart
                                        ? "cursor-not-allowed border-sky-300/50 bg-sky-300/20 text-sky-100"
                                      : isSelected
                                        ? "border-amber-300 bg-amber-300 text-slate-950 shadow-[0_0_18px_rgba(251,191,36,0.35)]"
                                        : "border-white/12 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50"
                                  }`}
                                >
                                  {seat.label}
                                </button>
                              );
                            })}
                          </div>

                          <div className="h-10 w-4 rounded-full border border-dashed border-white/10 bg-white/5 sm:w-6" />

                          <div className="flex gap-1.5 sm:gap-2">
                            {row.rightSeats.map((seat) => {
                              const isBooked = bookedSeats.has(seat.seatNumber);
                              const isInCart = cartSeats.has(seat.seatNumber);
                              const isSelected = selectedSeats.includes(seat.seatNumber);

                              return (
                                <button
                                  key={seat.seatNumber}
                                  type="button"
                                  disabled={isBooked || isInCart || isBooking}
                                  onClick={() => onSelectSeat(seat.seatNumber)}
                                  aria-label={`Seat ${seat.label}`}
                                  className={`h-10 min-w-10 rounded-t-xl rounded-b-md border px-1 text-[10px] font-black transition sm:h-11 sm:min-w-11 sm:text-xs ${
                                    isBooked
                                      ? "cursor-not-allowed border-slate-600 bg-slate-700 text-slate-300"
                                      : isInCart
                                        ? "cursor-not-allowed border-sky-300/50 bg-sky-300/20 text-sky-100"
                                      : isSelected
                                        ? "border-amber-300 bg-amber-300 text-slate-950 shadow-[0_0_18px_rgba(251,191,36,0.35)]"
                                        : "border-white/12 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50"
                                  }`}
                                >
                                  {seat.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="hidden w-8 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white/30 sm:block">
                          {row.rowLabel}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {!seatLoading && seatNumbers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-600">
              Seat layout abhi available nahi hai.
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
            <span className="rounded-full bg-white px-3 py-1">White: available</span>
            <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-600">
              Grey: booked
            </span>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
              Blue: in cart
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
              Amber: selected
            </span>
          </div>

          {selectedSeatLabels.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
              Selected: {selectedSeatLabels.join(", ")}
            </div>
          ) : null}

          <button
            type="button"
            disabled={soldOut || seatLoading || isBooking || selectedSeats.length === 0}
            onClick={() => onBook(event)}
            className={`w-full rounded-2xl px-4 py-3 text-sm font-bold transition ${
              soldOut || seatLoading || isBooking || selectedSeats.length === 0
                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                : "bg-amber-500 text-slate-950 hover:-translate-y-0.5 hover:bg-amber-400"
            }`}
          >
            {isBooking
              ? "Updating..."
              : selectedSeats.length > 0
                ? `Add ${selectedSeats.length} Seat${selectedSeats.length === 1 ? "" : "s"} to Cart`
                : "Select seat(s) to continue"}
          </button>
        </div>
      ) : null}
    </article>
  );
}
