declare module 'quagga' {
  interface QuaggaJSConfigObject {
    inputStream?: {
      name?: string;
      type?: string;
      target?: Element | string | null;
      constraints?: {
        width?: number;
        height?: number;
        facingMode?: string;
      };
      area?: {
        top?: string;
        right?: string;
        left?: string;
        bottom?: string;
      };
    };
    locator?: {
      patchSize?: string;
      halfSample?: boolean;
    };
    numOfWorkers?: number;
    frequency?: number;
    decoder?: {
      readers?: string[];
    };
    locate?: boolean;
  }

  interface QuaggaJSResultObject {
    codeResult?: {
      code?: string;
    };
    line?: any;
    angle?: number;
    pattern?: any;
    box?: any;
    boxes?: any[];
  }

  const QuaggaJS: {
    init: (config: QuaggaJSConfigObject, callback: (err?: any) => void) => void;
    start: () => void;
    stop: () => void;
    onDetected: (callback: (data: QuaggaJSResultObject) => void) => void;
    onProcessed: (callback: (result: QuaggaJSResultObject) => void) => void;
    offDetected: (callback?: (data: QuaggaJSResultObject) => void) => void;
    offProcessed: (callback?: (result: QuaggaJSResultObject) => void) => void;
    canvas: {
      ctx: {
        overlay: CanvasRenderingContext2D;
      };
      dom: {
        overlay: HTMLCanvasElement;
      };
    };
    ImageDebug: {
      drawPath: (path: any, def: any, ctx: CanvasRenderingContext2D, style: any) => void;
    };
  };

  export = QuaggaJS;
}
