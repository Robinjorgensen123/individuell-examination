import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/book", async ({ request }) => {
    return HttpResponse.json({
      bookingNumber: "MOCK123",
      total: 999,
    });
  }),
];
