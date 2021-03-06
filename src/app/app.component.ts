import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CalendarOptions, FullCalendarComponent } from '@fullcalendar/angular'; // useful for typechecking
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
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';

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
export class AppComponent implements OnInit, AfterViewInit {
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
  @ViewChild('alertMeeting') alertMeeting: ElementRef | undefined;
  @ViewChild('alertDeleteFolder') alertDeleteFolder: ElementRef | undefined;
  @ViewChild('calendarCustom') calendarCustom:
    | FullCalendarComponent
    | undefined;

  inforCalendar: any;

  model: NgbDateStruct | undefined;
  date: { year: number; month: number } | undefined;

  model1: string = '';
  model2: string = '';

  hourStart: string = '';
  hourEnd: string = '';
  subject: string = '';

  msgMeeting: string = 'T???o cu???c h???p th??nh c??ng';
  statusCreateMeeting: boolean = false;
  messageSlack: any;

  arrayInforDay: Array<any> = new Array<any>();

  listMessageMeeting: Array<any> = [];

  storeDriverId: Array<any> = [];

  driverId: any;

  valueOfLocalStorage: Array<any> = [];

  valueDemo: Array<any> = [];

  checkCreateMeeting: boolean = false;

  saveInforEvent: Array<any> = [];

  nameFolder: string = '';

  // Convert XML to JSON

