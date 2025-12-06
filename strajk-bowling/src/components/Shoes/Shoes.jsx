import "./Shoes.scss";
import { nanoid } from "nanoid";

import Input from "../Input/Input";

function Shoes({ updateSize, addShoe, removeShoe, shoes }) {
  const shoeComps = shoes.map((input, index) => {
    const label = `Shoe size / person ${index + 1}`;
    const shoeInput = (
      <article className="shoes__form" key={input.id}>
        <Input
          label={label}
          type="text"
          customClass="shoes__input"
          name={input.id}
          handleChange={updateSize}
          maxLength={2}
          //**********************DATA-TEST ID MOTIVERING****************************************** */
          // Lägger till data-testid eftersom Input komponenten saknar for/id länkning,
          // och detta gör då att det inte går att använda sematiskt korrekt metod screen.getByLabelText eller
          // getByRole då de inte är kopplat till input fältet
          //**************************************************************************************** */
          defaultValue={input.size}
          data-testid={`shoe-input-${index + 1}`}
        />
        <button
          className="shoes__button shoes__button--small"
          onClick={() => {
            removeShoe(input.id);
          }}
        >
          -
        </button>
      </article>
    );

    return shoeInput;
  });

  return (
    <section className="shoes">
      <header>
        <h2 className="shoes__heading">Shoes</h2>
      </header>
      {shoeComps}
      <button
        className="shoes__button"
        onClick={() => {
          addShoe(nanoid());
        }}
      >
        +
      </button>
    </section>
  );
}

export default Shoes;
