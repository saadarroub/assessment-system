export type SessionEvent = {
  type: "EXPIRED";
  message?: string;
};

type Listener = (event: SessionEvent) => void;

class SessionEventBusClass {
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
  this.listeners.delete(listener);
};

  }

  emit(event: SessionEvent) {
    this.listeners.forEach((l) => l(event));
  }
}

export const SessionEventBus = new SessionEventBusClass();
