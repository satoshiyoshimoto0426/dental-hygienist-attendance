export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface MonthlyReportQuery {
  year: number;
  month: number;
}

export interface PatientMonthlyStats {
  patient_id: number;
  patient_name: string;
  total_visits: number;
  completed_visits: number;
  cancelled_visits: number;
  scheduled_visits: number;
}

export interface HygienistMonthlyStats {
  hygienist_id: number;
  hygienist_name: string;
  total_visits: number;
  completed_visits: number;
  cancelled_visits: number;
  scheduled_visits: number;
}