import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, json } from "react-router-dom";
import { describe, expect, test, vi, afterEach } from "vitest";
import Booking from "../../views/Booking";
import "@testing-library/jest-dom";
import { server } from "../../tests/mocks/server";
import { handlers } from "../../tests/mocks/handlers";
import { http, HttpResponse } from "msw";

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    BrowserRouter: actual.BrowserRouter,
  };
});

const sessionStorageMock = {
  setItem: vi.fn(),
  getItem: vi.fn(),
  clear: vi.fn(),
};
globalThis.sessionStorage = sessionStorageMock;

//Hjälp funktion
const getInputs = () => ({
  dateInput: document.querySelector("input[name='when']"),
  timeInput: document.querySelector("input[name='time']"),
  peopleInput: document.querySelector("input[name='people']"),
  lanesInput: document.querySelector("input[name='lanes']"),
  submitButton: screen.findByRole("button", { name: /strIIIIIike!/i }),
});

describe("Integration Tests: Booking Flow (VG Requirement", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    server.resetHandlers();
  });
  /// AC5 – VG: Felmeddelande visas om obligatoriska fält saknas (spelare saknas)
  test("Visar felmeddelande 'Alla fälten måste vara ifyllda' om SPELARE saknas", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    const { dateInput, timeInput, peopleInput } = getInputs();

    const submitButton = await screen.findByRole("button", {
      name: /strIIIIIike!/i,
    });

    await userEvent.type(dateInput, "2026-06-06");
    await userEvent.type(timeInput, "18:00");
    await userEvent.clear(peopleInput);
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Alla fälten måste vara ifyllda/i)
    ).toBeInTheDocument();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  // AC5 – VG: Felmeddelande visas om antal banor saknas eller är 0
  test("Visar 'Alla fälten måste vara ifyllda' om antal Banor är 0 eller saknas", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    const { dateInput, timeInput, peopleInput, lanesInput } = getInputs();

    const submitButton = await screen.findByRole("button", {
      name: /strIIIIIike/i,
    });

    await userEvent.type(dateInput, "2026-06-06");
    await userEvent.type(timeInput, "18:00");
    await userEvent.type(peopleInput, "2");
    await userEvent.clear(lanesInput);

    const addShoeButton = screen.getByRole("button", { name: "+" });
    await userEvent.click(addShoeButton);
    await userEvent.click(addShoeButton);

    const shoeInputs = document.querySelectorAll(".input__field.shoes__input");
    for (const input of shoeInputs) {
      await userEvent.type(input, "42");
    }

    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Alla fälten måste vara ifyllda/i)
    ).toBeInTheDocument();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  // AC11 – VG: Felmeddelande om antalet skor och spelare inte matchar
  test("Visar felmeddelande om antalet skor inte stämmer överens med antal spelare", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    const { dateInput, timeInput, peopleInput, lanesInput } = getInputs();

    const submitButton = await screen.findByRole("button", {
      name: /strIIIIIike!/i,
    });

    const addShoeButton = screen.getByRole("button", { name: "+" });

    await userEvent.type(dateInput, "2026-06-06");
    await userEvent.type(timeInput, "18:00");
    await userEvent.type(lanesInput, "1");
    await userEvent.type(peopleInput, "2");

    await userEvent.click(addShoeButton);
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(
        /Antalet skor måste stämma överens med antal spelare/i
      )
    ).toBeInTheDocument();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  // AC5 – VG: Felmeddelande visas om datum saknas
  test("Visar felmeddelande 'Alla fält måste vara ifyllda' om Datum saknas", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );
    const { dateInput, timeInput, peopleInput, lanesInput } = getInputs();
    const submitButton = await screen.findByRole("button", {
      name: /strIIIIIike!/i,
    });
    const addShoeButton = screen.getByRole("button", { name: "+" });

    await userEvent.type(timeInput, "18:00");
    await userEvent.type(peopleInput, "2");
    await userEvent.type(lanesInput, "1");

    await userEvent.click(addShoeButton);
    await userEvent.click(addShoeButton);
    const shoeInput1 = document.querySelector("input[name='p1']");
    const shoeInput2 = document.querySelector("input[name='p2']");
    if (shoeInput1 && shoeInput2) {
      await userEvent.type(shoeInput1, "42");
      await userEvent.type(shoeInput2, "42");
    }

    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Alla fälten måste vara ifyllda/i)
    ).toBeInTheDocument();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  // AC6 – VG: För många spelare per bana (max 4 per bana)
  test("VG: visar felmeddelande 'Det får max vara 4 spelare per bana'", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );
    const { dateInput, timeInput, peopleInput, lanesInput } = getInputs();
    const submitButton = await screen.findByRole("button", {
      name: /strIIIIIike!/i,
    });
    const addShoeButton = screen.getByRole("button", { name: "+" });

    await userEvent.type(dateInput, "2026-06-06");
    await userEvent.type(timeInput, "18:00");
    await userEvent.type(peopleInput, "5");
    await userEvent.type(lanesInput, "1");

    for (let i = 0; i < 5; i++) {
      await userEvent.click(addShoeButton);
    }
    const shoeInputs = document.querySelectorAll(".input__field.shoes__input");

    for (const input of shoeInputs) {
      await userEvent.type(input, "42");
    }
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Det får max vara 4 spelare per bana/i)
    ).toBeInTheDocument();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });
  // AC16–AC18 – Lyckad bokning + bekräftelse sparas + navigering sker
  test("Slutför lyckad bokning, navigerar och lagrar bekräftelse (MSW", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    const { dateInput, timeInput, peopleInput, lanesInput } = getInputs();

    const submitButton = await screen.findByRole("button", {
      name: /strIIIIIike!/i,
    });
    const addShoeButton = screen.getByRole("button", { name: "+" });

    await userEvent.type(dateInput, "2026-06-06");
    await userEvent.type(timeInput, "18:00");
    await userEvent.type(peopleInput, "2");
    await userEvent.type(lanesInput, "1");

    await userEvent.click(addShoeButton);
    await userEvent.click(addShoeButton);

    const shoeInputs = document.querySelectorAll(".input__field.shoes__input");
    for (const input of shoeInputs) {
      await userEvent.type(input, "42");
    }

    await userEvent.click(submitButton);

    await vi.waitFor(() => {
      expect(sessionStorageMock.setItem).toHaveBeenCalled();
    });

    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      "confirmation",
      JSON.stringify({ id: "SB-TEST-007", price: 340 })
    );
    expect(mockedNavigate).toHaveBeenCalledWith(
      "/confirmation",
      expect.any(Object)
    );
  });
  // AC5 – VG: Felmeddelande om tid saknas
  test("Visar felmeddelande 'Alla fälten måste vara ifyllda' om TID saknas", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );
    const { dateInput, timeInput, peopleInput, lanesInput } = getInputs();
    const submitButton = await screen.findByRole("button", {
      name: /strIIIIIike!/i,
    });
    const addShoeButton = screen.getByRole("button", { name: "+" });

    await userEvent.type(dateInput, "2026-06-06");
    await userEvent.type(peopleInput, "2");
    await userEvent.type(lanesInput, "1");
    await userEvent.clear(timeInput);

    await userEvent.click(addShoeButton);
    await userEvent.click(addShoeButton);

    const shoeInputs = document.querySelectorAll(".input__field.shoes__input");
    for (const input of shoeInputs) {
      await userEvent.type(input, "42");
    }

    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Alla fälten måste vara ifyllda/i)
    ).toBeInTheDocument();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });
  // AC10 – VG: Alla skostorlekar ej ifyllda
  test("Visar felmeddelande om inte alla skostorlekar är ifyllda", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );
    const { dateInput, timeInput, peopleInput, lanesInput } = getInputs();
    const submitButton = await screen.findByRole("button", {
      name: /strIIIIIike!/,
    });
    const addShoeButton = screen.getByRole("button", { name: "+" });

    await userEvent.type(dateInput, "2026-06-06");
    await userEvent.type(timeInput, "18:00");
    await userEvent.type(peopleInput, "2");
    await userEvent.type(lanesInput, "1");

    await userEvent.click(addShoeButton);
    await userEvent.click(addShoeButton);

    const allShoeInputs = document.querySelectorAll(
      ".input__field.shoes__input"
    );
    if (allShoeInputs.length > 0) {
      await userEvent.type(allShoeInputs[0], "42");
    }

    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Alla skor måste vara ifyllda/i)
    ).toBeInTheDocument();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });
  // AC13 & AC14 – Ta bort skofält + skorna ska inte inkluderas i bokningen
  test("tar bort skofält och skickar färre skor i booking-info", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    const { dateInput, timeInput, peopleInput, lanesInput } = getInputs();
    const addShoeButton = screen.getByRole("button", { name: "+" });
    const submitButton = await screen.findByRole("button", {
      name: /strIIIIIike!/i,
    });

    await userEvent.type(dateInput, "2026-06-06");
    await userEvent.type(timeInput, "18:00");
    await userEvent.type(peopleInput, "2");
    await userEvent.type(lanesInput, "1");

    await userEvent.click(addShoeButton);
    await userEvent.click(addShoeButton);

    let shoeInputs = document.querySelectorAll(".input__field.shoes__input");
    expect(shoeInputs).toHaveLength(2);

    for (const input of shoeInputs) {
      await userEvent.type(input, "42");
    }

    const removeButtons = screen.getAllByRole("button", { name: "-" });
    await userEvent.click(removeButtons[0]);

    shoeInputs = document.querySelectorAll(".input__field.shoes__input");
    expect(shoeInputs).toHaveLength(1);

    await userEvent.clear(peopleInput);
    await userEvent.type(peopleInput, "1");

    await userEvent.type(shoeInputs[0], "42");

    await userEvent.click(submitButton);

    await vi.waitFor(() => {
      expect(sessionStorageMock.setItem).toHaveBeenCalled();
    });

    const saved = JSON.parse(sessionStorageMock.setItem.mock.calls[0][1]);
    expect(saved).toBeTruthy();
  });

  // AC15 – Totalen ska beräknas korrekt baserat på kvarvarande skor
  test("totalen blir korrekt genom att endast kvarvarande skor skickas", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );
    const { dateInput, timeInput, peopleInput, lanesInput } = getInputs();
    const addShoeButton = screen.getByRole("button", { name: "+" });
    const submitButton = await screen.findByRole("button", {
      name: /strIIIIIike!/i,
    });

    await userEvent.type(dateInput, "2026-06-06");
    await userEvent.type(timeInput, "18:00");
    await userEvent.type(peopleInput, "2");
    await userEvent.type(lanesInput, "1");

    await userEvent.click(addShoeButton);
    await userEvent.click(addShoeButton);

    let shoeInputs = document.querySelectorAll(".input__field.shoes__input");

    for (const input of shoeInputs) {
      await userEvent.type(input, "42");
    }

    const removeButtons = screen.getAllByRole("button", { name: "-" });
    await userEvent.click(removeButtons[0]);

    shoeInputs = document.querySelectorAll(".input__field.shoes__input");
    expect(shoeInputs).toHaveLength(1);

    await userEvent.clear(peopleInput);
    await userEvent.type(peopleInput, "1");

    await userEvent.type(shoeInputs[0], "42");

    await userEvent.click(submitButton);

    await vi.waitFor(() => {
      expect(sessionStorageMock.setItem).toHaveBeenCalled();
    });

    const savedArgs = sessionStorageMock.setItem.mock.calls[0][1];
    const saved = JSON.parse(savedArgs);

    expect(saved).toEqual({ id: "SB-TEST-007", price: 340 });
  });

  // AC13 – Ta bort skofält ska uppdatera DOM
  test("Tar bort skofält när '-' klickas och DOM uppdateras", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    const addShoeButton = screen.getByRole("button", { name: "+" });

    await userEvent.click(addShoeButton);
    await userEvent.click(addShoeButton);

    let removeButtons = screen.getAllByRole("button", { name: "-" });

    await userEvent.click(removeButtons[0]);

    removeButtons = screen.getAllByRole("button", { name: "-" });
    expect(removeButtons).toHaveLength(1);
  });
});
