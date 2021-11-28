import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/angular'; // useful for typechecking
import {
  NgbModal,
  ModalDismissReasons,
  NgbModalConfig,
} from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'calendar';
  closeResult = '';
  startText: string = '';
  endText: string = '';
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    dateClick: this.handleDateClick.bind(this), // bind is important!
    events: [
      { title: 'event 1', date: '2019-04-01' },
      { title: 'event 2', date: '2019-04-02' },
    ],
  };
  @ViewChild('content') input: ElementRef | undefined;

  inforCalendar: any;

  // Convert XML to JSON

  constructor(
    config: NgbModalConfig,
    private modalService: NgbModal,
    private commonService: CommonService
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
        this.startText = 'Không có cuộc họp.';
      }
    }
  }
}
