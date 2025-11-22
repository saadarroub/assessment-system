

export interface PermissionDeniedEvent {
  action: string; // z.B. "DELETE_USER", "VIEW_AUDIT_LOG"
  resource?: string; // z.B. "/api/users/123"
  timestamp: number;
  message?: string;
  isGetRequest?: boolean; // Flag: GET-Request (Blur) vs Action (Toast)
}

type EventListener = (event: PermissionDeniedEvent) => void;

class PermissionEventBusClass {
  private listeners: EventListener[] = [];

  /**
   * Registriere Listener für Permission-Denied-Events
   */
  subscribe(listener: EventListener): () => void {
    this.listeners.push(listener);
    
    // Return Unsubscribe-Function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Emittiere Permission-Denied-Event (wird von Axios Interceptor aufgerufen)
   */
  emit(event: Omit<PermissionDeniedEvent, 'timestamp'>): void {
    const fullEvent: PermissionDeniedEvent = {
      ...event,
      timestamp: Date.now(),
    };

    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(fullEvent);
      } catch (error) {
        console.error('Error in PermissionEventBus listener:', error);
      }
    });
  }

  /**
   * Cleanup (für Tests)
   */
  clear(): void {
    this.listeners = [];
  }
}

// Singleton Export
export const PermissionEventBus = new PermissionEventBusClass();
