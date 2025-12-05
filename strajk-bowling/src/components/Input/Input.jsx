import "./Input.scss";

function Input({
  label,
  type,
  customClass,
  name,
  handleChange,
  defaultValue,
  disabled,
  maxLength,
  ...props
}) {
  return (
    <section className="input">
      <label className="input__label">{label}</label>
      <input
        type={type}
        className={`input__field ${customClass ? customClass : ""}`}
        name={name}
        onChange={handleChange}
        defaultValue={defaultValue ? defaultValue : ""}
        maxLength={maxLength}
        disabled={disabled}
        {...props} // <-- skickar vidare data-testid
      />
    </section>
  );
}

export default Input;
