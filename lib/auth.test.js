jest.mock("./db", () => ({
  query: jest.fn(),
}));

import { generateToken, verifyToken } from "./auth";

describe("auth helper", () => {
  it("generates and verifies a token", () => {
    const token = generateToken({ id: 123 });
    expect(typeof token).toBe("string");

    const payload = verifyToken(token);
    expect(payload).toMatchObject({ id: 123 });
  });

  it("returns null for an invalid token", () => {
    const payload = verifyToken("invalid.token.value");
    expect(payload).toBeNull();
  });
});
