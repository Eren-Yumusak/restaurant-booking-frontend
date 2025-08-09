import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getBooking, updateBooking, cancelBooking } from "../../api/booking";

type Booking = {
  booking_reference: string;
  booking_id: number;
  restaurant: string;
  visit_date: string;
  visit_time: string;
  party_size: number;
  status: string;
  special_requests?: string;
  customer?: {
    id: number;
    first_name?: string;
    surname?: string;
    email?: string;
    mobile?: string;
  };
  created_at: string;
  updated_at: string;
};

const CANCEL_REASONS = [
  { id: 1, label: "Customer Request" },
  { id: 2, label: "Restaurant Closure" },
  { id: 3, label: "Weather" },
  { id: 4, label: "Emergency" },
  { id: 5, label: "No Show" },
];

type Props = { restaurant: string };

export default function ManageBookingPage({ restaurant }: Props) {
  const [ref, setRef] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [party, setParty] = useState<number | "">("");
  const [requests, setRequests] = useState("");
  const [reasonId, setReasonId] = useState<number>(1);

  // Lookup
  const mLookup = useMutation({
    mutationFn: (r: string) => getBooking(restaurant, r),
    onSuccess: (data: Booking) => {
      setBooking(data);
      setParty(data.party_size);
      setRequests(data.special_requests ?? "");
    },
  });

  // Update
  const mUpdate = useMutation({
    mutationFn: () =>
      updateBooking(restaurant, booking!.booking_reference, {
        PartySize: typeof party === "number" ? party : undefined,
        SpecialRequests: requests || undefined,
      }),
    onSuccess: (data: any) => {
      // Soft refresh UI; you could re-fetch getBooking here if you prefer
      setBooking((prev) =>
        prev
          ? {
              ...prev,
              party_size: typeof party === "number" ? party : prev.party_size,
              special_requests: requests,
              updated_at: new Date().toISOString(),
            }
          : prev
      );
    },
  });

  // Cancel
  const mCancel = useMutation({
    mutationFn: () => cancelBooking(restaurant, booking!.booking_reference, reasonId),
    onSuccess: () => {
      setBooking((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
    },
  });

  return (
    <section className="space-y-6">
      <div className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Find your booking</h2>
        <div className="mt-3 flex gap-3">
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value.trim())}
            placeholder="Enter booking reference (e.g., ABC1234)"
            className="w-72 rounded-md border px-3 py-2"
          />
          <button
            className="rounded-md bg-black text-white px-4 py-2 disabled:opacity-60"
            onClick={() => ref && mLookup.mutate(ref)}
            disabled={mLookup.isPending || !ref}
          >
            {mLookup.isPending ? "Looking up..." : "Lookup"}
          </button>
        </div>
        {mLookup.isError && (
          <p className="mt-2 text-sm text-red-600">
            {/* @ts-ignore */}
            {(mLookup.error?.response?.data?.detail) || "Booking not found"}
          </p>
        )}
      </div>

      {booking && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Details card */}
          <div className="rounded-xl border bg-white p-6 space-y-3">
            <h3 className="text-base font-semibold">Booking details</h3>
            <dl className="grid grid-cols-3 gap-y-1 text-sm">
              <dt className="text-gray-500">Reference</dt>
              <dd className="col-span-2 font-mono">{booking.booking_reference}</dd>

              <dt className="text-gray-500">Status</dt>
              <dd className="col-span-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                    booking.status === "cancelled"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-green-50 text-green-700 border-green-200"
                  }`}
                >
                  {booking.status}
                </span>
              </dd>

              <dt className="text-gray-500">When</dt>
              <dd className="col-span-2">
                {booking.visit_date} at {booking.visit_time}
              </dd>

              <dt className="text-gray-500">Party</dt>
              <dd className="col-span-2">{booking.party_size}</dd>

              <dt className="text-gray-500">Customer</dt>
              <dd className="col-span-2">
                {booking.customer?.first_name} {booking.customer?.surname} — {booking.customer?.email}
              </dd>

              <dt className="text-gray-500">Requests</dt>
              <dd className="col-span-2">{booking.special_requests || "—"}</dd>
            </dl>
          </div>

          {/* Update / Cancel card */}
          <div className="rounded-xl border bg-white p-6 space-y-4">
            <h3 className="text-base font-semibold">Update or cancel</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm">Party size</span>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={party}
                  onChange={(e) => {
                    const v = e.target.value;
                    setParty(v === "" ? "" : Math.min(8, Math.max(1, Number(v))));
                  }}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm">Special requests</span>
                <textarea
                  rows={3}
                  value={requests}
                  onChange={(e) => setRequests(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => mUpdate.mutate()}
                className="rounded-md bg-black text-white px-4 py-2 disabled:opacity-60"
                disabled={mUpdate.isPending || booking.status === "cancelled"}
              >
                {mUpdate.isPending ? "Updating..." : "Save changes"}
              </button>
              {mUpdate.isError && (
                <span className="text-sm text-red-600">
                  {/* @ts-ignore */}
                  {(mUpdate.error?.response?.data?.detail) || "Update failed"}
                </span>
              )}
              {mUpdate.isSuccess && <span className="text-sm text-green-700">Saved ✓</span>}
            </div>

            <hr className="my-2" />

            <div className="space-y-2">
              <label className="block">
                <span className="text-sm">Cancellation reason</span>
                <select
                  value={reasonId}
                  onChange={(e) => setReasonId(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  {CANCEL_REASONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id} — {r.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => mCancel.mutate()}
                  className="rounded-md border border-red-600 text-red-700 px-4 py-2 hover:bg-red-50 disabled:opacity-60"
                  disabled={mCancel.isPending || booking.status === "cancelled"}
                >
                  {mCancel.isPending ? "Cancelling..." : "Cancel booking"}
                </button>
                {mCancel.isError && (
                  <span className="text-sm text-red-600">
                    {/* @ts-ignore */}
                    {(mCancel.error?.response?.data?.detail) || "Cancellation failed"}
                  </span>
                )}
                {mCancel.isSuccess && <span className="text-sm text-green-700">Cancelled ✓</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
