import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./auth-provider";

vi.mock("@/common/config/env", () => ({
  isDevAuth: () => true,
  env: { authMode: "dev" },
}));

vi.mock("./keycloak", () => ({
  initKeycloak: vi.fn(),
  logout: vi.fn(),
  refreshTokenIfNeeded: vi.fn(),
  login: vi.fn(),
  getKeycloak: vi.fn(),
}));

describe("AuthProvider", () => {
  it("renders children in dev auth mode", () => {
    render(
      <AuthProvider>
        <span>child</span>
      </AuthProvider>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });
});
