type ToastType = "success" | "error";

export type ToastState = { type: ToastType; message: string } | null;

export function Toast({ value }: { value: ToastState }) {
  if (!value) return null;

  const bg = value.type === "success" ? "#16a34a" : "#dc2626";

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        padding: "12px 14px",
        borderRadius: 10,
        color: "white",
        background: bg,
        zIndex: 9999,
        boxShadow: "0 10px 20px rgba(0,0,0,.25)",
        maxWidth: 360,
        fontSize: 14,
      }}
    >
      {value.message}
    </div>
  );
}
