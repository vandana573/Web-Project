import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import moment from 'moment';
import { Constants } from 'app/shared/constants';
import { environment } from 'environments/environment';
import { UserService } from 'app/core/user/user.service';
import { Event, TaskStatus } from 'app/models/appointment';
import { Pagination } from 'app/models/pagination';
import * as FileSaver from 'file-saver';
@Injectable({
    providedIn: 'root',
})
export class AppointmentService {
    temp_appt: any[] = [];
    filterTasks: any;
    // Private
    private _events: BehaviorSubject<Event[] | null> = new BehaviorSubject(
        null
    );
    private _pagination: BehaviorSubject<Pagination | null> =
        new BehaviorSubject(null);
    private _appointments: BehaviorSubject<[] | null> = new BehaviorSubject(
        null
    );
    private _appointment: BehaviorSubject<null> = new BehaviorSubject(null);
    private userD;
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    ) {
        this._userService.user$.subscribe((user: any) => {
            this.userD = user;
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<Pagination> {
        return this._pagination.asObservable();
    }

    get appointment$(): Observable<any> {
        return this._appointment.asObservable();
    }

    get appointments$(): Observable<[]> {
        return this._appointments.asObservable();
    }

    get events$(): Observable<Event[]> {
        return this._events.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    updateCalendar(
        id: string,
        role: string,
        visibility: boolean,
        taskArray: any
    ): Observable<Event[]> {
        if (this.temp_appt.length === 0) {
            this.temp_appt = this._events.getValue();
        }
        return of(this.temp_appt);
    }

    /**
     * Get events
     *
     * @param replace
     */
    getAppoinment(replace = false): Observable<Event[]> {
        return this._httpClient
            .get<Event[]>(
                environment.apiBaseUrl +
                    '/get-patient-appointment/' +
                    this.userD._id
            )
            .pipe(
                switchMap((response: any) =>
                    this._events.pipe(
                        take(1),
                        map((eventsData) => {
                            // If replace...
                            if (replace) {
                                // Execute the observable with the response replacing the events object
                                this._events.next(response.results);
                            }
                            // Otherwise...
                            else {
                                // If events is null, replace it with an empty array
                                eventsData = eventsData || [];

                                // Execute the observable by appending the response to the current events
                                this._events.next([
                                    ...eventsData,
                                    ...response.data,
                                ]);
                            }

                            // Return the response
                            return response.data;
                        })
                    )
                )
            );
    }

    /**
     * Reload tasks using the loaded tasks range
     */
    reloadEvent(): Observable<Event[]> {
        // Get the task
        return this._httpClient
            .get<Event[]>(
                environment.apiBaseUrl +
                    '/get-patient-appointment/' +
                    this.userD._id
            )
            .pipe(
                map((response: any) => {
                    // Execute the observable with the response replacing the events object
                    this._events.next(response.results);

                    // Return the response
                    return response.results;
                })
            );
    }

    /**
     * Add Appt
     */
    addAppt(formData): Observable<Event> {
        const obj = {
            doctor_id: formData.doctor,
            time_slot: formData.time_slot,
            date: formData.date,
            check_date: moment(formData.date).format('yyyy-MM-DD'),
            patient_id: this.userD._id,
        };
        return this.events$.pipe(
            take(1),
            switchMap((eventsData: any) =>
                this._httpClient
                    .post<Event>(
                        environment.apiBaseUrl +
                            '/add-update-appointment-detail',
                        obj
                    )
                    .pipe(
                        map((addedEventAppt) => {
                            this._events.next(eventsData);
                            return addedEventAppt;
                        })
                    )
            )
        );
    }

    /**
     * Update event
     *
     * @param id
     */
    updateEvent(id: string, formData): Observable<Event> {
        const obj = {
            doctor_id: formData.doctor,
            time_slot: formData.time_slot,
            date: formData.date,
            patient_id: this.userD._id,
            appointmentId: id,
        };
        return this.events$.pipe(
            take(1),
            switchMap((apptData: any) =>
                this._httpClient
                    .post<Event>(
                        environment.apiBaseUrl +
                            '/add-update-appointment-detail',
                        obj
                    )
                    .pipe(
                        map((updatedAppt: any) => {
                            // Find the index of the updated event
                            const index = apptData.findIndex(
                                (item) => item._id === id
                            );

                            // Update the event
                            apptData[index] = updatedAppt.task;

                            // Update the events
                            this._events.next(apptData);
                            this._appointments.next(apptData);

                            // Return the updated event
                            return updatedAppt.task;
                        })
                    )
            )
        );
    }

    /**
     * Delete event
     *
     * @param id
     */
    deleteEvent(id: string): Observable<Event> {
        return this.events$.pipe(
            take(1),
            switchMap((eventsdata) =>
                this._httpClient
                    .delete<Event>(
                        environment.apiBaseUrl +
                            '/update-appointment-status/' +
                            id
                    )
                    .pipe(
                        map((isDeleted) => {
                            // Find the index of the deleted task
                            const index = eventsdata.findIndex(
                                (item) => item._id === id
                            );

                            // Delete the task
                            eventsdata.splice(index, 1);

                            // Update the tasks
                            this._events.next(eventsdata);

                            // Return the deleted status
                            return isDeleted;
                        })
                    )
            )
        );
    }

    /**
     * Get appt
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */
    getAppointments(
        page: number = 0,
        size: number = 1000,
        sort: string = 'created_date',
        order: 'asc' | 'desc' | '' = 'desc',
        search: string = ''
    ): Observable<{ pagination: Pagination; appointmentDetails: [] }> {
        return this._httpClient
            .get<{ pagination: Pagination; appointmentDetails: [] }>(
                environment.apiBaseUrl + '/appointment-list',
                {
                    params: {
                        page: '' + page,
                        size: '' + size,
                        sort,
                        order,
                        search,
                    },
                }
            )
            .pipe(
                tap((response) => {
                    this._pagination.next(response.pagination);
                    this._appointments.next(response.appointmentDetails);
                })
            );
    }

    uploadReport(obj) {
        return this._httpClient.post(
            environment.apiBaseUrl + '/upload-report',
            obj
        );
    }

    addAppointmentReport(report_name: string, file: string, apptId: string) {
        const obj = {
            report_name: report_name,
            report_file: file,
        };
        return this._httpClient
            .post(
                environment.apiBaseUrl + `/update-appointment-report/${apptId}`,
                obj
            )
            .pipe(switchMap((response: any) => of(response)));
    }

    getApptCount(): Observable<any> {
        return this._httpClient.get(
            environment.apiBaseUrl + '/appointment-list-count'
        );
    }

    getPatientReports(formdata): Observable<any> {
        return this._httpClient.get(
            environment.apiBaseUrl + '/get-patient-report',
            {
                params: {
                    patient_id: this.userD._id,
                    doctor_id: formdata.doctor,
                    check_date: moment(formdata.date).format('yyyy-MM-DD'),
                    time_slot: formdata.time,
                },
            }
        );
    }

    // To download report
    downloadReport(name, file) {
        this._httpClient
            .get(environment.uploadPath + 'reports/' + file, {
                responseType: 'blob',
            })
            .subscribe(
                async (res) => {
                    try {
                        const objFile = window.URL.createObjectURL(res);
                        await FileSaver.saveAs(res, name);
                    } catch (err) {
                        return 'File download error';
                    }
                },
                (err) => {
                    return 'There is no any uploaded file';
                }
            );
    }
}
