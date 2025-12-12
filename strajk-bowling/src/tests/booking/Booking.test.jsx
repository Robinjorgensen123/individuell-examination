import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, test, vi, afterEach } from "vitest";
import Booking from "../../views/Booking";
import "@testing-library/jest-dom";
import { server } from "../../tests/mocks/server";

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

  /// AC4: VG - Ifall användaren inte fyller i något av ovanstående så ska ett felmeddelande visas.
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

  /// AC4: VG - Ifall användaren inte fyller i något av ovanstående så ska ett felmeddelande visas.
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

  /// AC4: VG - Ifall användaren inte fyller i något av ovanstående så ska ett felmeddelande visas.
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
    await userEvent.clear(dateInput);

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

  /// AC4: VG - Ifall användaren inte fyller i något av ovanstående så ska ett felmeddelande visas.
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

  // AC5: VG - Om det inte finns tillräckligt med lediga banor för det angivna antalet spelare, ska användaren få ett felmeddelande.
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

  // AC9: VG - Om användaren försöker slutföra bokningen utan att ange skostorlek för en spelare som har valt att boka skor, ska systemet visa ett felmeddelande.
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

  // AC10: VG - Om antalet personer och skor inte matchas ska ett felmeddelande visas.
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

  // AC12: Användaren ska kunna ta bort ett tidigare valt fält för skostorlek genom att klicka på en "-"-knapp vid varje spelare.
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

// AC13 & AC14: När en spelare tas bort via "-" ska bokningen uppdateras
// så att den spelaren inte längre räknas med (färre skor skickas i booking-info).
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

// AC15: När en spelare tas bort ska den totala bokningssumman beräknas
// utifrån de kvarvarande spelarna och banorna (rätt total i bekräftelsen).
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
  const expectedPrice = 1 * 120 + 1 * 100;

  expect(saved.id).toBe("SB-TEST-007");
  expect(saved.price).toBe(expectedPrice);
});

// AC16-AC19: Slutför bokning, får nummer/pris, navigerar till bekräftelsesidan.
test("slutför lyckad bokning, sparar bekräftelse och navigerar till /confirmation", async () => {
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
