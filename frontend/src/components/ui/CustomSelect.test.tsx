import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertCircle } from "lucide-react";
import CustomSelect from "./CustomSelect";


vi.mock("@floating-ui/react", () => ({
    useFloating: () => ({
        refs: {
            setReference: vi.fn(),
            setFloating: vi.fn(),
        },
        floatingStyles: {},
    }),
    offset: vi.fn(),
    flip: vi.fn(),
    shift: vi.fn(),
    autoUpdate: vi.fn(),
    size: vi.fn(),
}));

describe("CustomSelect", () => {
    const mockOptions = [
        {
            category: "Group 1",
            items: [
                { id: "1", label: "Option 1" },
                { id: "2", label: "Option 2" },
            ],
        },
        {
            category: "Group 2",
            items: [
                { id: "3", label: "Option 3" },
                { id: "4", label: "Option 4 with very long text to test truncation" },
            ],
        },
    ];

    it("renders label in floating position", () => {
        const onChange = vi.fn();
        render(
            <CustomSelect
                options={mockOptions}
                value={null}
                onChange={onChange}
                label="Test Label"
            />
        );
        expect(screen.getByText("Test Label")).toBeInTheDocument();
    });

    it("displays placeholder text when no value selected", () => {
        const onChange = vi.fn();
        render(
            <CustomSelect
                options={mockOptions}
                value={null}
                onChange={onChange}
                label="Select"
            />
        );
        expect(screen.getByText("Виберіть варіант")).toBeInTheDocument();
    });

    it("displays selected option label when value is set", () => {
        const onChange = vi.fn();
        const selectedOption = mockOptions[0].items[0];
        render(
            <CustomSelect
                options={mockOptions}
                value={selectedOption}
                onChange={onChange}
                label="Select"
            />
        );
        expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    it("renders icon when provided", () => {
        const onChange = vi.fn();
        render(
            <CustomSelect
                options={mockOptions}
                value={null}
                onChange={onChange}
                label="Select"
                icon={AlertCircle}
            />
        );
        const button = screen.getByRole("button");
        expect(button.querySelector("svg")).toBeInTheDocument();
    });

    it("does not render icon when not provided", () => {
        const onChange = vi.fn();
        render(
            <CustomSelect
                options={mockOptions}
                value={null}
                onChange={onChange}
                label="Select"
            />
        );
        const button = screen.getByRole("button");
        const svgs = button.querySelectorAll("svg");
        expect(svgs.length).toBeLessThanOrEqual(1); 
    });

    it("opens listbox when button is clicked", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <CustomSelect
                options={mockOptions}
                value={null}
                onChange={onChange}
                label="Select"
            />
        );

        await user.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(screen.getByText("Group 1")).toBeInTheDocument();
        });
    });

    it("calls onChange when option is selected", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <CustomSelect options={mockOptions} value={null} onChange={onChange} label="Select" />
        );

        await user.click(screen.getByRole("button"));

        
        const option = await screen.findByRole("option", { name: /Option 1/i });
        await user.click(option);

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: "1", label: "Option 1" })
        );
    });

    it("applies disabled state and prevents interaction", async () => {
        const onChange = vi.fn();
        const { container } = render(
            <CustomSelect
                options={mockOptions}
                value={null}
                onChange={onChange}
                label="Select"
                disabled={true}
            />
        );

        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass("opacity-60");

        const button = screen.getByRole("button");
        expect(button).toBeDisabled();
    });

    it("displays category headers in dropdown", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <CustomSelect
                options={mockOptions}
                value={null}
                onChange={onChange}
                label="Select"
            />
        );

        await user.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(screen.getByText("Group 1")).toBeInTheDocument();
            expect(screen.getByText("Group 2")).toBeInTheDocument();
        });
    });

    it("renders all options grouped by category", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <CustomSelect
                options={mockOptions}
                value={null}
                onChange={onChange}
                label="Select"
            />
        );

        await user.click(screen.getByRole("button"));

        await waitFor(() => {
            
            expect(screen.getAllByText("Option 1")).toHaveLength(1);
            expect(screen.getByText("Option 3")).toBeInTheDocument();
            expect(screen.getByText("Option 4 with very long text to test truncation")).toBeInTheDocument();
        });
    });

    it("shows checkmark on selected option", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const selectedOption = mockOptions[0].items[0];

        render(
            <CustomSelect
                options={mockOptions}
                value={selectedOption}
                onChange={onChange}
                label="Select"
            />
        );

        await user.click(screen.getByRole("button"));

        await waitFor(() => {
            
            const svgs = document.querySelectorAll("svg");
            expect(svgs.length).toBeGreaterThan(1); 
        });
    });

    it("handles empty options array gracefully", () => {
        const onChange = vi.fn();
        render(
            <CustomSelect
                options={[]}
                value={null}
                onChange={onChange}
                label="Select"
            />
        );

        
        expect(screen.getByText("Виберіть варіант")).toBeInTheDocument();
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("switches between multiple options correctly", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <CustomSelect
                options={mockOptions}
                value={mockOptions[0].items[0]}
                onChange={onChange}
                label="Select"
            />
        );

        expect(screen.getByText("Option 1")).toBeInTheDocument();

        await user.click(screen.getByRole("button"));

        const option2 = await screen.findByRole("option", { name: /Option 2/i });
        await user.click(option2);

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: "2", label: "Option 2" })
        );
    });

    it("preserves option structure in onChange callback", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<CustomSelect options={mockOptions} value={null} onChange={onChange} label="Select" />);

        
        await user.click(screen.getByRole("button"));

        
        const option = await screen.findByRole("option", { name: /Option 1/i });
        await user.click(option);

        
        expect(onChange).toHaveBeenCalledTimes(1);
        const callArg = onChange.mock.calls[0][0];
        expect(callArg).toEqual({ id: "1", label: "Option 1" });
    });

    it("handles very long option labels", async () => {
        const onChange = vi.fn();
        const longLabelOptions = [
            {
                category: "Test",
                items: [{ id: "1", label: "Very long label that should truncate" }],
            },
        ];

        render(
            <CustomSelect options={longLabelOptions} value={null} onChange={onChange} label="Select" />
        );

        const button = screen.getByRole("button");

        
        const textElement = button.querySelector(".truncate");

        expect(textElement).toBeInTheDocument();
        expect(textElement).toHaveClass("truncate");
    });
});