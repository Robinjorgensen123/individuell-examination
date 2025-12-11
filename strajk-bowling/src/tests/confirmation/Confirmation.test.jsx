import { render, screen, cleanup } from "@testing-library/react";
import { describe, test, expect, vi, afterEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Confirmation from "../../views/Confirmation";

const mockedUseLocation = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    useLocation: () => mockedUseLocation(),
    BrowserRouter: actual.BrowserRouter,
  };
});

const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};

globalThis.sessionStorage = sessionStorageMock;

describe("Confirmation View - Navigering och visning av bokning", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
  // AC: Om användaren navigerar till bekräftelsevyn och ingen bokning är gjord
  test("Visar 'Inga bokning gjord!' om ingen bokning finns i state eller sessionStorage", () => {
    mockedUseLocation.mockReturnValue({ state: null });

    sessionStorageMock.getItem.mockReturnValueOnce("null");

    render(
      <BrowserRouter>
        <Confirmation />
      </BrowserRouter>
    );

    expect(screen.getByText(/Inga bokning gjord!/i)).toBeInTheDocument();
  });
  // AC: Om användaren navigerar till bekräftelsevyn och det finns en bokning sparad i session storage
  test("visar sparad bokning från sessionStorage när den finns", () => {
    const fakeConfirmation = {
      when: "2026-06-06T18:00",
      people: 2,
      lanes: 1,
      bookingId: "SB-TEST-007",
      price: 340,
    };

    mockedUseLocation.mockReturnValue({ state: null });
    sessionStorageMock.getItem.mockReturnValue(
      JSON.stringify(fakeConfirmation)
    );

    render(
      <BrowserRouter>
        <Confirmation />
      </BrowserRouter>
    );

    const inputs = screen.getAllByRole("textbox");
    const [whenInput, whoInput, lanesInput, bookingNumberInput] = inputs;

    expect(whenInput).toHaveValue("2026-06-06 18:00");
    expect(whoInput).toHaveValue("2");
    expect(lanesInput).toHaveValue("1");
    expect(bookingNumberInput).toHaveValue("SB-TEST-007");

    expect(screen.getByText(/Total:/i)).toBeInTheDocument();
    expect(screen.getByText(/340/i)).toBeInTheDocument();
  });
});
