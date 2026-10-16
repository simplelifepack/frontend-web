import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Calendar } from "./ui/calendar";
import { PaginationLink, PaginationNext } from "./ui/pagination";

afterEach(cleanup);

describe("Button primitive integrations", () => {
  it("keeps pagination as links with active-page semantics", () => {
    const ref = { current: null as HTMLAnchorElement | null };
    render(
      <>
        <PaginationLink href="/documents?page=2" isActive ref={ref}>
          2
        </PaginationLink>
        <PaginationNext href="/documents?page=3" />
      </>,
    );
    const active = screen.getByRole("link", { name: "2" });
    expect(active.getAttribute("href")).toBe("/documents?page=2");
    expect(active.getAttribute("aria-current")).toBe("page");
    expect(active.getAttribute("data-button-variant")).toBe("secondary");
    expect(ref.current).toBe(active);
    expect(
      screen
        .getByRole("link", { name: "Go to next page" })
        .getAttribute("href"),
    ).toBe("/documents?page=3");
  });

  it("preserves Radix cancel, action, and ref behavior through asChild", () => {
    const action = vi.fn();
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open confirmation</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm removal</AlertDialogTitle>
          <AlertDialogDescription>Remove this item?</AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction ref={ref} onClick={action}>
            Confirm
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open confirmation" }));
    expect(ref.current).toBe(screen.getByRole("button", { name: "Confirm" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(action).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Open confirmation" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(action).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("keeps calendar dates specialized while composing shared month navigation", () => {
    const select = vi.fn();
    render(
      <Calendar
        mode="single"
        defaultMonth={new Date(2026, 9, 1)}
        onSelect={select}
      />,
    );
    const day = screen.getByRole("button", {
      name: /Wednesday, October 14th, 2026/,
    });
    expect(day.hasAttribute("data-ds-button")).toBe(false);
    fireEvent.click(day);
    expect(select.mock.calls[0]?.[0]).toEqual(new Date(2026, 9, 14));
    const next = screen.getByRole("button", { name: /next month/i });
    expect(next.hasAttribute("data-ds-button")).toBe(true);
    fireEvent.click(next);
    expect(screen.getByText("November 2026")).toBeTruthy();
  });
});
