import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { IAngularQueryHTTP, IAngularQueryResult, IAngularQuerySettings } from './types';
import { prepareParams } from './utils';

@Injectable({
  providedIn: 'root'
})
export class AngularQueryService {
  private cache: { [key: string]: any } = {};

  constructor(private http: HttpClient) { }

  private makeRequest(queryHTTP: IAngularQueryHTTP, subject: BehaviorSubject<IAngularQueryResult>, id?: string): void {
    this.http.request(
        queryHTTP.method,
        queryHTTP.path,
        {
          ...queryHTTP?.params ? { params: prepareParams(queryHTTP.params) } : {},
          ...queryHTTP?.body ? { body: queryHTTP.body } : {}
        }
      )
      .subscribe(
        (data: any) => {
          if (id) {
            if (!this.cache[id] || JSON.stringify(data) !== JSON.stringify(this.cache[id])) {
              this.cache[id] = data;
            }
          }
          subject.next({ ...subject.getValue(), ...{ isLoading: false, isRefreshing: false, data } });
        },
        (error: any) => subject.next({ ...subject.getValue(), ...{ isLoading: false, isRefreshing: false, isError: true, error } })
      );
  }

  public query(id: string, queryHTTP: IAngularQueryHTTP, querySettings: Partial<IAngularQuerySettings> = { refresh: false }): Observable<IAngularQueryResult> {
    const result: IAngularQueryResult = { isLoading: false, isRefreshing: false, isError: false, data: null, error: null };
    let subject: BehaviorSubject<IAngularQueryResult>;

    if (this.cache[id]) {
      result.data = this.cache[id];
      if (querySettings.refresh) {
        result.isRefreshing = true;
      }
      subject = new BehaviorSubject(result);
      if (querySettings.refresh) {
        this.makeRequest(queryHTTP, subject, id);
      }
    } else {
      result.isLoading = true;
      subject = new BehaviorSubject(result);
      this.makeRequest(queryHTTP, subject, id);
    }

    return subject.pipe(takeWhile((data: any) => data.isLoading || data.isRefreshing, true));
  }

  public mutation(queryHTTP: IAngularQueryHTTP): Observable<IAngularQueryResult> {
    const result: IAngularQueryResult = { isLoading: false, isRefreshing: false, isError: false, data: null, error: null };
    let subject: BehaviorSubject<IAngularQueryResult>;

    result.isLoading = true;
    subject = new BehaviorSubject(result);
    this.makeRequest(queryHTTP, subject);

    return subject.pipe(takeWhile((data: any) => data.isLoading, true));
  }

  public clearCache(): void {
    this.cache = {};
  }
}
