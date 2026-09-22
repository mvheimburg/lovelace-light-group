import { it, expect } from "vitest";
import { t, formatPercent } from "../src/localize";
it.each(["nb", "NB_no", "no", "nn-NO"])("uses Bokmål for %s", (language) =>
  expect(t({ language }, "allOff")).toBe("Alt av"),
);
it.each(["en-GB", "fr"])("uses English for %s", (language) =>
  expect(t({ language }, "allOff")).toBe("All off"),
);
it("falls back to locale and handles malformed tags", () => {
  expect(t({ language: "", locale: { language: "nb_NO" } }, "allOff")).toBe(
    "Alt av",
  );
  expect(() =>
    formatPercent({ locale: { language: "!!!" } }, 42),
  ).not.toThrow();
  expect(
    formatPercent({ language: "en", locale: { language: "en-GB" } }, 42.5),
  ).toBe("42.5%");
  expect(
    formatPercent(
      {
        language: "en",
        locale: { language: "en-GB", number_format: "decimal_comma" },
      },
      42.5,
    ),
  ).toContain("42,5");
});
