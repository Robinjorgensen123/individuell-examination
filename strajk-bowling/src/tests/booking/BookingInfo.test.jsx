import userEvent from "@testing-library/user-event";
import { describe, expect, expectTypeOf, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BookingInfo from "../../../src/components/BookingInfo/BookingInfo";

const mockUpdate = vi.fn();

describe("TEST: Time Input", () => {
  // AC: Användaren ska kunna välja en tid från ett kalender- och tidvalssystem.
  test("Användaren kan välja en tid och updateBookingDetails anropas korrekt", async () => {
    render(<BookingInfo updateBookingDetails={mockUpdate} />);

    const timeInput = document.querySelector("input[name='time']");

    await userEvent.type(timeInput, "18:30");

    expect(timeInput.value).toBe("18:30");
    expect(mockUpdate).toHaveBeenCalledWith(expect.anything());
  });
});

// AC: Användaren ska kunna välja ett datum från datumvalssystemet
describe("Test: Date Input", () => {
  // AC: Användaren ska kunna välja ett datum från ett kalender- och tidvalssystem.
  test("Användaren kan välja ett datum och updateBookingDetails anropas korrekt", async () => {
    render(<BookingInfo updateBookingDetails={mockUpdate} />);

    const dateInput = document.querySelector("input[name='when']");

    await userEvent.type(dateInput, "2025-05-04");

    expect(dateInput.value).toBe("2025-05-04");
    expect(mockUpdate).toHaveBeenCalledWith(expect.anything());
  });
});

describe("TEST: players Input", () => {
  // AC: Användaren ska kunna ange antal spelare (minst 1 spelare)
  test("Användaren kan ange antal spelare och updateBookingDetails anropas korrekt", async () => {
    render(<BookingInfo updateBookingDetails={mockUpdate} />);

    const playerInput = screen.getAllByRole("spinbutton")[0];

    await userEvent.type(playerInput, "2");

    expect(playerInput.value).toBe("2");
    expect(mockUpdate).toHaveBeenCalledWith(expect.anything());
  });
});
describe("Test: Lanes Input", () => {
  test("Användaren kan ange antal banor och updateBookngDetails anropas korrekt", async () => {
    render(<BookingInfo updateBookingDetails={mockUpdate} />);

    const lanesInput = screen.getAllByRole("spinbutton")[1];

    await userEvent.type(lanesInput, "1");

    expect(lanesInput.value).toBe("1");

    expect(mockUpdate).toHaveBeenCalledWith(expect.anything());
  });
});
