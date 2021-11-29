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
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
      }),
    };
    return this.http.post<any>(
      'http://localhost:8088/createCalendar',
      {
        subject: 'toi la thao 1222',
        start: {
          dateTime: '2021-11-27T14:00:16.492Z',
          timeZone: 'UTC',
        },
        end: {
          dateTime: '2021-12-04T14:00:16.492Z',
          timeZone: 'UTC',
        },
      },
      options
    );
  }
}
