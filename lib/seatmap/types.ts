import { MouseButtons } from "./data";

export type CellType = "seat" | "aisle" | "wall" | "door" | "custom";

export type Cell = {
    name?: string;
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
    highestSeatNumber: number; // used to generate seat numbers
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
    highestSeatNumber: number;
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

export type Collision<ref> = {
    x: number;
    y: number;
    width: number;
    height: number;
    reference: ref | -1;
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
    selectedStyleState: CellState;
    selectedType: CellType;
    cellStyleChanges: CellStyleOverride;
    selectedCells: {
        readonly indexes: number[];
        type: CellType | null;
        editState: CellState;
    } | null;
}

export type EditMenuElement = {
    label: string;
} & ({
    type: "input";
    value?: keyof CellStyleOverridePure;
} | {
    type: "button";
    action: () => void;
} | {
    type: "select";
    options: string[];
} | {
    type: "label";
} | {
    type: "hselect";
    options: string[];
} | {
    type: "group";
    elements: EditMenuElement[];
})

export type MapMode = "view" | "edit" | "preview" | "no-interact";

export type CollisionCallback<ref> = ((collision: Collision<ref>, buttons?: MouseButtons[]) => void);
export type DragCallback = ((diffX: number, diffY: number, buttons: MouseButtons[]) => void);

export type MapRenderInstruction = {
    x: number;
    y: number;
    opacity: number;
} &
    (({
        type: "text";
        font: string;
        color: string;
        text: string;
    } | {
        type: "path";
        path: string;
        color: string;
    })
        |
        ({
            width: number;
            height: number;
        } & ({
            type: "fillrect";
            color: string;
        } | {
            type: "strokerect";
            color: string;
            lineWidth: number;
        })))