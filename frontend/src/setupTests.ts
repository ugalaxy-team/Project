process.env.TZ = "UTC";

import "@testing-library/jest-dom/vitest";
import i18n from "@/i18n/config";

void i18n.changeLanguage("uk");

window.scrollTo = () => {};

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock;

if (typeof Element !== "undefined" && !Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => [];
}
