"use client";

export function LogoutButton() {
  return (
    <button
      className="btn"
      type="button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        location.href = "/login";
      }}
    >
      Logout
    </button>
  );
}
