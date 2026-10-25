import { useEffect, useRef, type RefObject } from "react";
const scopes: HTMLElement[] = [];
const focusable = "button, [href], input, select, textarea, [tabindex]";
export function useDialogFocus(
  ref: RefObject<HTMLElement | null>,
  onDismiss?: () => void,
) {
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  useEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    const previous = document.activeElement as HTMLElement | null;
    const candidates = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(focusable)).filter(
        (node) =>
          node.tabIndex >= 0 &&
          !node.matches(':disabled, [aria-disabled="true"], [hidden]') &&
          !node.closest("[hidden], [inert]") &&
          node.getClientRects().length > 0,
      );
    scopes.push(panel);
    const layer = (node: HTMLElement) => {
      let value = 0;
      for (
        let current: HTMLElement | null = node;
        current;
        current = current.parentElement
      ) {
        const index = Number.parseInt(getComputedStyle(current).zIndex);
        if (Number.isFinite(index)) value = index;
      }
      return value;
    };
    const top = () =>
      scopes.reduce(
        (last, node) => (layer(node) >= layer(last) ? node : last),
        scopes[0],
      ) === panel;
    const focusFirst = () => (candidates()[0] ?? panel).focus();
    if (!panel.contains(document.activeElement)) focusFirst();
    const keydown = (event: KeyboardEvent) => {
      if (!top()) return;
      if (event.key === "Escape" && panel.querySelector('[role="listbox"]'))
        return;
      if (event.key === "Escape" && dismiss.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
        dismiss.current();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = candidates();
      const first = nodes[0],
        last = nodes.at(-1);
      if (
        !first ||
        (event.shiftKey
          ? document.activeElement === first || document.activeElement === panel
          : document.activeElement === last)
      ) {
        event.preventDefault();
        (event.shiftKey ? (last ?? panel) : (first ?? panel)).focus();
      }
    };
    const focusin = (event: FocusEvent) => {
      if (top() && !panel.contains(event.target as Node)) focusFirst();
    };
    document.addEventListener("keydown", keydown, true);
    document.addEventListener("focusin", focusin);
    return () => {
      const wasTop = top();
      scopes.splice(scopes.indexOf(panel), 1);
      document.removeEventListener("keydown", keydown, true);
      document.removeEventListener("focusin", focusin);
      if (wasTop && previous?.isConnected) previous.focus();
    };
  }, [ref]);
}
