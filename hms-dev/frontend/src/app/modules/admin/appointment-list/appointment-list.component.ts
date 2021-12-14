import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertService, FuseAlertType } from '@fuse/components/alert';
import { AlertService } from 'app/core/alert/alert.service';
import { UserService } from 'app/core/user/user.service';
import { Doctor } from 'app/models/appointment';
import { Pagination } from 'app/models/pagination';
import { AppointmentService } from 'app/services/appointment.service';
import { DoctorService } from 'app/services/doctor.service';
import { environment } from 'environments/environment';
import { clone, merge } from 'lodash';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-appointment-list',
    templateUrl: './appointment-list.component.html',
    styleUrls: [ './appointment-list.component.scss' ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
})
export class AppointmentListComponent
    implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    appointments;
    imgPath = environment.uploadPath;
    uploadReportForm: FormGroup;
    tempAppt: any[] = [];
    apptFormInput: Observable<any>;

    displayAddApptForm: boolean = false;
    isLoading: boolean = false;
    pagination: Pagination;
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    userD: any;
    doctors: Doctor[];
    patient: any;
    selectedFile: File;
    selectedReport: string = '';
    selectedApptId: string = '';
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _route: ActivatedRoute,
        private _matDialog: MatDialog,
        private _doctorService: DoctorService,
        private _fuseAlertService: FuseAlertService,
        private _alertService: AlertService,
        private _appointmentService: AppointmentService,
        private _userService: UserService
    ) {
        this._userService.user$.subscribe((user: any) => {
            this.userD = user;
        });
    }

    ngOnInit(): void {
        this.uploadReportForm = this._formBuilder.group({
            report_name: [ '', Validators.required ],
        });

        this._appointmentService.appointments$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((appointment) => {
                this.appointments = appointment;
                this._changeDetectorRef.markForCheck();
            });
        this._doctorService.doctors$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((doctors: any) => {
                this.doctors = doctors;
                this._changeDetectorRef.markForCheck();
            });

        // Get the pagination
        this._appointmentService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagination) => {
                // Update the pagination
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });
        this.apptFormInput = this._appointmentService.appointments$;
        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.resetDetails();
                    this.isLoading = true;
                    return this._appointmentService.getAppointments(
                        0,
                        1000,
                        'created_date',
                        'desc',
                        query
                    );
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Mark for check
            this._changeDetectorRef.markForCheck();

            // If the user changes the sort order...
            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    // Reset back to the first page
                    this._paginator.pageIndex = 0;
                    this.resetDetails();
                });

            // Get pallet type if sort or page changes
            merge(this._sort.sortChange, this._paginator.page)
                .pipe(
                    switchMap(() => {
                        this.resetDetails();
                        this.isLoading = true;
                        return this._appointmentService.getAppointments(
                            this._paginator.pageIndex,
                            this._paginator.pageSize,
                            this._sort.active,
                            this._sort.direction
                        );
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                )
                .subscribe();
        }
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    resetDetails(): void {
        this.selectedReport = '';
        this.selectedApptId = '';
        this.uploadReportForm.reset();
    }

    getAppointments() {
        if (this._route.snapshot.paramMap.get('patient')) {
            return this._appointmentService
                .getAppointments(
                    0,
                    10,
                    'created_date',
                    'desc',
                    this._route.snapshot.paramMap.get('patient')
                )
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
        } else {
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
     * Get appt by dr
     *
     * @param view
     */
    getDoctorsAppt(dr: string) {
        if (this.tempAppt.length === 0) {
            this.tempAppt = this.appointments;
        }
        if (dr === 'all') {
            this.appointments = this.tempAppt;
        } else {
            this.appointments = this.tempAppt.filter(
                (x: any) => x.doctor_id === dr
            );
        }
    }

    openUploadReportPopup(
        uploadReportTemplate: TemplateRef<any>,
        apptId: string
    ): void {
        if (apptId !== '') { this.selectedApptId = apptId; }
        this.uploadReportForm.reset();
        const dialogRef = this._matDialog.open(uploadReportTemplate, {
            autoFocus: false,
        });
    }

    onFileUpload(event) {
        this.selectedFile = event.target.files[ 0 ];
        const readers = new FileReader();
        readers.readAsDataURL(this.selectedFile);
        this.OnUploadFile();
    }

    OnUploadFile() {
        const uploadFormData = new FormData();
        uploadFormData.append('file', this.selectedFile);
        this._appointmentService
            .uploadReport(uploadFormData)
            .subscribe((data: any) => {
                this.selectedReport = data.picture;
                this._changeDetectorRef.markForCheck();
            });
    }

    done(): void {
        if (this.uploadReportForm.invalid) {
            return;
        }
        if (this.selectedReport === '') {
            this._alertService.message = 'Please select report for upload!';
            this._fuseAlertService.show('alert_error');
            setTimeout(() => {
                this._fuseAlertService.dismiss('alert_error');
            }, 2500);
            this.getAppointments();
            return;
        }

        // Hide the alert
        const data = clone(this.uploadReportForm.value);

        this._appointmentService
            .addAppointmentReport(
                data.report_name,
                this.selectedReport,
                this.selectedApptId
            )
            .subscribe(
                () => {
                    this._matDialog.closeAll();
                    this._alertService.message =
                        'Report has been uploaded successfuly';
                    this._fuseAlertService.show('alert_success');
                    setTimeout(() => {
                        this._fuseAlertService.dismiss('alert_success');
                    }, 2500);
                    this.getAppointments();
                    this.resetDetails();
                    return;
                },
                (response) => {
                    // Re-enable the form
                    this.uploadReportForm.enable();

                    // Reset the form
                    this.uploadReportForm.reset();

                    this._alertService.message = 'Something went wrong';
                    this._fuseAlertService.show('alert_error');
                    setTimeout(() => {
                        this._fuseAlertService.dismiss('alert_error');
                    }, 2500);
                }
            );
    }
}
