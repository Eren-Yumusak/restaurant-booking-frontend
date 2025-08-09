// src/features/booking/BookingFlow.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createBooking } from "../../api/booking";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  email: z.string().email("Enter a valid email"),
  mobile: z.string().min(7, "Enter a valid phone"),
  specialRequests: z.string().max(300).optional(),
});

type FormValues = z.infer<typeof Schema>;

type Props = {
  restaurant: string;
  date: string;      // YYYY-MM-DD
  time: string;      // HH:MM:SS
  party: number;
  onBack: () => void;
};

export default function BookingFlow({ restaurant, date, time, party, onBack }: Props) {
  const [ref, setRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      firstName: "",
      surname: "",
      email: "",
      mobile: "",
      specialRequests: "",
    },
  });

  const m = useMutation({
    mutationFn: (values: FormValues) =>
      createBooking(restaurant, {
        VisitDate: date,
        VisitTime: time,
        PartySize: party,
        ChannelCode: "ONLINE",
        SpecialRequests: values.specialRequests,
        Customer: {
          FirstName: values.firstName,
          Surname: values.surname,
          Email: values.email,
          Mobile: values.mobile,
        },
      }),
    onSuccess: (data) => setRef(data.booking_reference),
  });

    if (ref) {
    return (
        <div className="rounded-xl border bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold">Booking confirmed 🎉</h2>

        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Reference:</span>
            <code className="rounded-md bg-gray-100 px-2 py-1 font-mono">{ref}</code>
            <button
            className="rounded-md border border-gray-300 bg-white text-gray-800 px-3 py-1 text-xs hover:bg-gray-50 transition-colors"
            onClick={async () => {
                try {
                await navigator.clipboard.writeText(ref);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
                } catch {}
            }}
            >
            {copied ? "Copied ✓" : "Copy"}
            </button>
        </div>

        <p className="text-sm">Date: {date} at {time} — Party {party}</p>

        <div className="flex gap-3 mt-4">
            <button
            className="rounded-md bg-black text-white px-4 py-2 hover:bg-black/90 transition-colors"
            onClick={onBack}
            >
            Make another booking
            </button>
        </div>
        </div>
    );
    }



  return (
    <form
      className="rounded-xl border bg-white p-6 space-y-4"
      onSubmit={handleSubmit((vals) => m.mutate(vals))}
    >
      <h2 className="text-lg font-semibold">Your details</h2>
      <p className="text-sm text-gray-600">Booking {date} at {time} — Party {party}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm">First name</span>
          <input className="mt-1 w-full rounded-md border px-3 py-2" {...register("firstName")} />
          {errors.firstName && <p className="text-xs text-red-600">{errors.firstName.message}</p>}
        </label>

        <label className="block">
          <span className="text-sm">Surname</span>
          <input className="mt-1 w-full rounded-md border px-3 py-2" {...register("surname")} />
          {errors.surname && <p className="text-xs text-red-600">{errors.surname.message}</p>}
        </label>

        <label className="block">
          <span className="text-sm">Email</span>
          <input type="email" className="mt-1 w-full rounded-md border px-3 py-2" {...register("email")} />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </label>

        <label className="block">
          <span className="text-sm">Mobile</span>
          <input className="mt-1 w-full rounded-md border px-3 py-2" {...register("mobile")} />
          {errors.mobile && <p className="text-xs text-red-600">{errors.mobile.message}</p>}
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm">Special requests (optional)</span>
          <textarea rows={3} className="mt-1 w-full rounded-md border px-3 py-2" {...register("specialRequests")} />
          {errors.specialRequests && <p className="text-xs text-red-600">{errors.specialRequests.message}</p>}
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-md border px-4 py-2"
          onClick={onBack}
          disabled={isSubmitting || m.isPending}
        >
          Back
        </button>
        <button
          type="submit"
          className="rounded-md bg-black text-white px-4 py-2 disabled:opacity-60"
          disabled={isSubmitting || m.isPending}
        >
          {m.isPending ? "Booking..." : "Confirm booking"}
        </button>
        {m.isError && (
          <span className="text-sm text-red-600">
            {/* @ts-ignore */}
            {(m.error?.response?.data?.detail) || "Booking failed"}
          </span>
        )}
      </div>
    </form>
  );
}
