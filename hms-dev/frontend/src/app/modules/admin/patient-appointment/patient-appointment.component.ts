import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Calendar as FullCalendar } from '@fullcalendar/core';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import momentPlugin from '@fullcalendar/moment';
import rrulePlugin from '@fullcalendar/rrule';
import timeGridPlugin from '@fullcalendar/timegrid';
import {
    CalendarDrawerMode,
    CalendarEventEditMode,
    CalendarEventPanelMode,
    Doctor,
    Event,
} from 'app/models/appointment';
import { Subject } from 'rxjs';
import { AppointmentService } from 'app/services/appointment.service';
import { clone, cloneDeep } from 'lodash';
import moment from 'moment';
import { TemplatePortal } from '@angular/cdk/portal';
import { map, takeUntil } from 'rxjs/operators';
import { DoctorService } from 'app/services/doctor.service';
import { Constants } from 'app/shared/constants';
import { environment } from 'environments/environment';
@Component({
    selector: 'app-patient-appointment',
    templateUrl: './patient-appointment.component.html',
    styleUrls: ['./patient-appointment.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientAppoinmentComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild('eventPanel') private _eventPanel: TemplateRef<any>;
    @ViewChild('fullCalendar') private _fullCalendar: FullCalendarComponent;
    @ViewChild('drawer') private _drawer: MatDrawer;

    appoinmentForm: FormGroup;
    view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listYear' =
        'dayGridMonth';
    views: any;
    viewTitle: string = 'Nov';
    calendarPlugins: any[] = [
        dayGridPlugin,
        interactionPlugin,
        listPlugin,
        momentPlugin,
        rrulePlugin,
        timeGridPlugin,
    ];
    drawerMode: CalendarDrawerMode = 'side';
    drawerOpened: boolean = true;
    doctors: Doctor[];
    event: Event;
    imgPath = environment.uploadPath;
    appointments: any;
    selectedDate: any;
    eventEditMode: CalendarEventEditMode = 'single';
    eventTimeFormat: any;
    events: Event[] = [];
    tempTask: any[] = [];
    doctorTime = Constants.availibilityDropDown;
    selectedApptId: string;
    panelMode: CalendarEventPanelMode = 'view';
    private _eventPanelOverlayRef: OverlayRef;
    private _fullCalendarApi: FullCalendar;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: Document,
        private _formBuilder: FormBuilder,
        private _overlay: Overlay,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _viewContainerRef: ViewContainerRef,
        private _appointmentService: AppointmentService,
        private _doctorService: DoctorService
    ) {}

    ngOnInit(): void {
        // Create the event form
        this.appoinmentForm = this._formBuilder.group({
            doctor: '',
            time_slot: [''],
            date: [new Date()],
        });

        this._doctorService.doctors$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((doctors: any) => {
                this.doctors = doctors;
                this._changeDetectorRef.markForCheck();
            });

        // Get events
        this._appointmentService.events$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((events) => {
                // Clone the events to change the object reference so
                // that the FullCalendar can trigger a re-render.
                this.events = cloneDeep(events);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._appointmentService.appointments$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((appointment) => {
                this.appointments = appointment;
                this._changeDetectorRef.markForCheck();
            });
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Set the drawerMode and drawerOpened if the given breakpoint is active
                if (matchingAliases.includes('md')) {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                } else {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Build the view specific FullCalendar options
        this.views = {
            dayGridMonth: {
                eventLimit: 3,
                eventTimeFormat: this.eventTimeFormat,
                fixedWeekCount: false,
            },
            timeGrid: {
                allDayText: '',
                columnHeaderFormat: {
                    weekday: 'short',
                    day: 'numeric',
                    omitCommas: true,
                },
                columnHeaderHtml: (
                    date
                ): string => `<span class="fc-weekday">${moment(date).format(
                    'ddd'
                )}</span>
                    <span class="fc-date">${moment(date).format('D')}</span>`,
                slotDuration: '01:00:00',
                slotLabelFormat: this.eventTimeFormat,
            },
            timeGridWeek: {},
            timeGridDay: {},
            listYear: {
                allDayText: 'Appointment',
                eventTimeFormat: this.eventTimeFormat,
                listDayFormat: false,
                listDayAltFormat: false,
            },
        };
    }
    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // Get the full calendar API
        this._fullCalendarApi = this._fullCalendar.getApi();
        // Get the current view's title
        this.viewTitle = this._fullCalendarApi.view.title;

        // Get events
        this._appointmentService.getAppoinment(true).subscribe();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        // Dispose the overlay
        if (this._eventPanelOverlayRef) {
            this._eventPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle Drawer
     */
    toggleDrawer(): void {
        // Toggle the drawer
        this._drawer.toggle();
    }

    getAppointments() {
        return this._appointmentService
            .getAppointments()
            .pipe(
                takeUntil(this._unsubscribeAll),
                map(() => {
                    this._appointmentService.appointments$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((appointment) => {
                            this.appointments = appointment;
                            this._changeDetectorRef.markForCheck();
                        });
                })
            )
            .subscribe();
    }

    onChangeDoctor(doctorId: string) {
        this.appointments.filter((x) => {
            if (
                x.doctor_id === doctorId &&
                this.selectedDate.getTime() === new Date(x.date).getTime()
            ) {
                this.doctorTime = this.doctorTime.filter(
                    y => x.time_slot !== y._id
                );
            }
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Change the event panel mode between view and edit
     * mode while setting the event edit mode
     *
     * @param panelMode
     * @param eventEditMode
     */
    changeEventPanelMode(
        panelMode: CalendarEventPanelMode,
        eventEditMode: CalendarEventEditMode = 'single'
    ): void {
        // Set the panel mode
        this.panelMode = panelMode;

        // Set the event edit mode
        this.eventEditMode = eventEditMode;

        // Update the panel position
        setTimeout(() => {
            this._eventPanelOverlayRef.updatePosition();
        });
    }

    /**
     * Get doctors
     *
     * @param id
     */
    getDoctors(id): any {
        if (!id) {
            return;
        }

        return this.doctors.find(x => x._id === id);
    }

    /**
     * Get doctors time slot
     *
     * @param id
     */
    getDoctorsTimeSlot(id): any {
        if (!id) {
            return;
        }

        return this.doctorTime.find(x => x._id === id);
    }

    /**
     * Change the calendar view
     *
     * @param view
     */
    changeView(
        view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listYear'
    ): void {
        // Store the view
        this.view = view;

        // If the FullCalendar API is available...
        if (this._fullCalendarApi) {
            // Set the view
            this._fullCalendarApi.changeView(view);

            // Update the view title
            this.viewTitle = this._fullCalendarApi.view.title;
        }
    }

    /**
     * Moves the calendar one stop back
     */
    previous(): void {
        // Go to previous stop
        this._fullCalendarApi.prev();

        // Update the view title
        this.viewTitle = this._fullCalendarApi.view.title;
    }

    /**
     * Moves the calendar to the current date
     */
    today(): void {
        // Go to today
        this._fullCalendarApi.today();

        // Update the view title
        this.viewTitle = this._fullCalendarApi.view.title;
    }

    /**
     * Moves the calendar one stop forward
     */
    next(): void {
        // Go to next stop
        this._fullCalendarApi.next();

        // Update the view title
        this.viewTitle = this._fullCalendarApi.view.title;
    }

    /**
     * On date click
     *
     * @param calendarEvent
     */
    onDateClick(calendarEvent): void {
        // Prepare the event
        this.selectedDate = calendarEvent.date;
        if (this.doctors.length > 0) {
            this.onChangeDoctor(this.doctors[0]._id);
        }
        const event = {
            _id: null,
            doctor: '',
            time_slot: '',
            date: calendarEvent.date,
        };
        this.event = event;

        // Set the el on calendarEvent for consistency
        calendarEvent.el = calendarEvent.dayEl;

        // Reset the form and fill the event
        this.appoinmentForm.reset();
        this.appoinmentForm.patchValue(event);

        // Open the event panel
        this._openEventPanel(calendarEvent);

        // Change the event panel mode
        this.changeEventPanelMode('add');
    }

    /**
     * On event click
     *
     * @param taskEvent
     */
    onEventClick(taskEvent): void {
        // Find the event with the clicked event's id
        const event: any = cloneDeep(
            this.events.find(
                item => item._id === taskEvent.event.extendedProps._id
            )
        );

        // Set the event
        this.event = event;
        this.selectedApptId = event._id;
        // Reset the form and fill the event
        this.appoinmentForm.reset();

        this.appoinmentForm.get('doctor').setValue(event.doctor_id);
        this.onChangeDoctor(event.doctor_name);
        this.appoinmentForm.patchValue(event);
        // Open the event panel
        this._openEventPanel(taskEvent);
    }

    /**
     * On event render
     *
     * @param calendarEvent
     */
    onEventRender(calendarEvent): void {
        // If current view is year list...
        if (this.view === 'listYear') {
            // Create a new 'fc-list-item-date' node
            const fcListItemDate1 = `<td class="fc-list-item-date">
                                            <span>
                                                <span>${moment(
                                                    calendarEvent.event.start
                                                ).format('D')}</span>
                                                <span>${moment(
                                                    calendarEvent.event.start
                                                ).format('MMM')}, ${moment(
                calendarEvent.event.start
            ).format('ddd')}</span>
                                            </span>
                                        </td>`;
            const fcListItemDate2 = `<td class="fc-list-item-date">
                                            <span>
                                               ${
                                                   this.getDoctors(
                                                       calendarEvent.event
                                                           .extendedProps
                                                           .doctor_id
                                                   )?.fullName
                                               }
                                            </span>
                                        </td>`;

            // Insert the 'fc-list-item-date' into the calendar event element
            calendarEvent.el.insertAdjacentHTML('afterbegin', fcListItemDate1);
            calendarEvent.el.insertAdjacentHTML('afterbegin', fcListItemDate2);

            // Set the event's title to '(No title)' if event title is not available
            if (!calendarEvent.event.title) {
                calendarEvent.el.querySelector(
                    '.fc-list-item-title'
                ).innerText = '(No title)';
            }
        }
        // If current view is not month list...
        else {
            // Set the event's title to '(No title)' if event title is not available
            if (calendarEvent.event.title) {
                calendarEvent.el.querySelector('.fc-title').innerText =
                    this.getDoctors(calendarEvent.event.extendedProps.doctor_id)
                        ?.fullName +
                    ' ' +
                    calendarEvent.event.title;
            }
        }
    }

    /**
     * On calendar updated
     *
     * @param calendar
     */
    onCalendarUpdated(calendar): void {
        // Re-render the events
        this._fullCalendarApi.rerenderEvents();
    }

    /**
     * Add Appointment
     */
    addEventTask(): void {
        // Get the clone of the event form value
        const newEventAppt = clone(this.appoinmentForm.value);

        // Add the event
        this._appointmentService.addAppt(newEventAppt).subscribe(() => {
            // Reload events
            this._appointmentService.reloadEvent().subscribe();
            this.getAppointments();
            // Close the event panel
            this._closeEventPanel();
        });
    }

    /**
     * Update the appt
     */
    updateEvent(): void {
        // Get the clone of the task form value
        const event = clone(this.appoinmentForm.value);
        const { ...eventWithoutRange } = event;

        // Update the event on the event
        this._appointmentService
            .updateEvent(this.selectedApptId, event)
            .subscribe(() => {
                // Close the event panel
                this.getAppointments();
                this._closeEventPanel();
            });

        // Return
        return;
    }

    /**
     * Delete the given event
     *
     * @param event
     * @param mode
     */
    deleteEvent(event, mode: CalendarEventEditMode = 'single'): void {
        // Update the event on the server
        this._appointmentService.deleteEvent(event._id).subscribe(() => {
            // Close the event panel
            this.getAppointments();
            this._closeEventPanel();
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create the event panel overlay
     *
     * @private
     */
    private _createEventPanelOverlay(positionStrategy): void {
        // Create the overlay
        this._eventPanelOverlayRef = this._overlay.create({
            panelClass: ['calendar-event-panel'],
            backdropClass: '',
            hasBackdrop: true,
            scrollStrategy: this._overlay.scrollStrategies.reposition(),
            positionStrategy,
        });

        // Detach the overlay from the portal on backdrop click
        this._eventPanelOverlayRef.backdropClick().subscribe(() => {
            this._closeEventPanel();
        });
    }

    /**
     * Open the event panel
     *
     * @private
     */
    private _openEventPanel(calendarEvent): void {
        const positionStrategy = this._overlay
            .position()
            .flexibleConnectedTo(calendarEvent.el)
            .withFlexibleDimensions(false)
            .withPositions([
                {
                    originX: 'end',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'top',
                    offsetX: 8,
                },
                {
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'end',
                    overlayY: 'top',
                    offsetX: -8,
                },
                {
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'end',
                    overlayY: 'bottom',
                    offsetX: -8,
                },
                {
                    originX: 'end',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'bottom',
                    offsetX: 8,
                },
            ]);

        // Create the overlay if it doesn't exist
        console.log('this._eventPanelOverlayRef: ', this._eventPanelOverlayRef);
        if (!this._eventPanelOverlayRef) {
            this._createEventPanelOverlay(positionStrategy);
        }
        // Otherwise, just update the position
        else {
            this._eventPanelOverlayRef.updatePositionStrategy(positionStrategy);
        }

        // Attach the portal to the overlay
        this._eventPanelOverlayRef.attach(
            new TemplatePortal(this._eventPanel, this._viewContainerRef)
        );

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Close the event panel
     *
     * @private
     */
    private _closeEventPanel(): void {
        // Detach the overlay from the portal
        this._eventPanelOverlayRef.detach();

        // Reset the panel and event edit modes
        this.panelMode = 'view';
        this.eventEditMode = 'single';

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
}
