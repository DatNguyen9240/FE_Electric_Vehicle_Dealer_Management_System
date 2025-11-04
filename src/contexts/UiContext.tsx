import React from "react";

type Toast = { id: number; message: string; type?: "success" | "error" | "info" };

type ConfirmState = {
  message: string;
  resolve: (v: boolean) => void;
} | null;

import { UiContext } from "./uiContextCore";

export const UiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [confirmState, setConfirmState] = React.useState<ConfirmState>(null);
  const idRef = React.useRef(1);

  const showToast = (message: string, type: Toast["type"] = "info") => {
    const id = idRef.current++;
    setToasts((t) => [...t, { id, message, type }]);
    // auto remove
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  };

  const confirm = (message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ message, resolve });
    });
  };

  const value = React.useMemo(() => ({ showToast, confirm }), []);

  return (
    <UiContext.Provider value={value}>
      {children}

      {/* Toast container */}
      <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm w-full px-4 py-2 rounded-lg shadow-md text-sm text-white animate-fadeIn transform-gpu ${
              t.type === "success"
                ? "bg-green-600"
                : t.type === "error"
                ? "bg-red-600"
                : "bg-gray-800"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-[95%] max-w-lg">
            <div className="text-gray-800 dark:text-gray-100 mb-4">{confirmState.message}</div>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg border"
                onClick={() => {
                  confirmState.resolve(false);
                  setConfirmState(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                onClick={() => {
                  confirmState.resolve(true);
                  setConfirmState(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </UiContext.Provider>
  );
};


