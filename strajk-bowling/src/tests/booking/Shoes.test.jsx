import { render, screen } from "@testing-library/react";
import { describe, expect } from "vitest";
import Shoes from "../../components/Shoes/Shoes";
import userEvent from "@testing-library/user-event";

describe("Användaren skall kunna ange skostorlek för varje spelare", () => {
  const addShoe = vi.fn();
  const updateSize = vi.fn();
  const removeShoe = vi.fn();
  const shoes = [{ id: "p1" }];

  test("Användaren kan ange skostorlek", async () => {
    render(
      <Shoes
        shoes={shoes}
        updateSize={updateSize}
        addShoe={addShoe}
        removeShoe={removeShoe}
      />
    );

    const shoeSize = screen.getByLabelText("Shoe size / person 1");

    await userEvent.type(shoeSize, "42");

    expect(shoeSize.value).toBe("42");
  });

  test("Användaren ska kunna ändra skostorlek", async () => {
    render(
      <Shoes
        shoes={shoes}
        updateSize={updateSize}
        addShoe={addShoe}
        removeShoe={removeShoe}
      />
    );
    const shoeInput = screen.getByLabelText("Shoe size / person 1");

    await userEvent.type(shoeInput, "45");

    expect(shoeInput.value).toBe("45");
    expect(updateSize).toHaveBeenCalled();
  });
});
