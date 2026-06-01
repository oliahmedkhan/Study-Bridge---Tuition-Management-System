import { getAvatarInitials } from "./getAvatarInitials";

describe("getAvatarInitials", () => {
  it("returns initials from a two-word name", () => {
    expect(getAvatarInitials("Oli Ahmed")).toBe("OA");
  });

  it("returns initials from a three-word name", () => {
    expect(getAvatarInitials("Fous Bin Taher")).toBe("FB");
  });

  it("returns empty string for empty input", () => {
    expect(getAvatarInitials("")).toBe("");
  });

  it("returns a single initial for a one-word name", () => {
    expect(getAvatarInitials("Oli")).toBe("O");
  });
});
