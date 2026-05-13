import { forwardRef, ComponentProps, ComponentType } from "react";

type Props = Omit<ComponentProps<"button">, "className"> & {
  Icon: ComponentType<{ className?: string }>;
  label: string;
}

const IconButton = forwardRef<HTMLButtonElement, Props>(
  ({ Icon, label, type, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        aria-label={label}
        title={label}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors duration-150"
        {...rest}
      >
        <Icon className="w-3.5 h-3.5" />
      </button>
    );
  },
);

IconButton.displayName = "IconButton";

export { IconButton };
