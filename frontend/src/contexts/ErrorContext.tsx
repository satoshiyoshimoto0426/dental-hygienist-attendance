import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ErrorInfo {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  details?: any;
  timestamp: Date;
}

interface ErrorContextType {
  errors: ErrorInfo[];
  addError: (message: string, type?: ErrorInfo['type'], details?: any) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const addError = (message: string, type: ErrorInfo['type'] = 'error', details?: any) => {
    const newError: ErrorInfo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      message,
      type,
      details,
      timestamp: new Date()
    };
    
    setErrors(prev => [...prev, newError]);
    
    // 自動削除（5秒後）
    setTimeout(() => {
      removeError(newError.id);
    }, 5000);
  };

  const removeError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <ErrorContext.Provider value={{ errors, addError, removeError, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
};