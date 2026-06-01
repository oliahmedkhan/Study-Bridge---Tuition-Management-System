import handler from "./applications";
import { getUserFromToken } from "../../lib/auth";
import { query } from "../../lib/db";

jest.mock("../../lib/auth", () => ({
  getUserFromToken: jest.fn(),
}));

jest.mock("../../lib/db", () => ({
  query: jest.fn(),
}));

function createMockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("/api/applications handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when no authorization header is provided", async () => {
    const req = { method: "GET", headers: {} };
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
  });

  it("returns 400 for a POST request missing required fields", async () => {
    getUserFromToken.mockResolvedValue({ id: 42, role: "student" });
    const req = { method: "POST", headers: { authorization: "Bearer token" }, body: {} };
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing tutor or message." });
  });

  it("returns applications for a student GET request", async () => {
    getUserFromToken.mockResolvedValue({ id: 1, role: "student" });
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          tutor_name: "Jane Tutor",
          subject: "Mathematics",
          date: "2026-06-01",
          message: "Looking for tuition",
          status: "pending",
        },
      ],
    });

    const req = { method: "GET", headers: { authorization: "Bearer token" } };
    const res = createMockRes();

    await handler(req, res);

    expect(query).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ applications: expect.any(Array) });
  });
});
