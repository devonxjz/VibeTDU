"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "system-ui, sans-serif",
          background: "#0f172a",
          color: "#e2e8f0",
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Đã xảy ra lỗi
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
            {error.message || "Lỗi không xác định"}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #334155",
              background: "#1e293b",
              color: "#e2e8f0",
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
