export interface IAngularQuerySettings {
    refresh: boolean;
}
  
export interface IAngularQueryHTTP {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    params?: Record<string, any>;
    body?: Record<string, any>;
}
  
export interface IAngularQueryResult<T = any> {
    isLoading: boolean;
    isRefreshing: boolean;
    isError: boolean;
    data: T;
    error: any;
}