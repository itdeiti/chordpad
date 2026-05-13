import { ComponentProps, ComponentType, Ref } from "react";

type Props = Omit<ComponentProps<"button">, "className"> & {
  Icon: ComponentType<{ className?: string }>;
  label: string;
  ref?: Ref<HTMLButtonElement>;
}

export const IconButton = ({ Icon, label, type, ref, ...rest }: Props) => {
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
};
