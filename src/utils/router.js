import { useEffect, useState } from "react";

// Tiny client-side router: the app only needs "/" (landing), "/login" and "/admin".
const current = () => (typeof window === "undefined" ? "/" : window.location.pathname + window.location.search);

export function navigate(to) {
  if (typeof window === "undefined") return;
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}

export function useLocation() {
  const [loc, setLoc] = useState(current);
  useEffect(() => {
    const onChange = () => setLoc(current());
    window.addEventListener("popstate", onChange);
    return () => window.removeEventListener("popstate", onChange);
  }, []);
  return loc;
}

// onClick handler for <a href> that keeps normal behaviour for new-tab clicks.
export const goTo = (to) => (e) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
  e.preventDefault();
  navigate(to);
};
