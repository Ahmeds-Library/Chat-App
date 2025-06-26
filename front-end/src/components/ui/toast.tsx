import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, MessageCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-4 left-1/2 z-[9999] flex max-h-screen w-full max-w-[420px] -translate-x-1/2 flex-col gap-3 p-4",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start justify-between space-x-4 overflow-hidden rounded-xl border-2 p-5 pr-10 shadow-lg transition-all duration-300 ease-out data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out backdrop-blur-sm hover:shadow-xl transform-gpu",
  {
    variants: {
      variant: {
        default: "border-gray-200/80 bg-white/95 text-gray-900 shadow-lg backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-800/95 dark:text-gray-100",
        destructive: "border-red-400/80 bg-red-50/95 text-red-900 shadow-red-300/50 dark:border-red-500/80 dark:bg-red-950/95 dark:text-red-100 dark:shadow-red-900/50",
        success: "border-green-400/80 bg-green-50/95 text-green-900 shadow-green-300/50 dark:border-green-500/80 dark:bg-green-950/95 dark:text-green-100 dark:shadow-green-900/50",
        warning: "border-yellow-400/80 bg-yellow-50/95 text-yellow-900 shadow-yellow-300/50 dark:border-yellow-500/80 dark:bg-yellow-950/95 dark:text-yellow-100 dark:shadow-yellow-900/50",
        info: "border-blue-400/80 bg-blue-50/95 text-blue-900 shadow-blue-300/50 dark:border-blue-500/80 dark:bg-blue-950/95 dark:text-blue-100 dark:shadow-blue-900/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const getToastIcon = (variant: string) => {
  const iconProps = { className: "h-5 w-5 flex-shrink-0" };
  
  switch (variant) {
    case "success":
      return <CheckCircle {...iconProps} className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
    case "destructive":
      return <AlertCircle {...iconProps} className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
    case "warning":
      return <AlertTriangle {...iconProps} className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
    case "info":
      return <Info {...iconProps} className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
    default:
      return <MessageCircle {...iconProps} className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
  }
}

interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
  VariantProps<typeof toastVariants> {
  duration?: number
  persistent?: boolean
  sound?: boolean
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(({ className, variant, duration = 2000, persistent, sound, ...props }, ref) => {
  const [progress, setProgress] = React.useState(100)
  const [isPaused, setIsPaused] = React.useState(false)
  const intervalRef = React.useRef<NodeJS.Timeout>()
  const startTimeRef = React.useRef<number>()

  React.useEffect(() => {
    if (persistent || !duration) return

    const totalDuration = duration
    startTimeRef.current = Date.now()

    const updateProgress = () => {
      if (isPaused) return
      
      const elapsed = Date.now() - startTimeRef.current!
      const remaining = Math.max(0, totalDuration - elapsed)
      const newProgress = (remaining / totalDuration) * 100
      
      setProgress(newProgress)
      
      if (remaining <= 0) {
        clearInterval(intervalRef.current)
      }
    }

    intervalRef.current = setInterval(updateProgress, 50)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [duration, persistent, isPaused])

  const handleMouseEnter = () => {
    setIsPaused(true)
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
    if (startTimeRef.current) {
      startTimeRef.current = Date.now()
    }
  }

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      duration={duration}
      {...props}
    >
      <div className="flex items-start space-x-3 flex-1">
        {variant && (
          <div className="flex-shrink-0 mt-0.5">
            {getToastIcon(variant)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {props.children}
        </div>
      </div>
      {!persistent && duration && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all duration-75 ease-linear rounded-b-xl"
          style={{ width: `${progress}%` }} 
        />
      )}
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-3 top-3 rounded-full p-1.5 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600 hover:bg-white/20 dark:hover:bg-black/20",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90 mt-1 leading-relaxed", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
