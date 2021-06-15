import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { IQueryHTTP, IQueryResult, IQuerySettings } from './types';
import { prepareParams } from './utils';

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  private cache: { [key: string]: any } = {};

  constructor(private http: HttpClient) {}

  private makeRequest(queryHTTP: IQueryHTTP, subject: BehaviorSubject<IQueryResult>, id?: string): void {
    this.http
      .request(queryHTTP.method, queryHTTP.path, {
        ...(queryHTTP?.params ? { params: prepareParams(queryHTTP.params) } : {}),
        ...(queryHTTP?.body ? { body: queryHTTP.body } : {}),
        ...(queryHTTP?.observe ? { observe: queryHTTP.observe } : {}),
        ...(queryHTTP?.reportProgress ? { reportProgress: queryHTTP.reportProgress } : {}),
        ...(queryHTTP?.responseType ? { responseType: queryHTTP.responseType } : {}),
      })
      .subscribe(
        (data: any) => {
          if (id) {
            if (!this.cache[id] || JSON.stringify(data) !== JSON.stringify(this.cache[id])) {
              this.cache[id] = data;
            }
          }
          subject.next({ ...subject.getValue(), ...{ isLoading: false, isRefreshing: false, isSuccess: true, data } });
        },
        (error: any) => subject.next({ ...subject.getValue(), ...{ isLoading: false, isRefreshing: false, isError: true, error } }),
      );
  }

  public query(
    id: string,
    queryHTTP: IQueryHTTP,
    querySettings: Partial<IQuerySettings> = { refreshInBackground: false, saveInCache: false },
  ): Observable<IQueryResult> {
    const result: IQueryResult = { isLoading: false, isRefreshing: false, isSuccess: false, isError: false, data: null, error: null };
    let subject: BehaviorSubject<IQueryResult>;

    if (this.cache[id]) {
      result.isSuccess = true;
      result.data = this.cache[id];
      if (querySettings.refreshInBackground) {
        result.isRefreshing = true;
      }
      subject = new BehaviorSubject(result);
      if (querySettings.refreshInBackground) {
        this.makeRequest(queryHTTP, subject, querySettings.saveInCache ? id : undefined);
      }
    } else {
      result.isLoading = true;
      subject = new BehaviorSubject(result);
      this.makeRequest(queryHTTP, subject, querySettings.saveInCache ? id : undefined);
    }

    return subject.pipe(takeWhile((data: any) => data.isLoading || data.isRefreshing, true));
  }

  public mutation(queryHTTP: IQueryHTTP): Observable<IQueryResult> {
    const result: IQueryResult = { isLoading: true, isRefreshing: false, isSuccess: false, isError: false, data: null, error: null };
    const subject: BehaviorSubject<IQueryResult> = new BehaviorSubject(result);

    this.makeRequest(queryHTTP, subject);

    return subject.pipe(takeWhile((data: any) => data.isLoading, true));
  }

  public clearCache(omitIds: string[] = []): void {
    Object.keys(this.cache).forEach((id: string) => {
      if (!omitIds.includes(id)) {
        delete this.cache[id];
      }
    });
  }
}
