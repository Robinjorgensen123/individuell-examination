import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, json } from "react-router-dom";
import { describe, expect, test, vi, afterEach } from "vitest";
import Booking from "../../views/Booking";
import "@testing-library/jest-dom";
import { server } from "../../tests/mocks/server";
import { handlers } from "../../tests/mocks/handlers";

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
  // AC: Visar felmeddelande om fält saknas (Spelare)
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

  // VG 3: Visar felmeddelande om antalet skor inte stämmer överens med antal spelare
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
  // AC: Visar felmeddelande om fält saknas (Datum)
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
  // VG 2: Visar felmeddelande om spelare/bana överskrider maxgränsen (Reserveringslogik)
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
  // VG 5: Testar det kompletta lyckade flödet (MSW Success, Lagring & Navigering)
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
  // AC: Visar felmeddelande om fält saknas (Tid)
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
  // VG 4: Visar felmeddelande om inte alla skostorlekar är ifyllda
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

  // VG 6: Testar MSW Felhantering (API-fel / Fullbokat)
  /*  test("visar felmeddelande vid fullbokning (MSW 400)", async () => {
    server.use(handlers[1]);

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

    expect(
      await screen.findByText((content, element) =>
        content.includes("fullbokade")
      )
    ).toBeInTheDocument();

    expect(mockedNavigate).not.toHaveBeenCalled();
  }); */
});