  constructor(
    config: NgbModalConfig,
    private modalService: NgbModal,
    private commonService: CommonService,
    private calendar: NgbCalendar,
    private ngbCalendar: NgbCalendar,
    private dateAdapter: NgbDateAdapter<string>,
    private SpinnerService: NgxSpinnerService,
    private ele: ElementRef
  ) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
  }
  ngAfterViewInit(): void {
    this.changeColorDate();
  }
  ngOnInit(): void {
    this.getInforBegin();
  }

  get today() {
    return this.dateAdapter.toModel(this.ngbCalendar.getToday())!;
  }

  public changeColorDate(): void {
    this.valueOfLocalStorage = JSON.parse(
      localStorage.getItem('demoValue') || '{}'
    );
    var demo = this.ele.nativeElement.querySelectorAll('.fc-daygrid-day');
    console.log(this.saveInforEvent);
    for (const value of demo) {
      if (this.saveInforEvent.length > 0) {
        for (const valueOfLocal of this.saveInforEvent) {
          if (valueOfLocal.slice(0, 10) == value?.attributes[2].nodeValue) {
            value.style.backgroundColor = '#ccf5ff';
            break;
          } else {
            value.style.backgroundColor = '#ffffff';
          }
        }
      }
    }
  }

  public getInforBegin(): void {
    // Get infor about Calendar
    this.SpinnerService.show();
    this.commonService.getInforCalendar().subscribe((data) => {
      this.inforCalendar = data.value;
      console.log(this.inforCalendar);

      for (const value of this.inforCalendar) {
        this.saveInforEvent.push(value.start.dateTime.toString().slice(0, 19));
      }

      this.changeColorDate();

      console.log(this.saveInforEvent);
      // Get message from slack
      this.getMessageSlack();
    });
  }

  public getMessageSlack(): void {
    this.commonService.getMessageSlack().subscribe((data) => {
      this.messageSlack = data.messages;
      for (const message of this.messageSlack) {
        if (
          message.type == 'message' &&
          message.text.slice(0, 8) == '#meeting'
        ) {
          this.listMessageMeeting.push(message.text.slice(-19));
        }
      }

      console.log(this.listMessageMeeting);
      console.log(this.inforCalendar);

      for (const meeting of this.listMessageMeeting) {
        for (const value of this.inforCalendar) {
          if (value.start.dateTime.slice(0, 19) == meeting) {
            this.checkCreateMeeting = true;
            break;
          }
        }
        console.log(this.checkCreateMeeting);
        if (!this.checkCreateMeeting) {
          console.log('la toi day');
          var endMeeting =
            meeting.slice(0, 11) +
            (Number(meeting.slice(11, 13)) + 2) +
            meeting.slice(13);
          this.commonService
            .createMeetingCalendar({
              subject: 'T???o m???i m???t cu???c h???p',
              start: {
                dateTime: meeting,
                timeZone: 'UTC',
              },
              end: {
                dateTime: endMeeting,
                timeZone: 'UTC',
              },
            })
            .subscribe((data) => {
              console.log('ban o day');
            });
        }
      }

      this.SpinnerService.hide();
    });
  }

  public selectToday() {
    this.model = this.calendar.getToday();
  }

  public openCalendar(): void {
    this.modalService.open(this.calendarDialog);
    this.subject = '';
    this.nameFolder = '';
    this.hourStart = '';
    this.hourEnd = '';
    this.model1 = '';
    this.model2 = '';
  }

  public open(content: any) {
    this.modalService.open(content);
  }

  public handleDateClick(arg: any) {
    console.log(this);

    console.log(this.inforCalendar);
    this.modalService.open(this.input);
    console.log(arg.dateStr);
    this.arrayInforDay = [];
    this.valueOfLocalStorage = JSON.parse(
      localStorage.getItem('demoValue') || '{}'
    );

    console.log(this.valueOfLocalStorage);

    for (const key in this.inforCalendar) {
      this.startText = '';
      this.endText = '';
      this.noMeeting = '';
      console.log(this.inforCalendar[key].start.dateTime.slice(0, 10));
      if (this.inforCalendar[key].start.dateTime.slice(0, 10) == arg.dateStr) {
        if (this.inforCalendar[key].start.dateTime.slice(0, 16)) {
          console.log(this.inforCalendar[key].start.dateTime.slice(0, 16));
          for (const value of this.valueOfLocalStorage) {
            if (
              value.date.slice(0, 16) ==
              this.inforCalendar[key].start.dateTime.slice(0, 16)
            ) {
              this.driverId = value.driverId;
            }
          }
        }
        this.noMeeting = '';
        this.subjectText = this.inforCalendar[key].subject;
        this.startText =
          'Th???i gian b???t ?????u: ' +
          this.inforCalendar[key].start.dateTime.slice(11, 16);

        this.endText = ` Th???i gian k???t th??c:
          ${this.inforCalendar[key].end.dateTime.slice(
            11,
            16
          )}, ng??y: ${this.inforCalendar[key].end.dateTime
          .slice(0, 10)
          .slice(8, 10)}-${this.inforCalendar[key].end.dateTime
          .slice(0, 10)
          .slice(5, 7)}-${this.inforCalendar[key].end.dateTime
          .slice(0, 10)
          .slice(0, 4)}`;

        this.arrayInforDay.push({
          subjectText: this.subjectText,
          startText: this.startText,
          endText: this.endText,
          driverId: this.driverId,
          meetingId: this.inforCalendar[key].id,
        });
      }

      if (Number(key) == this.inforCalendar.length - 1) {
        if (this.arrayInforDay.length == 0) {
          this.noMeeting = 'Kh??ng c?? cu???c h???p.';
        }
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
          if (this.nameFolder) {
            this.nameFolder = this.nameFolder.split(' ').join('+');

            this.commonService.createFileDriver(this.nameFolder).subscribe(
              (data) => {
                console.log(data);
              },
              (err) => {
                console.log('okkkk');
                console.log(err);
                this.storeDriverId.push({
                  date: startPost,
                  driverId: err.error.text,
                });
                this.valueOfLocalStorage = JSON.parse(
                  localStorage.getItem('demoValue') || '{}'
                );
                this.valueOfLocalStorage.push({
                  date: startPost,
                  driverId: err.error.text,
                });

                console.log('okkkbayyyy');

                localStorage.setItem(
                  'demoValue',
                  JSON.stringify(this.valueOfLocalStorage)
                );
                this.valueOfLocalStorage = JSON.parse(
                  localStorage.getItem('demoValue') || '{}'
                );
                var demo =
                  this.ele.nativeElement.querySelectorAll('.fc-daygrid-day');
                for (const value of demo) {
                  for (const valueOfLocal of this.valueOfLocalStorage) {
                    if (
                      valueOfLocal.date.slice(0, 10) ==
                      value?.attributes[2].nodeValue
                    ) {
                      value.style.backgroundColor = '#ccf5ff';
                      break;
                    }
                  }
                }
                this.getInforBegin();
              }
            );
          }

          console.log(data);
          this.statusCreateMeeting = true;
          this.msgMeeting = 'T???o cu???c h???p th??nh c??ng';
          this.openAlertMeeting();
        },
        (err) => {
          console.log(err);
          this.statusCreateMeeting = false;
          this.msgMeeting = 'T???o cu???c h???p kh??ng th??nh c??ng';
          this.openAlertMeeting();
        }
      );
  }

  public openAlertMeeting(): void {
    this.modalService.open(this.alertMeeting);
  }

  public openAlertDeleteFolder(): void {
    this.modalService.open(this.alertDeleteFolder);
  }

  public deleteMeeting(idMeeting: any) {
    this.commonService.deleteMeeting(idMeeting).subscribe((data) => {
      console.log(data);
      this.modalService.dismissAll('Cross click');
      this.openAlertDeleteFolder();

      for (const key in this.arrayInforDay) {
        if (this.arrayInforDay[key].meetingId == idMeeting) {
          this.arrayInforDay.splice(Number(key), 1);
        }
      }

      this.saveInforEvent = [];

      this.getInforBegin();
      this.changeColorDate();
    });
  }

  public deleteFolder(driverId: any): void {
    this.commonService.deleteFolderDriver(driverId).subscribe((data) => {
      console.log(data);
    });
  }
}
