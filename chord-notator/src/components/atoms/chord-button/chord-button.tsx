import { forwardRef, ComponentProps } from "react";

interface Props extends Omit<ComponentProps<"button">, "className"> {
  selected?: boolean;
}

const ChordButton = forwardRef<HTMLButtonElement, Props>(
  ({ children, selected = false, disabled, type, ...rest }, ref) => {
    // min-w-16 (4rem / 64px) gives every button a uniform minimum width so
    // short labels ("7", "6", "B") stretch to match longer ones ("add11", "maj7")
    // — keeps groups visually aligned when they wrap onto multiple rows.
    const base =
      "min-w-16 px-3 py-2 rounded-md font-mono text-sm leading-none border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
    const state = disabled
      ? "bg-gray-800 text-gray-600 border-gray-800 cursor-not-allowed"
      : selected
        ? "bg-purple-500 text-white border-purple-400 ring-2 ring-purple-300 hover:bg-purple-400"
        : "bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700 hover:border-gray-600";

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        disabled={disabled}
        className={`${base} ${state}`}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

ChordButton.displayName = "ChordButton";

export default ChordButton;
