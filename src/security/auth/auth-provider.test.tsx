import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "./auth-provider";

vi.mock("@/common/config/env", () => ({
  isDevAuth: () => true,
  env: { authMode: "dev" },
}));

vi.mock("./keycloak", () => ({
  initKeycloak: vi.fn(),
  logoutWithKeycloak: vi.fn(),
  loginWithKeycloak: vi.fn(),
  refreshTokenIfNeeded: vi.fn(),
  getKeycloak: vi.fn(),
}));

function AuthConsumer() {
  const { isAuthenticated, displayName, login, logout } = useAuth();
  return (
    <div>
      <span>{isAuthenticated ? "signed-in" : "signed-out"}</span>
      <span>{displayName ?? "anonymous"}</span>
      <button type="button" onClick={() => logout()}>
        sign out
      </button>
      <button type="button" onClick={() => login()}>
        sign in
      </button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("renders children in dev auth mode", () => {
    render(
      <AuthProvider>
        <span>child</span>
      </AuthProvider>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("supports dev sign out and sign in", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByText("signed-in")).toBeInTheDocument();
    expect(screen.getByText("Dev User")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "sign out" }));

    expect(screen.getByText("signed-out")).toBeInTheDocument();
    expect(screen.getByText("anonymous")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "sign in" }));

    expect(screen.getByText("signed-in")).toBeInTheDocument();
    expect(screen.getByText("Dev User")).toBeInTheDocument();
  });
});
