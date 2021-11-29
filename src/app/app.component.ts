import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/angular'; // useful for typechecking
import { Injectable } from '@angular/core';
import {
  NgbDateAdapter,
  NgbDateParserFormatter,
} from '@ng-bootstrap/ng-bootstrap';
import {
  NgbModal,
  ModalDismissReasons,
  NgbModalConfig,
} from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

import { CommonService } from 'src/services/common.service';

@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {
  readonly DELIMITER = '-';

  fromModel(value: string | null): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }

  toModel(date: NgbDateStruct | null): string | null {
    return date
      ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year
      : null;
  }
}

/**
 * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.
 */
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date
      ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year
      : '';
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class AppComponent implements OnInit {
  title = 'calendar';
  closeResult = '';
  startText: string = '';
  endText: string = '';
  subjectText: string = '';
  noMeeting: string = '';
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    dateClick: this.handleDateClick.bind(this), // bind is important!
    events: [
      { title: 'event 1', date: '2019-04-01' },
      { title: 'event 2', date: '2019-04-02' },
    ],
  };
  @ViewChild('content') input: ElementRef | undefined;
  @ViewChild('calendar') calendarDialog: ElementRef | undefined;

  inforCalendar: any;

  model: NgbDateStruct | undefined;
  date: { year: number; month: number } | undefined;

  model1: string = '';
  model2: string = '';

  hourStart: string = '';
  hourEnd: string = '';
  subject: string = '';

  // Convert XML to JSON

  constructor(
    config: NgbModalConfig,
    private modalService: NgbModal,
    private commonService: CommonService,
    private calendar: NgbCalendar,
    private ngbCalendar: NgbCalendar,
    private dateAdapter: NgbDateAdapter<string>
  ) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
  }
  ngOnInit(): void {
    // Get infor about Calendar
    this.commonService.getInforCalendar().subscribe((data) => {
      this.inforCalendar = data.value;
      console.log(this.inforCalendar);
    });
  }

  get today() {
    return this.dateAdapter.toModel(this.ngbCalendar.getToday())!;
  }

  public selectToday() {
    this.model = this.calendar.getToday();
  }

  public openCalendar(): void {
    this.modalService.open(this.calendarDialog);
  }

  public open(content: any) {
    this.modalService.open(content);
  }

  public handleDateClick(arg: any) {
    this.modalService.open(this.input);
    console.log(arg.dateStr);

    for (const key in this.inforCalendar) {
      this.startText = '';
      this.endText = '';
      console.log(this.inforCalendar[key].start.dateTime.slice(0, 10));
      if (this.inforCalendar[key].start.dateTime.slice(0, 10) == arg.dateStr) {
        this.noMeeting = '';
        this.subjectText = this.inforCalendar[key].subject;
        this.startText =
          'Thời gian bắt đầu: ' +
          this.inforCalendar[key].start.dateTime.slice(11, 16);

        this.endText = ` Thời gian kết thúc:
          ${this.inforCalendar[key].end.dateTime.slice(
            11,
            16
          )}, ngày: ${this.inforCalendar[key].end.dateTime
          .slice(0, 10)
          .slice(8, 10)}-${this.inforCalendar[key].end.dateTime
          .slice(0, 10)
          .slice(5, 7)}-${this.inforCalendar[key].end.dateTime
          .slice(0, 10)
          .slice(0, 4)}`;

        break;
      }

      if (Number(key) == this.inforCalendar.length - 1) {
        this.noMeeting = 'Không có cuộc họp.';
      }
    }
  }

  public createMeeting(): void {
    console.log(this.hourStart + ' ' + 'gio ket thuc: ' + this.hourEnd);

    // Custom model 1:
    if (!Number.isInteger(Number(this.model1?.slice(1, 2)))) {
      this.model1 = '0' + this.model1;
    }

    if (!Number.isInteger(Number(this.model1?.slice(-7, -6)))) {
      this.model1 =
        this.model1.slice(0, this.model1.length - 6) +
        '0' +
        this.model1.slice(this.model1.length - 6);
    }

    var startPost = `${this.model1?.slice(6, 10)}-${this.model1?.slice(
      3,
      5
    )}-${this.model1?.slice(0, 2)}T${this.hourStart}`;

    console.log(startPost);

    // Custom model 2:
    if (!Number.isInteger(Number(this.model2?.slice(1, 2)))) {
      this.model2 = '0' + this.model2;
    }

    if (!Number.isInteger(Number(this.model2?.slice(-7, -6)))) {
      this.model2 =
        this.model2.slice(0, this.model2.length - 6) +
        '0' +
        this.model2.slice(this.model2.length - 6);
    }

    var endPost = `${this.model2?.slice(6, 10)}-${this.model2?.slice(
      3,
      5
    )}-${this.model2?.slice(0, 2)}T${this.hourEnd}`;
    console.log(endPost);

    this.commonService
      .createMeetingCalendar({
        subject: this.subject,
        start: {
          dateTime: startPost,
          timeZone: 'UTC',
        },
        end: {
          dateTime: endPost,
          timeZone: 'UTC',
        },
      })
      .subscribe(
        (data) => {
          console.log(data);
        },
        (err) => console.log(err)
      );
  }
}
