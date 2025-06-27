
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, duration, persistent, sound, ...props }, index) {
        return (
          <Toast 
            key={id} 
            variant={variant}
            duration={duration}
            persistent={persistent}
            sound={sound}
            className="animate-fade-in"
            style={{
              animationDelay: `${Math.min(index * 100, 500)}ms`,
              zIndex: 9999 - index,
              marginBottom: index > 0 ? '8px' : '0'
            }}
            {...props}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
