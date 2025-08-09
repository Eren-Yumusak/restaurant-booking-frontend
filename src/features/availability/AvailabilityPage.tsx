// src/features/availability/AvailabilityPage.tsx
import { useQuery } from "@tanstack/react-query";
import { searchAvailability } from "../../api/booking";
import { useState } from "react";
import BookingFlow from "../booking/BookingFlow";

type Props = { restaurant: string };

export default function AvailabilityPage({ restaurant }: Props) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [party, setParty] = useState(2);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const { data, isFetching, refetch, isError, error } = useQuery({
    queryKey: ["availability", restaurant, date, party],
    queryFn: () => searchAvailability(restaurant, date, party),
    enabled: false,
    retry: false,
  });

  if (selectedTime) {
    return (
      <BookingFlow
        restaurant={restaurant}
        date={date}
        time={selectedTime}
        party={party}
        onBack={() => setSelectedTime(null)}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <label className="block">
          <span className="text-sm">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm">Party size</span>
          <input
            type="number"
            min={1}
            max={8}
            value={party}
            onChange={(e) => setParty(parseInt(e.target.value || "1", 10))}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-md bg-black text-white px-4 py-2 disabled:opacity-60"
        >
          {isFetching ? "Searching..." : "Check availability"}
        </button>
      </div>

      {isError && (
        <pre className="text-red-600 text-xs whitespace-pre-wrap">
          {(() => {
            const anyErr = error as any;
            return JSON.stringify(anyErr?.response?.data ?? anyErr?.message ?? anyErr, null, 2);
          })()}
        </pre>
      )}

      {data && (
        <div className="space-y-2">
          <h2 className="text-lg font-medium">
            {data.visit_date} — {data.party_size} people ({data.total_slots} slots)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {data.available_slots.map((s) => (
              <button
                key={s.time}
                disabled={!s.available}
                className={`rounded-md border px-3 py-2 text-sm ${
                  s.available ? "bg-white hover:bg-gray-100" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                onClick={() => s.available && setSelectedTime(s.time)}
                title={s.available ? "Select this time" : "Unavailable"}
              >
                {s.time}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
