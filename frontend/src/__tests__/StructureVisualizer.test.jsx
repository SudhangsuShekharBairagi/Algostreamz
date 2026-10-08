// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AlgorithmsPage from "../pages/AlgorithmsPage";
import VisualizerPage from "../pages/VisualizerPage";
import { ZenProvider } from "../context/ZenContext";

function renderVisualizer(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ZenProvider>
        <Routes>
          <Route path="/visualizer/:algorithmId" element={<VisualizerPage />} />
          <Route path="/algorithms" element={<AlgorithmsPage />} />
        </Routes>
      </ZenProvider>
    </MemoryRouter>,
  );
}

afterEach(() => cleanup());
describe("data structure visualizers", () => {
  it("routes stack actions through the playback timeline", async () => {
    renderVisualizer("/visualizer/stack");
    fireEvent.change(screen.getByRole("textbox", { name: "Value" }), {
      target: { value: "alpha" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Push" }));
    expect(
      await screen.findByText("Pushed alpha onto the top of the stack."),
    ).toBeTruthy();
    expect(screen.getByText("alpha", { selector: "span" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Pop" }));
    expect(
      await screen.findByText("Popped alpha from the top of the stack."),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Step backward" }));
    expect(
      await screen.findByText("Pushed alpha onto the top of the stack."),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "2x" }));
    expect(
      screen.getByRole("radio", { name: "2x" }).getAttribute("aria-checked"),
    ).toBe("true");
    fireEvent.click(
      screen.getByRole("button", { name: "Reset visualizer to step 0" }),
    );
    expect(
      await screen.findByText("Stack is empty and ready for operations."),
    ).toBeTruthy();
  });

  it("renders queue endpoints and validates empty operation input", async () => {
    renderVisualizer("/visualizer/queue");
    fireEvent.click(screen.getByRole("button", { name: "Enqueue" }));
    expect(screen.getByRole("alert").textContent).toContain("Enter a value");

    fireEvent.change(screen.getByRole("textbox", { name: "Value" }), {
      target: { value: "first" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enqueue" }));
    expect(
      await screen.findByText("Enqueued first at the rear of the queue."),
    ).toBeTruthy();
    expect(screen.getByText("Front")).toBeTruthy();
    expect(screen.getByText("Rear")).toBeTruthy();
  });

  it("supports linked-list indexed insertion, search, and delete", async () => {
    renderVisualizer("/visualizer/linked-list");
    fireEvent.change(screen.getByRole("textbox", { name: "Value" }), {
      target: { value: "node" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "List index" }), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Insert at index" }));
    expect(await screen.findByText("Inserted node at index 0.")).toBeTruthy();

    fireEvent.change(screen.getByRole("textbox", { name: "Value" }), {
      target: { value: "node" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByText("Found node at index 0.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Delete at index" }));
    expect(await screen.findByText("Deleted node from index 0.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear structure" }));
    expect(screen.getByRole("status").textContent).toContain("Empty structure");
  });

  it("filters the catalog to the data structures category", async () => {
    renderVisualizer("/algorithms");
    fireEvent.click(
      await screen.findByRole("button", { name: "Data Structures" }),
    );
    expect(await screen.findByRole("heading", { name: "Stack" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Queue" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Linked List" })).toBeTruthy();
  });

  it("enters and exits Zen mode for a structure visualizer", () => {
    renderVisualizer("/visualizer/stack");
    fireEvent.click(screen.getByRole("button", { name: "Zen Mode" }));
    expect(screen.getByRole("button", { name: "Exit Zen Mode" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Exit Zen Mode" }));
    expect(screen.getByRole("heading", { name: "Operations" })).toBeTruthy();
  });
});
