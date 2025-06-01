export type CellType = "seat" | "aisle" | "wall" | "door" | "custom";

export type Cell = {
    id: string;
    name: string;
    type: CellType;
    styleOverride?: CellStyleOverride;
} | null;

export type CellState = "hover" | "selected" | "default";

export type CellStyleOverridePure = {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    text?: string;
    opacity?: number;
}

export type CellStyleOverride = CellStyleOverridePure & {
    hoverOverride?: CellStyleOverridePure,
    selectedOverride?: CellStyleOverridePure
}

export type PossibleZoomLevels = 0.8 | 1 | 1.2 | 1.5 | 2 | 3 | 4 | 5 | 6;

export type MapLayoutInput = {
    x: number;
    y: number;
    cells: (Cell | `${number}`)[]; // putting an Int will create the Ints amount of null cells
    globalOverride?: {
        backgroundColor?: string;
        zoomLevel?: PossibleZoomLevels;
        cellStyleOverride?: {
            seat?: CellStyleOverride
            aisle?: CellStyleOverride
            wall?: CellStyleOverride
            door?: CellStyleOverride
            custom?: CellStyleOverride
        }
    }
};

export type MapLayout = {
    x: number;
    y: number;
    cells: Cell[];
    globalOverride: {
        backgroundColor: string;
        zoomLevel: PossibleZoomLevels;
        cellStyleOverride: {
            seat?: CellStyleOverride
            aisle?: CellStyleOverride
            wall?: CellStyleOverride
            door?: CellStyleOverride
            custom?: CellStyleOverride
        }
    }
};

export type Collision = {
    x: number;
    y: number;
    width: number;
    height: number;
    cellIndex: number;
}

export type EditMenuState = {
    input: {
        property: keyof CellStyleOverridePure | null;
        value: string;
    },
    animations: {
        blinkingCursor: {
            lastTick: number;
            lastState: "visible" | "hidden";
            interval: number;
        }
    },
    selectedInput: number,
    cellStyleChanges: CellStyleOverride;
    selectedCell: {
        readonly index: number;
        type: CellType | null;
        editState: CellState;
    } | null;
}

export type EditMenuElement = {
    type: "input";
    label: string;
    value?: string;
} | {
    type: "button";
    label: string;
    action: () => void;
} | {
    type: "select";
    label: string;
    options: { value: string; label: string }[];
    selectedValue?: string;
} | {
    type: "label";
    label: string;
} | {
    type: "hselect";
    label: string;
    options: { value: string; label: string }[];
    selectedOption: number;
}

export type MapMode = "view" | "edit";