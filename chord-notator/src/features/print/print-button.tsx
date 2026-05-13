import { type FC } from "react";
import { PrinterIcon } from "@heroicons/react/24/outline";

type Props = {
  disabled?: boolean;
}

export const PrintButton: FC<Props> = ({ disabled = false }) => {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-md border border-edge px-3 py-1.5 text-sm text-gray-300 hover:bg-surface-2 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-ring"
    >
      <PrinterIcon className="w-4 h-4" />
      Print
    </button>
  );
}

