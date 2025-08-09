import { api, form } from "./client";

export type AvailabilitySlot = {
  time: string;
  available: boolean;
  max_party_size: number;
  current_bookings: number;
};

export type AvailabilityResponse = {
  restaurant: string;
  restaurant_id: number;
  visit_date: string;
  party_size: number;
  channel_code: string;
  available_slots: AvailabilitySlot[];
  total_slots: number;
};

export async function searchAvailability(restaurant: string, visitDate: string, partySize: number) {
  const { data } = await api.post<AvailabilityResponse>(
    `/api/ConsumerApi/v1/Restaurant/${restaurant}/AvailabilitySearch`,
    form({ VisitDate: visitDate, PartySize: partySize, ChannelCode: "ONLINE" }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return data;
}

export type CreateBookingPayload = {
  VisitDate: string;
  VisitTime: string;
  PartySize: number;
  ChannelCode: string;
  SpecialRequests?: string;
  Customer?: {
    FirstName?: string;
    Surname?: string;
    Email?: string;
    Mobile?: string;
    Phone?: string;
    MobileCountryCode?: string;
    PhoneCountryCode?: string;
    ReceiveEmailMarketing?: boolean;
    ReceiveSmsMarketing?: boolean;
  };
};

function toFlatForm(p: CreateBookingPayload) {
  const flat: Record<string, string | number | boolean | undefined> = {
    VisitDate: p.VisitDate,
    VisitTime: p.VisitTime,
    PartySize: p.PartySize,
    ChannelCode: p.ChannelCode,
    SpecialRequests: p.SpecialRequests,
  };
  if (p.Customer) {
    Object.entries(p.Customer).forEach(([k, v]) => {
      flat[`Customer[${k}]`] = v as any;
    });
  }
  return flat;
}

export async function createBooking(restaurant: string, payload: CreateBookingPayload) {
  const { data } = await api.post(
    `/api/ConsumerApi/v1/Restaurant/${restaurant}/BookingWithStripeToken`,
    form(toFlatForm(payload)),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return data as {
    booking_reference: string;
    booking_id: number;
    restaurant: string;
    visit_date: string;
    visit_time: string;
    party_size: number;
    status: string;
    customer: any;
    created_at: string;
  };
}

export async function getBooking(restaurant: string, ref: string) {
  const { data } = await api.get(`/api/ConsumerApi/v1/Restaurant/${restaurant}/Booking/${ref}`);
  return data;
}

export async function updateBooking(restaurant: string, ref: string, patch: Partial<{
  VisitDate: string;
  VisitTime: string;
  PartySize: number;
  SpecialRequests: string;
  IsLeaveTimeConfirmed: boolean;
}>) {
  const { data } = await api.patch(
    `/api/ConsumerApi/v1/Restaurant/${restaurant}/Booking/${ref}`,
    form(patch as any),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return data;
}

export async function cancelBooking(restaurant: string, ref: string, reasonId: number) {
  const { data } = await api.post(
    `/api/ConsumerApi/v1/Restaurant/${restaurant}/Booking/${ref}/Cancel`,
    form({ micrositeName: restaurant, bookingReference: ref, cancellationReasonId: reasonId }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return data;
}
