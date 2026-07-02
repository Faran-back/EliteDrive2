/**
 * Utility for safe error logging and object serialization.
 * Avoids circular reference exceptions when logging complex objects (such as Firestore or Auth structures).
 */

export function sanitizeForLogging(val: any, seen = new WeakSet<any>()): any {
  if (val === null || val === undefined) {
    return val;
  }

  const type = typeof val;
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return val;
  }

  if (type === 'symbol' || type === 'function') {
    return val.toString();
  }

  if (type === 'object') {
    if (seen.has(val)) {
      return '[Circular]';
    }
    seen.add(val);

    // If it's an Error, serialize its key properties
    if (val instanceof Error) {
      return {
        name: val.name,
        message: val.message,
        stack: val.stack
      };
    }

    // Check if it looks like a Firebase/Firestore complex object
    if (val.constructor) {
      const cName = val.constructor.name;
      if (cName && (
        cName.startsWith('Firestore') || 
        cName.startsWith('Document') || 
        cName.startsWith('Query') || 
        cName.startsWith('Collection') ||
        cName === 'FirebaseAppImpl' ||
        cName === 'AuthImpl' ||
        cName.length <= 3 // likely a minified internal class
      )) {
        return `[ComplexObject: ${cName}]`;
      }
    }

    // If it's an array, map its elements
    if (Array.isArray(val)) {
      return val.map(item => sanitizeForLogging(item, seen));
    }

    // If it's a plain object or any other object
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(val)) {
      try {
        const value = val[key];
        cleaned[key] = sanitizeForLogging(value, seen);
      } catch (err) {
        cleaned[key] = `[unreadable: ${err instanceof Error ? err.message : String(err)}]`;
      }
    }
    return cleaned;
  }

  return String(val);
}

export function safeStringify(obj: any): string {
  try {
    const cleaned = sanitizeForLogging(obj);
    return JSON.stringify(cleaned, null, 2);
  } catch (err) {
    return `[Serialization Error: ${err instanceof Error ? err.message : String(err)}]`;
  }
}

/**
 * Patches global console methods to prevent unexpected circular serialization errors
 * which can happen in build/test environments with postMessage bridges.
 * It also suppresses benign HMR WebSocket and preview iframe errors/warnings to keep the console clean.
 */
export function setupConsoleErrorHandler(): void {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = function (...args: any[]) {
    // Suppress benign Vite dev server HMR WebSocket connection errors
    const isViteHmrError = args.some(arg => {
      const str = String(arg);
      return str.includes('[vite] failed to connect to websocket') || 
             str.includes('WebSocket closed without opened');
    });
    if (isViteHmrError) {
      return;
    }

    const sanitizedArgs = args.map(arg => {
      try {
        if (typeof arg === 'object' && arg !== null) {
          return sanitizeForLogging(arg);
        }
      } catch {
        return '[Unserializable Argument]';
      }
      return arg;
    });
    originalError.apply(console, sanitizedArgs);
  };

  console.warn = function (...args: any[]) {
    // Suppress benign iframe/webpush warning logs
    const isWebPushWarning = args.some(arg => {
      const str = String(arg);
      return str.includes('Push registration blocked') || 
             str.includes('cannot request notification permissions inside an iframe');
    });
    if (isWebPushWarning) {
      return;
    }

    const sanitizedArgs = args.map(arg => {
      try {
        if (typeof arg === 'object' && arg !== null) {
          return sanitizeForLogging(arg);
        }
      } catch {
        return '[Unserializable Argument]';
      }
      return arg;
    });
    originalWarn.apply(console, sanitizedArgs);
  };

  // Add global event listeners to prevent the browser from logging benign HMR WebSocket errors/rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      if (reason) {
        const msg = reason.message || String(reason);
        if (msg.includes('WebSocket closed without opened') || msg.includes('failed to connect to websocket')) {
          event.preventDefault(); // Suppress the browser's default logging of this unhandled rejection
        }
      }
    });

    window.addEventListener('error', (event) => {
      const msg = event.message || '';
      if (msg.includes('WebSocket closed without opened') || msg.includes('failed to connect to websocket')) {
        event.preventDefault(); // Suppress the browser's default logging of this error
      }
    });
  }
}
