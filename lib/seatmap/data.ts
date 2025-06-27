import { CellStyleOverride, CellType, PossibleZoomLevels } from "./types";

export const CELL_SIZE = 25; // Size of each cell in pixels
export const MAX_ZOOM = 6; // Maximum zoom level
export const MIN_ZOOM = 0.8; // Minimum zoom level
export const ZOOM_LEVELS = [0.8, 1, 1.2, 1.5, 2, 3, 4, 6, 7]; // Predefined zoom levels

export const DEFAULT_MAP_BACKGROUND_COLOR = "#000";
export const DEFAULT_ZOOM_LEVEL: PossibleZoomLevels = 1;

export const DEFAULT_CELL_STYLES: Record<CellType, CellStyleOverride> = {
    seat: {
        backgroundColor: "#0F0",
        borderColor: "#000",
        borderWidth: 1,
        text: "",
        opacity: 1,
        hoverOverride: {
            borderWidth: 2,
            opacity: 0.5,
        },
        selectedOverride: {
            opacity: 0.2,
        }
    },
    aisle: {
        backgroundColor: "#FFF",
        borderColor: "#000",
        borderWidth: 1,
        text: "",
        opacity: 1,
        hoverOverride: {
            borderWidth: 2,
        }
    },
    wall: {
        backgroundColor: "gray",
        borderColor: "#000",
        borderWidth: 1,
        text: "",
        opacity: 1,
        hoverOverride: {
            borderWidth: 2,
            text: ""
        }
    },
    door: {
        backgroundColor: "#F00",
        borderColor: "#000",
        borderWidth: 1,
        text: "",
        opacity: 1,
        hoverOverride: {
            borderWidth: 2,
            opacity: 0.6,
        }
    },
    custom: {
        backgroundColor: "#FFF",
        borderColor: "#000",
        borderWidth: 1,
        text: "",
        opacity: 1,
        hoverOverride: {
            borderWidth: 2,
        }
    }
}

export const EDITMENU_LABELS: Record<string, string> = {
    backgroundColor: "Background Color",
    borderColor: "Border Color",
    borderWidth: "Border Width",
    text: "Text",
    opacity: "Opacity",
    default_text1: "Click on a cell to edit it",
    btn_apply: "Apply",
    hslct_edit_state: "Choose Cell State",
    default: "Default",
    hover: "Hover",
    selected: "Select",
    hslct_type: "Choose Cell Type",
    seat: "Seat",
    aisle: "Aisle",
    wall: "Wall",
    door: "Door",
    custom: "Custom",
    btn_export: "Export",
    btn_toggle_preview: "Toggle Preview",
    btn_save: "Save",
    locked_cells_warning: "Some selected cells are locked and cannot be edited.",
};

export const CELL_STYLE_KEYS = Object.keys(EDITMENU_LABELS).slice(0, 5);

export enum MouseButtons {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
    BACK = 3,
    FORWARD = 4
}

export const SVGPaths = {
    copy: "M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02 v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02 c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7 h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02 c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65 v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02 v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z"
}