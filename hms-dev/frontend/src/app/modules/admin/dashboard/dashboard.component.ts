import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseAlertService, FuseAlertType } from '@fuse/components/alert';
import { AlertService } from 'app/core/alert/alert.service';
import { UserService } from 'app/core/user/user.service';
import { Doctor } from 'app/models/appointment';
import { AppointmentService } from 'app/services/appointment.service';
import { DoctorService } from 'app/services/doctor.service';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: [ './dashboard.component.scss' ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
    userD: any;
    dAppointmentLength: 0;
    pAppointmentLength: any;
    appointTime = [];
    events = [];
    imgPath = environment.uploadPath;
    doctorName = [];
    doctors: Doctor[];
    file = [];
    openRport = false;
    reportForm: FormGroup;
    assignPatientForm: FormGroup;
    patients: any[] = [];
    showGrid: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _userService: UserService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog,
        private _router: Router,
        private _route: ActivatedRoute,
        private _formBuilder: FormBuilder,
        private _doctorService: DoctorService,
        private _appointmentService: AppointmentService,
        private _alertService: AlertService,
        private _fuseAlertService: FuseAlertService
    ) { }

    ngOnInit(): void {
        this.assignPatientForm = this._formBuilder.group({
            patient: [ '', Validators.required ],
        });

        this._appointmentService
            .getApptCount()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                this.dAppointmentLength = data.count;
                this._changeDetectorRef.markForCheck();
            });

        this._appointmentService.events$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((events: any) => {
                this.pAppointmentLength = events.length;
                this.events = events;
                events.map((x) => {
                    if (!this.doctorName.includes(x.doctor_id)) {
                        this.doctorName.push(x.doctor_id);
                    }
                });
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this.getAppointments();

        this._userService.user$.subscribe((user: any) => {
            this.userD = user;
        });

        this.reportForm = new FormGroup({
            doctor: new FormControl([ '', Validators.required ]),
        });

        this._appointmentService
            .getApptCount()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                this.dAppointmentLength = data.count;
                this._changeDetectorRef.markForCheck();
            });

        this._doctorService.doctors$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((doctors: any) => {
                this.doctors = doctors;
                console.log('this.doctors: ', this.doctors);
                this._changeDetectorRef.markForCheck();
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

    onViewReportClick() {
        this.reportForm.reset();
        if (this.doctors.length < 1) {
            this._alertService.message = 'You have no any appointment';
            this._fuseAlertService.show('alert_error');
            setTimeout(() => {
                this._fuseAlertService.dismiss('alert_error');
            }, 3000);
        }
        this.showGrid = false;
        this._appointmentService.events$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((events: any) => {
                this.events = events;
                this._changeDetectorRef.markForCheck();
            });
        this.openRport = true;
    }

    closeReport() {
        this.openRport = false;
    }

    getAppointTime() {
        const selectedDate: string = (() => {
            const date = new Date(this.reportForm.get('date').value);
            return `${date.getFullYear()}-${date.getMonth() + 1
                }-${date.getDate()}`;
        })();
        this.appointTime = [];
        this.events.filter((appt: any) => {
            if (
                appt.doctor_id === this.reportForm.get('doctor').value &&
                new Date(this.reportForm.get('date').value).getTime() ===
                new Date(appt.date).getTime()
            ) {
                this.appointTime.push(appt.time_slot);
            }
        });
        if (this.appointTime.length < 1) {
            this._alertService.message =
                'You have no appointment on date ' + selectedDate;
            this._fuseAlertService.show('alert_error');
            setTimeout(() => {
                this._fuseAlertService.dismiss('alert_error');
            }, 3000);
            return;
        }
    }

    viewEvents() {
        if (this.reportForm.invalid) {
            return;
        }
        const doctor_id = this.reportForm.get('doctor').value;
        this.events = this.events.filter(x => x.doctor_id === doctor_id);
        this.openRport = false;
        this.showGrid = true;
    }

    // for doanload single report
    downloadReport(name, file) {
        this._appointmentService.downloadReport(name, file);
    }

    getAppointments() {
        return this._appointmentService
            .getAppointments()
            .pipe(
                takeUntil(this._unsubscribeAll),
                map(() => {
                    this._appointmentService.appointments$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((appointment: any) => {
                            appointment.map((x) => {
                                if (!this.patients.includes(x.user)) {
                                    this.patients.push(x.user);
                                }
                            });
                            this._changeDetectorRef.markForCheck();
                        });
                })
            )
            .subscribe();
    }

    openLabReportDialog(labReportTemplate: TemplateRef<any>): void {
        this.assignPatientForm.reset();
        const dialogRef = this._matDialog.open(labReportTemplate, {
            autoFocus: false,
        });
    }

    done() {
        if (this.assignPatientForm.invalid) {
            return;
        }

        // Disable the form
        this.assignPatientForm.disable();

        // Hide the alert
        const patientName = this.assignPatientForm.get('patient').value;
        this._matDialog.closeAll();
        this._router.navigate([ '../', 'appointments', patientName ]);
    }
}
