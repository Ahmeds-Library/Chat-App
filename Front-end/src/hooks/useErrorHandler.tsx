import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  customMessage?: string;
  action?: () => void;
}

interface ApiError {
  status?: number;
  message?: string;
  details?: string;
}

export const useErrorHandler = () => {
  const handleError = useCallback((
    error: Error | ApiError | unknown, 
    context: string = 'Unknown',
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logToConsole = true,
      customMessage,
      action
    } = options;

    // Extract error information
    let errorMessage = 'An unexpected error occurred';
    let status: number | undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      const apiError = error as ApiError;
      errorMessage = apiError.message || errorMessage;
      status = apiError.status;
    }

    // Enhanced error logging for production debugging
    if (logToConsole) {
      const errorInfo = {
        context,
        message: errorMessage,
        status,
        error,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id : null
      };
      
      console.group(`🚨 Error in ${context}`);
      console.error('Error Details:', errorInfo);
      console.groupEnd();
    }

    // Categorize errors for better user experience
    let title = "Error";
    let description = customMessage || errorMessage;
    
    if (status) {
      switch (status) {
        case 400:
          title = "Invalid Request";
          description = customMessage || "Please check your input and try again.";
          break;
        case 401:
          title = "Authentication Required";
          description = customMessage || "Please log in to continue.";
          break;
        case 403:
          title = "Access Denied";
          description = customMessage || "You don't have permission to perform this action.";
          break;
        case 404:
          title = "Not Found";
          description = customMessage || "The requested resource was not found.";
          break;
        case 429:
          title = "Too Many Requests";
          description = customMessage || "Please wait a moment and try again.";
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          title = "Server Error";
          description = customMessage || "Our servers are experiencing issues. Please try again later.";
          break;
        default:
          title = "Network Error";
          description = customMessage || "Please check your connection and try again.";
      }
    }

    // Show toast notification with enhanced UX
    if (showToast) {
      toast({
        title,
        description,
        variant: "destructive",
        action: action ? (
          <ToastAction onClick={action} altText="Retry action">
            Retry
          </ToastAction>
        ) : undefined,
      });
    }

    return { message: errorMessage, status, title, description };
  }, []);

  const handleApiError = useCallback((
    error: any,
    context: string,
    options: ErrorHandlerOptions = {}
  ) => {
    return handleError(error, context, {
      ...options,
      logToConsole: true
    });
  }, [handleError]);

  const handleNetworkError = useCallback((
    context: string,
    retryAction?: () => void
  ) => {
    return handleError(
      new Error('Network connection failed'),
      context,
      {
        customMessage: 'Please check your internet connection',
        action: retryAction
      }
    );
  }, [handleError]);

  return { 
    handleError, 
    handleApiError, 
    handleNetworkError 
  };
};
