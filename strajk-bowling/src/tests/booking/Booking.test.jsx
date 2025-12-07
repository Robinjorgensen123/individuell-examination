import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, test, vi, afterEach } from "vitest";
import Booking from "../../views/Booking";
import "@testing-library/jest-dom";

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
  });

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
});
