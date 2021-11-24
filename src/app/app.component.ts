import { Component, ElementRef, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/angular'; // useful for typechecking
import {
  NgbModal,
  ModalDismissReasons,
  NgbModalConfig,
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'calendar';
  closeResult = '';
  textDate: string = '';
  @ViewChild('content') input: ElementRef | undefined;

  constructor(config: NgbModalConfig, private modalService: NgbModal) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
  }

  open(content: any) {
    this.modalService.open(content);
  }

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    dateClick: this.handleDateClick.bind(this), // bind is important!
    events: [
      { title: 'event 1', date: '2019-04-01' },
      { title: 'event 2', date: '2019-04-02' },
    ],
  };

  handleDateClick(arg: any) {
    this.modalService.open(this.input);
    this.textDate = arg.dateStr;
  }
}
