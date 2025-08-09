import { useState } from "react";
import AvailabilityPage from "./features/availability/AvailabilityPage";
import ManageBookingPage from "./features/manage/ManageBookingPage";

export default function App() {
  const [restaurant] = useState("TheHungryUnicorn");
  const [tab, setTab] = useState<"book" | "manage">("book");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-semibold">Restaurant Booking</h1>
        <p className="text-sm text-gray-600">Demo for {restaurant}</p>

        <div className="mt-4 inline-flex rounded-lg border bg-white p-1">
          <button
            onClick={() => setTab("book")}
            className={`px-4 py-2 text-sm rounded-md ${tab === "book" ? "bg-black text-white" : ""}`}
          >
            Book a table
          </button>
          <button
            onClick={() => setTab("manage")}
            className={`px-4 py-2 text-sm rounded-md ${tab === "manage" ? "bg-black text-white" : ""}`}
          >
            Manage booking
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        {tab === "book" ? (
          <AvailabilityPage restaurant={restaurant} />
        ) : (
          <ManageBookingPage restaurant={restaurant} />
        )}
      </main>
    </div>
  );
}
