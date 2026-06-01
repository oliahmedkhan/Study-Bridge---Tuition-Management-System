export function getAvatarInitials(name) {
  if (!name || typeof name !== "string") return "";

  return name
    .split(" ")
    .map((part) => part[0] || "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
