import { PrinterIcon } from "@heroicons/react/24/outline";

interface Props {
  disabled?: boolean;
}

function PrintButton({ disabled = false }: Props) {
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

export default PrintButton;
