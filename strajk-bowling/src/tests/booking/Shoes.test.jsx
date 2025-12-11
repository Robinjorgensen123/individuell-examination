import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import Shoes from "../../components/Shoes/Shoes";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

const addShoe = vi.fn();
const updateSize = vi.fn();
const removeShoe = vi.fn();

const singleShoe = [{ id: "p1", size: "" }];
const twoPlayers = [
  { id: "p1", size: "40" },
  { id: "p2", size: "42" },
];
const fourPlayers = [
  { id: "p1", size: "42" },
  { id: "p2", size: "38" },
  { id: "p3", size: "" },
  { id: "p4", size: "45" },
];

describe("Unit Tests: Shoes Component (Skostorlekar)", () => {
  afterEach(() => {
    updateSize.mockClear();
    addShoe.mockClear();
    removeShoe.mockClear();
  });

  // AC6: Användaren ska kunna ange skostorlek för varje spelare.
  test("Användaren kan ange skostorlek och updateSize anropas", async () => {
    render(
      <Shoes
        shoes={singleShoe}
        updateSize={updateSize}
        addShoe={addShoe}
        removeShoe={removeShoe}
      />
    );
    const shoeInput = screen.getByLabelText(/Shoe size \/ person 1/i);
    await userEvent.type(shoeInput, "42");
    expect(shoeInput.value).toBe("42");
    expect(updateSize).toHaveBeenCalled();
  });

  // AC7: Användaren ska kunna ändra skostorlek för varje spelare.
  test("Användaren ska kunna ändra skostorlek", async () => {
    render(
      <Shoes
        shoes={[{ id: "p1", size: "45" }]}
        updateSize={updateSize}
        addShoe={addShoe}
        removeShoe={removeShoe}
      />
    );
    const shoeInput = screen.getByLabelText(/Shoe size \/ person 1/i);
    await userEvent.clear(shoeInput);
    await userEvent.type(shoeInput, "42");
    expect(shoeInput.value).toBe("42");
    expect(updateSize).toHaveBeenCalledTimes(3);
  });

  // AC8: Det ska vara möjligt att välja skostorlek för alla spelare som ingår i bokningen.
  test("'+' knappen ska anropa addShoe", async () => {
    render(
      <Shoes
        shoes={singleShoe}
        updateSize={updateSize}
        addShoe={addShoe}
        removeShoe={removeShoe}
      />
    );
    const addButton = screen.getByRole("button", { name: "+" });
    await userEvent.click(addButton);
    expect(addShoe).toHaveBeenCalledTimes(1);
    expect(addShoe).toHaveBeenCalledWith(expect.any(String));
  });

  // AC11: Systemet ska visa en översikt där användaren kan kontrollera de valda skostorlekarna för varje spelare innan bokningen slutförs.
  test("Renderar ett fält för varje spelare och visar värden", () => {
    render(
      <Shoes
        shoes={fourPlayers}
        updateSize={updateSize}
        addShoe={addShoe}
        removeShoe={removeShoe}
      />
    );
    expect(screen.getByLabelText(/Shoe size \/ person 1/i).value).toBe("42");
    expect(screen.getByLabelText(/Shoe size \/ person 2/i).value).toBe("38");
    expect(screen.getByLabelText(/Shoe size \/ person 4/i).value).toBe("45");
  });

  // AC12: Användaren ska kunna ta bort ett tidigare valt fält för skostorlek genom att klicka på en "-"-knapp vid varje spelare.
  test("'-' knappen ska anropa removeShoe med korrekt ID", async () => {
    render(
      <Shoes
        shoes={twoPlayers}
        updateSize={updateSize}
        addShoe={addShoe}
        removeShoe={removeShoe}
      />
    );
    const removeButtons = screen.getAllByRole("button", { name: "-" });
    await userEvent.click(removeButtons[0]);
    expect(removeShoe).toHaveBeenCalledWith("p1");
  });
});
