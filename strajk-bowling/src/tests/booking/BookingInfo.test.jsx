import userEvent from "@testing-library/user-event";
import { describe, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BookingInfo from "../../../src/components/BookingInfo/BookingInfo";

describe("Användaren ska kunna välja en tid", () => {
  test("Användaren kan välja en tid", async () => {
    const mockUpdate = vi.fn();

    render(<BookingInfo updateBookingDetails={mockUpdate} />);

    const timeInput = document.querySelector("input[name='time']");

    await userEvent.type(timeInput, "18:30");

    expect(timeInput.value).toBe("18:30");
    expect(mockUpdate).toHaveBeenCalled();
  });
});
