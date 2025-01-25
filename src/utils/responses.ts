interface SuccessResponse {
  success: true;
  message: string;
  data?: any;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

export const sendSuccess = (res: any, status: number, message: string, data?: any): void => {
  const response: SuccessResponse = {
    success: true,
    message,
    ...(data && { data })
  };
  res.status(status).json(response);
};

export const sendError = (res: any, status: number, error: string): void => {
  const response: ErrorResponse = {
    success: false,
    error
  };
  res.status(status).json(response);
};

export const errorResponse = (error: string, details?: any): ErrorResponse => ({
  success: false,
  error,
  ...(details && { details })
});

export const successResponse = (message: string, data?: any): SuccessResponse => ({
  success: true,
  message,
  ...(data && { data })
});
