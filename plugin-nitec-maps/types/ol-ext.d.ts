

// Basic type declarations for ol-ext
declare module 'ol-ext' {
  // Add specific types as needed
  export * from 'ol-ext/control/LayerSwitcher';
}

declare module 'ol-ext/control/LayerSwitcher' {
  import { Control } from 'ol/control';
  
  export interface LayerSwitcherOptions {
    show_progress?: boolean;
    mouseover?: boolean;
    reordering?: boolean;
    trash?: boolean;
    extent?: boolean;
    oninfo?: (layer: any) => void;
  }
  
  export default class LayerSwitcher extends Control {
    constructor(options?: LayerSwitcherOptions);
  }
}