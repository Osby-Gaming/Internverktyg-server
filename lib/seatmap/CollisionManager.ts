import EditMenu from "./EditMenu";
import Map from "./Map";
import { Collision } from "./types";

export default class CollisionManager {
    collisions: {
        potentialCollisions: Collision[];
        activeMouseCollisions: Collision[];
        activeMouseHoverCollisions: Collision[];
    } = {
            potentialCollisions: [],
            activeMouseCollisions: [],
            activeMouseHoverCollisions: []
        }

    map: Map | EditMenu;

    listeners: {
        click: ((collission: Collision) => void)[],
        hover: ((collission: Collision) => void)[]
    } = {
            click: [],
            hover: []
        }

    constructor(map: Map | EditMenu) {
        this.map = map;

        this.map.canvas.addEventListener("mousedown", (event) => {
            event.preventDefault();
            this.map.canvas.focus();

            this.map.controller.mouseX = event.offsetX;
            this.map.controller.mouseY = event.offsetY;
            this.map.controller.mouseDown = true;

            this.collisions.activeMouseCollisions = this.collisions.potentialCollisions.filter(collision => {
                return collision.x <= this.map.controller.mouseX &&
                    collision.x + collision.width >= this.map.controller.mouseX &&
                    collision.y <= this.map.controller.mouseY &&
                    collision.y + collision.height >= this.map.controller.mouseY;
            });
        });

        this.map.canvas.addEventListener("mousemove", (event) => {
            event.preventDefault();

            this.map.controller.mouseX = event.offsetX;
            this.map.controller.mouseY = event.offsetY;

            if (this.map.controller.mouseDown) {
                this.collisions.activeMouseCollisions = this.collisions.potentialCollisions.filter(collision => {
                    return collision.x <= this.map.controller.mouseX &&
                        collision.x + collision.width >= this.map.controller.mouseX &&
                        collision.y <= this.map.controller.mouseY &&
                        collision.y + collision.height >= this.map.controller.mouseY;
                });
            }

            this.collisions.activeMouseHoverCollisions = this.collisions.potentialCollisions.filter(collision => {
                return collision.x <= this.map.controller.mouseX &&
                    collision.x + collision.width >= this.map.controller.mouseX &&
                    collision.y <= this.map.controller.mouseY &&
                    collision.y + collision.height >= this.map.controller.mouseY;
            })

            for (const collision of this.collisions.activeMouseHoverCollisions) {
                for (const listener of this.listeners.hover) {
                    listener(collision);
                }
            }

            if (this.collisions.activeMouseHoverCollisions.length === 0) {
                for (const listener of this.listeners.hover) {
                    listener({
                        x: -1,
                        y: -1,
                        width: 0,
                        height: 0,
                        cellIndex: -1
                    });
                }
            }
        });

        this.map.canvas.addEventListener("mouseup", (event) => {
            event.preventDefault();

            this.map.controller.mouseX = event.offsetX;
            this.map.controller.mouseY = event.offsetY;
            this.map.controller.mouseDown = false;

            for (const collision of this.collisions.activeMouseCollisions) {
                for (const listener of this.listeners.click) {
                    listener(collision);
                }
            }

            this.collisions.activeMouseCollisions = [];
        });
    }

    addEventListener(type: "click" | "hover", callback: (collision: Collision) => void) {
        if (type in this.listeners) {
            this.listeners[type].push(callback);
        } else {
            throw new Error(`Invalid event type: ${type}`);
        }
    }

    registerPotentialCollisions(collisions: Collision[]) {
        this.collisions.potentialCollisions = collisions;

        if (this.map.controller.mouseDown) {
            this.collisions.activeMouseCollisions = this.collisions.potentialCollisions.filter(collision => {
                return collision.x <= this.map.controller.mouseX &&
                    collision.x + collision.width >= this.map.controller.mouseX &&
                    collision.y <= this.map.controller.mouseY &&
                    collision.y + collision.height >= this.map.controller.mouseY;
            });
        }
    }
}