import type { ItineraryItem, Trip, TripExpense, TripNote, TripPhoto } from "../domain/types";

/**
 * Inline SVG data URI so seed photos render without any network fetch or
 * uploaded file — unlike user-added photos (see LocalTravelRepository),
 * these persist in `localStorage` across reloads since they're plain text,
 * not a `blob:` object URL.
 */
function placeholderPhoto(color: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320"><rect width="480" height="320" fill="${color}"/><text x="240" y="168" font-family="system-ui,sans-serif" font-size="28" fill="white" text-anchor="middle" opacity="0.9">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function iso(dateStr: string, hour = 9, minute = 0) {
  return new Date(`${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`).toISOString();
}

let tripIdCounter = 0;
let itemIdCounter = 0;
let expenseIdCounter = 0;
let photoIdCounter = 0;
let noteIdCounter = 0;

function nextTripId() {
  return `seed-trip-${tripIdCounter++}`;
}

/**
 * Three trips spanning past, present, and future relative to when this
 * seed runs, so the module has a completed trip, an ongoing one (status is
 * derived from today's date, not stored), and an upcoming one to show off
 * every status badge and the Statistics tab's breakdown on first visit.
 */
export function createSeedData(): {
  trips: Trip[];
  itineraryItems: ItineraryItem[];
  expenses: TripExpense[];
  photos: TripPhoto[];
  notes: TripNote[];
} {
  const now = new Date();
  const offsetDate = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const trips: Trip[] = [];
  const itineraryItems: ItineraryItem[] = [];
  const expenses: TripExpense[] = [];
  const photos: TripPhoto[] = [];
  const notes: TripNote[] = [];

  // --- Trip 1: completed ---
  const tokyoId = nextTripId();
  const tokyoStart = offsetDate(-71);
  const tokyoEnd = offsetDate(-64);
  trips.push({
    id: tokyoId,
    name: "Tokyo Adventure",
    destination: "Tokyo, Japan",
    startDate: tokyoStart,
    endDate: tokyoEnd,
    coverColor: "#ef4444",
    budget: 35_000_000,
    currency: "VND",
    notes: "First time in Japan — cherry blossoms already gone, but still worth it.",
    createdAt: iso(tokyoStart, 8),
    updatedAt: iso(tokyoStart, 8),
  });
  itineraryItems.push(
    {
      id: `seed-item-${itemIdCounter++}`,
      tripId: tokyoId,
      category: "flight",
      title: "Flight HAN → NRT",
      location: "Noi Bai Airport",
      lat: 21.2212,
      lng: 105.807,
      startAt: iso(tokyoStart, 7, 30),
      endAt: iso(tokyoStart, 15, 45),
      notes: "Vietnam Airlines VN300",
      createdAt: iso(tokyoStart, 7),
      updatedAt: iso(tokyoStart, 7),
    },
    {
      id: `seed-item-${itemIdCounter++}`,
      tripId: tokyoId,
      category: "hotel",
      title: "Check in — Shinjuku Granbell Hotel",
      location: "Shinjuku, Tokyo",
      lat: 35.6938,
      lng: 139.7034,
      startAt: iso(tokyoStart, 17, 0),
      endAt: null,
      notes: "",
      createdAt: iso(tokyoStart, 17),
      updatedAt: iso(tokyoStart, 17),
    },
    {
      id: `seed-item-${itemIdCounter++}`,
      tripId: tokyoId,
      category: "activity",
      title: "Senso-ji Temple",
      location: "Asakusa, Tokyo",
      lat: 35.7148,
      lng: 139.7967,
      startAt: iso(offsetDate(-70), 9, 0),
      endAt: iso(offsetDate(-70), 11, 30),
      notes: "Get there early to beat the crowds",
      createdAt: iso(offsetDate(-70), 8),
      updatedAt: iso(offsetDate(-70), 8),
    },
    {
      id: `seed-item-${itemIdCounter++}`,
      tripId: tokyoId,
      category: "food",
      title: "Sushi omakase at Ginza",
      location: "Ginza, Tokyo",
      lat: 35.6716,
      lng: 139.7645,
      startAt: iso(offsetDate(-69), 19, 0),
      endAt: iso(offsetDate(-69), 21, 0),
      notes: "Reservation under Hamer",
      createdAt: iso(offsetDate(-69), 12),
      updatedAt: iso(offsetDate(-69), 12),
    },
    {
      id: `seed-item-${itemIdCounter++}`,
      tripId: tokyoId,
      category: "flight",
      title: "Flight NRT → HAN",
      location: "Narita Airport",
      lat: 35.7719,
      lng: 140.3929,
      startAt: iso(tokyoEnd, 18, 0),
      endAt: iso(tokyoEnd, 22, 15),
      notes: "",
      createdAt: iso(tokyoEnd, 8),
      updatedAt: iso(tokyoEnd, 8),
    },
  );
  expenses.push(
    { id: `seed-exp-${expenseIdCounter++}`, tripId: tokyoId, category: "transport", amount: 12_500_000, currency: "VND", note: "Round-trip flights", spentAt: iso(tokyoStart, 6), createdAt: iso(tokyoStart, 6), updatedAt: iso(tokyoStart, 6) },
    { id: `seed-exp-${expenseIdCounter++}`, tripId: tokyoId, category: "accommodation", amount: 9_800_000, currency: "VND", note: "Shinjuku Granbell, 7 nights", spentAt: iso(tokyoStart, 17), createdAt: iso(tokyoStart, 17), updatedAt: iso(tokyoStart, 17) },
    { id: `seed-exp-${expenseIdCounter++}`, tripId: tokyoId, category: "food", amount: 4_200_000, currency: "VND", note: "Sushi, ramen, konbini runs", spentAt: iso(offsetDate(-69), 21), createdAt: iso(offsetDate(-69), 21), updatedAt: iso(offsetDate(-69), 21) },
    { id: `seed-exp-${expenseIdCounter++}`, tripId: tokyoId, category: "activities", amount: 2_100_000, currency: "VND", note: "teamLab, temples, JR pass", spentAt: iso(offsetDate(-70), 11), createdAt: iso(offsetDate(-70), 11), updatedAt: iso(offsetDate(-70), 11) },
    { id: `seed-exp-${expenseIdCounter++}`, tripId: tokyoId, category: "shopping", amount: 3_400_000, currency: "VND", note: "Souvenirs, Uniqlo run", spentAt: iso(offsetDate(-68), 15), createdAt: iso(offsetDate(-68), 15), updatedAt: iso(offsetDate(-68), 15) },
  );
  photos.push(
    { id: `seed-photo-${photoIdCounter++}`, tripId: tokyoId, url: placeholderPhoto("#ef4444", "Senso-ji Temple"), caption: "Senso-ji Temple at sunrise", lat: 35.7148, lng: 139.7967, takenAt: iso(offsetDate(-70), 9, 15), createdAt: iso(offsetDate(-70), 9, 15) },
    { id: `seed-photo-${photoIdCounter++}`, tripId: tokyoId, url: placeholderPhoto("#f97316", "Shibuya Crossing"), caption: "Shibuya Crossing at night", lat: 35.6595, lng: 139.7005, takenAt: iso(offsetDate(-69), 21, 30), createdAt: iso(offsetDate(-69), 21, 30) },
  );
  notes.push({
    id: `seed-note-${noteIdCounter++}`,
    tripId: tokyoId,
    title: "Packing lessons",
    body: "Bring a portable Wi-Fi router next time instead of a SIM — much easier pickup at the airport. Comfortable shoes are non-negotiable, we walked 20k+ steps most days.",
    createdAt: iso(offsetDate(-70), 22),
    updatedAt: iso(offsetDate(-70), 22),
  });

  // --- Trip 2: ongoing ---
  const baliId = nextTripId();
  const baliStart = offsetDate(-3);
  const baliEnd = offsetDate(6);
  trips.push({
    id: baliId,
    name: "Bali Getaway",
    destination: "Bali, Indonesia",
    startDate: baliStart,
    endDate: baliEnd,
    coverColor: "#0ea5e9",
    budget: 28_000_000,
    currency: "VND",
    notes: "Beach, rice terraces, and way too much nasi goreng.",
    createdAt: iso(offsetDate(-30), 10),
    updatedAt: iso(offsetDate(-30), 10),
  });
  itineraryItems.push(
    { id: `seed-item-${itemIdCounter++}`, tripId: baliId, category: "flight", title: "Flight SGN → DPS", location: "Tan Son Nhat Airport", lat: 10.8188, lng: 106.6519, startAt: iso(baliStart, 6, 45), endAt: iso(baliStart, 13, 30), notes: "", createdAt: iso(baliStart, 6), updatedAt: iso(baliStart, 6) },
    { id: `seed-item-${itemIdCounter++}`, tripId: baliId, category: "hotel", title: "Check in — Ubud Jungle Villa", location: "Ubud, Bali", lat: -8.5069, lng: 115.2625, startAt: iso(baliStart, 15, 0), endAt: null, notes: "", createdAt: iso(baliStart, 15), updatedAt: iso(baliStart, 15) },
    { id: `seed-item-${itemIdCounter++}`, tripId: baliId, category: "activity", title: "Tegallalang Rice Terrace", location: "Tegallalang, Bali", lat: -8.4312, lng: 115.2793, startAt: iso(offsetDate(-2), 8, 0), endAt: iso(offsetDate(-2), 10, 30), notes: "Bring cash for the entrance donation", createdAt: iso(offsetDate(-2), 7), updatedAt: iso(offsetDate(-2), 7) },
    { id: `seed-item-${itemIdCounter++}`, tripId: baliId, category: "activity", title: "Uluwatu Temple + Kecak dance", location: "Uluwatu, Bali", lat: -8.8291, lng: 115.0849, startAt: iso(now.toISOString().slice(0, 10), 17, 0), endAt: iso(now.toISOString().slice(0, 10), 19, 30), notes: "Sunset show — arrive early for seats", createdAt: iso(offsetDate(-1), 9), updatedAt: iso(offsetDate(-1), 9) },
    { id: `seed-item-${itemIdCounter++}`, tripId: baliId, category: "food", title: "Seafood dinner at Jimbaran Bay", location: "Jimbaran, Bali", lat: -8.7906, lng: 115.1656, startAt: iso(offsetDate(1), 19, 0), endAt: null, notes: "", createdAt: iso(offsetDate(-1), 9), updatedAt: iso(offsetDate(-1), 9) },
    { id: `seed-item-${itemIdCounter++}`, tripId: baliId, category: "flight", title: "Flight DPS → SGN", location: "Ngurah Rai Airport", lat: -8.7482, lng: 115.1672, startAt: iso(baliEnd, 20, 0), endAt: iso(baliEnd, 23, 15), notes: "", createdAt: iso(baliStart, 6), updatedAt: iso(baliStart, 6) },
  );
  expenses.push(
    { id: `seed-exp-${expenseIdCounter++}`, tripId: baliId, category: "transport", amount: 8_900_000, currency: "VND", note: "Round-trip flights", spentAt: iso(baliStart, 5), createdAt: iso(baliStart, 5), updatedAt: iso(baliStart, 5) },
    { id: `seed-exp-${expenseIdCounter++}`, tripId: baliId, category: "accommodation", amount: 7_200_000, currency: "VND", note: "Ubud Jungle Villa, 9 nights", spentAt: iso(baliStart, 15), createdAt: iso(baliStart, 15), updatedAt: iso(baliStart, 15) },
    { id: `seed-exp-${expenseIdCounter++}`, tripId: baliId, category: "food", amount: 2_600_000, currency: "VND", note: "Warungs and beach cafes", spentAt: iso(offsetDate(-2), 12), createdAt: iso(offsetDate(-2), 12), updatedAt: iso(offsetDate(-2), 12) },
    { id: `seed-exp-${expenseIdCounter++}`, tripId: baliId, category: "activities", amount: 1_450_000, currency: "VND", note: "Rice terrace entry, Kecak tickets", spentAt: iso(offsetDate(-2), 10), createdAt: iso(offsetDate(-2), 10), updatedAt: iso(offsetDate(-2), 10) },
  );
  photos.push(
    { id: `seed-photo-${photoIdCounter++}`, tripId: baliId, url: placeholderPhoto("#0ea5e9", "Tegallalang Terraces"), caption: "Rice terraces in the morning mist", lat: -8.4312, lng: 115.2793, takenAt: iso(offsetDate(-2), 8, 45), createdAt: iso(offsetDate(-2), 8, 45) },
    { id: `seed-photo-${photoIdCounter++}`, tripId: baliId, url: placeholderPhoto("#0284c7", "Uluwatu Sunset"), caption: "Sunset over Uluwatu Temple", lat: -8.8291, lng: 115.0849, takenAt: iso(offsetDate(-1), 18, 20), createdAt: iso(offsetDate(-1), 18, 20) },
    { id: `seed-photo-${photoIdCounter++}`, tripId: baliId, url: placeholderPhoto("#38bdf8", "Villa Pool"), caption: "Morning swim before breakfast", lat: -8.5069, lng: 115.2625, takenAt: iso(offsetDate(-1), 7, 10), createdAt: iso(offsetDate(-1), 7, 10) },
  );
  notes.push({
    id: `seed-note-${noteIdCounter++}`,
    tripId: baliId,
    title: "Still to do",
    body: "Book the sunrise Mount Batur trek before it fills up. Ask the villa staff about a good spot for canang sari offerings photos.",
    createdAt: iso(offsetDate(-1), 21),
    updatedAt: iso(offsetDate(-1), 21),
  });

  // --- Trip 3: upcoming ---
  const parisId = nextTripId();
  const parisStart = offsetDate(77);
  const parisEnd = offsetDate(86);
  trips.push({
    id: parisId,
    name: "Paris in Autumn",
    destination: "Paris, France",
    startDate: parisStart,
    endDate: parisEnd,
    coverColor: "#8b5cf6",
    budget: 52_000_000,
    currency: "VND",
    notes: "Museums, pastries, and a day trip to Versailles.",
    createdAt: iso(offsetDate(-5), 20),
    updatedAt: iso(offsetDate(-5), 20),
  });
  itineraryItems.push(
    { id: `seed-item-${itemIdCounter++}`, tripId: parisId, category: "flight", title: "Flight HAN → CDG", location: "Noi Bai Airport", lat: 21.2212, lng: 105.807, startAt: iso(parisStart, 0, 30), endAt: iso(parisStart, 7, 15), notes: "Layover in Doha", createdAt: iso(offsetDate(-5), 20), updatedAt: iso(offsetDate(-5), 20) },
    { id: `seed-item-${itemIdCounter++}`, tripId: parisId, category: "hotel", title: "Check in — Le Marais Boutique Hotel", location: "Le Marais, Paris", lat: 48.8589, lng: 2.3622, startAt: iso(parisStart, 15, 0), endAt: null, notes: "", createdAt: iso(offsetDate(-5), 20), updatedAt: iso(offsetDate(-5), 20) },
    { id: `seed-item-${itemIdCounter++}`, tripId: parisId, category: "activity", title: "Louvre Museum", location: "Paris", lat: 48.8606, lng: 2.3376, startAt: iso(offsetDate(78), 9, 30), endAt: iso(offsetDate(78), 13, 0), notes: "Book skip-the-line tickets in advance", createdAt: iso(offsetDate(-5), 20), updatedAt: iso(offsetDate(-5), 20) },
    { id: `seed-item-${itemIdCounter++}`, tripId: parisId, category: "activity", title: "Day trip to Versailles", location: "Versailles", lat: 48.8049, lng: 2.1204, startAt: iso(offsetDate(80), 8, 0), endAt: iso(offsetDate(80), 17, 0), notes: "RER C from Paris", createdAt: iso(offsetDate(-5), 20), updatedAt: iso(offsetDate(-5), 20) },
  );
  expenses.push(
    { id: `seed-exp-${expenseIdCounter++}`, tripId: parisId, category: "transport", amount: 21_000_000, currency: "VND", note: "Round-trip flights (booked early)", spentAt: iso(offsetDate(-5), 20), createdAt: iso(offsetDate(-5), 20), updatedAt: iso(offsetDate(-5), 20) },
    { id: `seed-exp-${expenseIdCounter++}`, tripId: parisId, category: "accommodation", amount: 14_500_000, currency: "VND", note: "Le Marais Boutique Hotel, deposit", spentAt: iso(offsetDate(-5), 20), createdAt: iso(offsetDate(-5), 20), updatedAt: iso(offsetDate(-5), 20) },
  );
  notes.push({
    id: `seed-note-${noteIdCounter++}`,
    tripId: parisId,
    title: "Reminders before departure",
    body: "Renew travel insurance. Check the Louvre and Versailles ticket confirmation emails. Pack a light jacket — early October evenings run cool.",
    createdAt: iso(offsetDate(-5), 21),
    updatedAt: iso(offsetDate(-5), 21),
  });

  return { trips, itineraryItems, expenses, photos, notes };
}
