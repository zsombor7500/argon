import { signal, Injectable } from '@angular/core';


export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastData {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastsSignal = signal<ToastData[]>([]);

    readonly toasts = this.toastsSignal.asReadonly();

    addToast(toast: { type: ToastType, message: string, duration?: number }): void {
        const newToast: ToastData = {
            ...toast,
            id: `${Date.now()}-${Math.random().toString(36)}`
        };
        this.toastsSignal.update(toasts => [...toasts, newToast]);
        if (toast.duration)
            setTimeout(() => this.deleteToast(newToast.id), toast.duration);
    }

    deleteToast(id: string): void {
        this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id))
    }
}
