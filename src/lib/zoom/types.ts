export type Coords = {
  x: number;
  y: number;
};

export type Gesture = {
  origin: Coords;
  translation: Coords;
  scale: number;
  rotation?: number;
};

export type GestureCallbacks = {
  onGestureStart?: (gesture: Gesture) => void;
  onGestureChange?: (gesture: Gesture) => void;
  onGestureEnd?: (gesture: Gesture) => void;
};

export type NormalizedWheelEvent = {
  dx: number;
  dy: number;
};

declare global {
  /*
    TouchEvent' `scale` and `rotation` properties aren't standardized:
    https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent
  */
  interface TouchEvent {
    scale?: number;
    rotation?: number;
  }

  /*
    GestureEvents aren't standardized:
    https://developer.mozilla.org/en-US/docs/Web/API/GestureEvent
    https://developer.apple.com/documentation/webkitjs/gestureevent
  */
  interface GestureEvent extends UIEvent {
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    scale: number;
    rotation: number;
    clientX: number;
    clientY: number;
    screenX: number;
    screenY: number;
  }

  // extends the original ElementEventMap
  interface ElementEventMap {
    gesturestart: GestureEvent;
    gesturechange: GestureEvent;
    gestureend: GestureEvent;
  }

  // required to check for its existence
  interface Window {
    GestureEvent?: GestureEvent;
  }
}
