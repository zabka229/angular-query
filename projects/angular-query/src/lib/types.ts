export interface IQuerySettings {
    refreshInBackground: boolean;
    saveInCache: boolean;
}
  
export interface IQueryHTTP {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    params?: Record<string, any>;
    body?: Record<string, any>;
    reportProgress?: boolean;
    observe?: 'body' | 'events' | 'response';
    responseType?: 'arraybuffer' | 'blob' | 'text' | 'json';
}
  
export interface IQueryResult<T = any> {
    isLoading: boolean;
    isRefreshing: boolean;
    isSuccess: boolean;
    isError: boolean;
    data: T;
    error: any;
}