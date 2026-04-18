export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseFailure;

export interface ApiResponseSuccess<T> {
    success: true;
    data: T;
    error?: never;
};

export interface ApiResponseFailure {
    success: false;
    data?: never;
    error: string;
};
