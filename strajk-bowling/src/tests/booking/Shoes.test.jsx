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
describe("Unit Tests: Shoes Component(Skostorlekar)", () => {
  afterEach(() => {
    updateSize.mockClear();
    addShoe.mockClear();
    removeShoe.mockClear();
  });
  // AC5 – Användaren ska kunna ange skostorlek för varje spelare
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

  // AC6 – Användaren ska kunna ändra skostorlek för varje spelare
  test("Användaren ska kunna ändra skostorlek", async () => {
    const initialShoe = [{ id: "p1", size: "45" }];
    render(
      <Shoes
        shoes={initialShoe}
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

  // AC11 – Användaren ska kunna ta bort ett skostorleksfält via "-" knappen
  test("'-' knappen ska anropa 'removeShoe' med korrekt spelar-ID", async () => {
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
  // AC7 – Det ska vara möjligt att lägga till skostorleksfält för alla spelare
  test("'+' knappen ska anropa 'addShoe' för att lägga till ett nytt fält", async () => {
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

  // AC10 – Systemet ska visa översikt över alla skostorlekar innan bokning slutförs
  test("Renderar ett fält för varje spelare och visar översiktliga värden", () => {
    render(
      <Shoes
        shoes={fourPlayers}
        updateSize={updateSize}
        addShoe={addShoe}
        removeShoe={removeShoe}
      />
    );

    const shoeInput1 = screen.getByLabelText(/Shoe size \/ person 1/i);
    const shoeInput2 = screen.getByLabelText(/Shoe size \/ person 2/i);
    const shoeInput3 = screen.getByLabelText(/Shoe size \/ person 3/i);
    const shoeInput4 = screen.getByLabelText(/Shoe size \/ person 4/i);

    expect(shoeInput1).toBeInTheDocument();
    expect(shoeInput2).toBeInTheDocument();
    expect(shoeInput3).toBeInTheDocument();
    expect(shoeInput4).toBeInTheDocument();

    expect(shoeInput1.value).toBe("42");
    expect(shoeInput2.value).toBe("38");
    expect(shoeInput4.value).toBe("45");
  });
});
