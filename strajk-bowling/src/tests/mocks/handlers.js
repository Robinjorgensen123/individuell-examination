import { http, HttpResponse } from "msw";

const API_URL =
  "https://731xy9c2ak.execute-api.eu-north-1.amazonaws.com/booking";

const calculatePrice = (bookingData) => {
  const pricePerPerson = 120;
  const pricePerLane = 100;
  const pricePerShoe = 80;
};

export const handlers = [
  http.post(API_URL, async () => {
    return HttpResponse.json(
      {
        bookingDetails: {
          id: "SB-TEST-007",
          price: 340,
        },
      },
      { status: 201 }
    );
  }),
];
