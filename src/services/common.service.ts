import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  linkSource: string = 'http://localhost:8088/';

  constructor(private http: HttpClient) {}

  // Get infor about Calendar
  public getInforCalendar(): Observable<any> {
    return this.http.get('http://localhost:8088/getCalendar');
  }

  // (Post) Create a meeting in calendar
  public createMeetingCalendar(body: any): Observable<any> {
    return this.http.post<any>('http://localhost:8088/createCalendar', body);
  }

  // Get message from Slack for create meeting
  public getMessageSlack(): Observable<any> {
    return this.http.get('http://localhost:8088/getSlack');
  }
}
