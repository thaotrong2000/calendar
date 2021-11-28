import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}
