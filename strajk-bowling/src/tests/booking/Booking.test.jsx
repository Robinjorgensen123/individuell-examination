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
});
