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
            backgroundColor: "#0F0",
            borderColor: "#000",
            borderWidth: 2,
            text: "",
            opacity: 0.5,
        },
        selectedOverride: {
            backgroundColor: "#0F0",
            borderColor: "#000",
            borderWidth: 2,
            text: "",
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
            backgroundColor: "#FFF",
            borderColor: "#000",
            borderWidth: 2,
            text: "",
            opacity: 1,
        },
        selectedOverride: {
            backgroundColor: "#FFF",
            borderColor: "#000",
            borderWidth: 2,
            text: "",
            opacity: 1,
        }
    },
    wall: {
        backgroundColor: "#CCC",
        borderColor: "#000",
        borderWidth: 1,
        text: "2",
        opacity: 1,
        hoverOverride: {
            backgroundColor: "#CCC",
            borderColor: "#000",
            borderWidth: 2,
            text: "1",
            opacity: 1,
        },
        selectedOverride: {
            backgroundColor: "#CCC",
            borderColor: "#000",
            borderWidth: 2,
            text: "1",
            opacity: 1,
        }
    },
    door: {
        backgroundColor: "#F00",
        borderColor: "#000",
        borderWidth: 1,
        text: "",
        opacity: 1,
        hoverOverride: {
            backgroundColor: "#F00",
            borderColor: "#000",
            borderWidth: 2,
            text: "",
            opacity: 0.6,
        },
        selectedOverride: {
            backgroundColor: "#F00",
            borderColor: "#000",
            borderWidth: 2,
            text: "",
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
            backgroundColor: "#FFF",
            borderColor: "#000",
            borderWidth: 2,
            text: "",
            opacity: 1,
        },
        selectedOverride: {
            backgroundColor: "#FFF",
            borderColor: "#000",
            borderWidth: 2,
            text: "",
            opacity: 1
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
};

export const CELL_STYLE_KEYS = Object.keys(EDITMENU_LABELS).slice(0, 5);

export enum MouseButtons {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
    BACK = 3,
    FORWARD = 4
}