import userEvent from "@testing-library/user-event";
import { describe, expect, expectTypeOf, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BookingInfo from "../../../src/components/BookingInfo/BookingInfo";

// AC: Användaren ska kunna välja en tid från tidvalssystemet
describe("Användaren ska kunna välja en tid", () => {
  test("Användaren kan välja en tid", async () => {
    const mockUpdate = vi.fn();

    render(<BookingInfo updateBookingDetails={mockUpdate} />);

    const timeInput = document.querySelector("input[name='time']");

    await userEvent.type(timeInput, "18:30");

    expect(timeInput.value).toBe("18:30");
    expect(mockUpdate).toHaveBeenCalled();
  });

  // AC: Användaren ska kunna välja ett datum från datumvalssystemet
  test("Användaren kan välja ett datum", async () => {
    const mockUpdate = vi.fn();

    render(<BookingInfo updateBookingDetails={mockUpdate} />);

    const dateInput = document.querySelector("input[name='when']");

    await userEvent.type(dateInput, "2025-05-04");

    expect(dateInput.value).toBe("2025-05-04");
    expect(mockUpdate).toHaveBeenCalled();
  });

  // AC: Användaren ska kunna ange antal spelare (minst 1 spelare)
  test("Användaren skall kunna ange antal spelare", async () => {
    const mockUpdate = vi.fn();

    render(<BookingInfo updateBookingDetails={mockUpdate} />);

    const playerInput = document.querySelector("input[name='people']");

    await userEvent.type(playerInput, "2");

    expect(playerInput.value).toBe("2");
    expect(mockUpdate).toHaveBeenCalled();
  });
});

//AC: Användaren skall kunna ange antal banor baserat på antal spelare
test("Användaren kan ange antal banor", async () => {
  const mockUpdate = vi.fn();

  render(<BookingInfo updateBookingDetails={mockUpdate} />);

  const lanesInput = document.querySelector("input[name='lanes']");

  await userEvent.type(lanesInput, "1"); // bara ett som går att testa då vi inte vet antalet spelare i testet

  expect(lanesInput.value).toBe("1");
  expect(mockUpdate).toHaveBeenCalled();
});
