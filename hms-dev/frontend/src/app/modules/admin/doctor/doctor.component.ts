import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FuseAlertService } from '@fuse/components/alert';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AlertService } from 'app/core/alert/alert.service';
import { Doctor } from 'app/models/appointment';
import { Pagination } from 'app/models/pagination';
import { DoctorService } from 'app/services/doctor.service';
import { environment } from 'environments/environment';
import { merge } from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-doctor',
    templateUrl: './doctor.component.html',
    styleUrls: ['./doctor.component.scss'],
})
export class DoctorComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    imgPath = environment.uploadPath;
    configForm: FormGroup;
    doctors: Doctor[];
    doctorId = '';
    selectedFile: File;
    selectedImage: string = '';
    displayAddDoctorForm: boolean = false;
    isLoading: boolean = false;
    pagination: Pagination;
    searchInputControl: FormControl = new FormControl();
    selectedType: Doctor | null = null;
    doctorFormGroup: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _doctorService: DoctorService,
        private _fuseAlertService: FuseAlertService,
        private _confirmationService: FuseConfirmationService,
        private _alertService: AlertService
    ) {}

    ngOnInit(): void {
        this.configForm = this._formBuilder.group({
            title: 'Remove doctor',
            message: 'Are you sure you want to remove doctor permanently?',
            icon: this._formBuilder.group({
                show: true,
                name: 'heroicons_outline:exclamation',
                color: 'warn',
            }),
            actions: this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show: true,
                    label: 'Remove',
                    color: 'warn',
                }),
                cancel: this._formBuilder.group({
                    show: true,
                    label: 'Cancel',
                }),
            }),
            dismissible: true,
        });

        this.doctorFormGroup = this._formBuilder.group({
            fullName: ['', Validators.required],
            description: [''],
            email: ['', Validators.required],
            contact_number: [
                '',
                [Validators.required, Validators.maxLength(10)],
            ],
            gender: ['', Validators.required],
        });

        // Get the pagination
        this._doctorService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagination) => {
                // Update the pagination
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        this._doctorService.doctors$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((doctors) => {
                // Update the pagination
                this.doctors = doctors;
                this._changeDetectorRef.markForCheck();
            });
        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.resetDetails();
                    this.isLoading = true;
                    return this._doctorService.getDoctors(
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

            merge(this._sort.sortChange, this._paginator.page)
                .pipe(
                    switchMap(() => {
                        this.resetDetails();
                        this.isLoading = true;
                        return this._doctorService.getDoctors(
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    addDoctor(): void {
        this.displayAddDoctorForm = true;
        this.resetDetails();
        document.getElementById('gotoTop').focus({ preventScroll: false });
    }

    getDoctors() {
        return this._doctorService
            .getDoctors()
            .pipe(
                takeUntil(this._unsubscribeAll),
                map(() => {
                    this._doctorService.doctors$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((doctors) => {
                            // Update the pagination
                            this.doctors = doctors;
                            this._changeDetectorRef.markForCheck();
                        });
                })
            )
            .subscribe();
    }

    toggleDetails(doctorId: string): void {
        if (this.displayAddDoctorForm) {
            this.displayAddDoctorForm = false;
        }
        if (this.selectedType && this.selectedType._id === doctorId) {
            this.resetDetails();
            return;
        }
        this.doctorId = doctorId;
        this._doctorService.getDoctorById(doctorId).subscribe((type) => {
            this.selectedType = type;
            this.selectedImage = type.profileImgUrl;
            this.doctorFormGroup.patchValue(type);
            this._changeDetectorRef.markForCheck();
        });
    }

    resetDetails(): void {
        this.selectedType = null;
        this.doctorId = '';
        this.doctorFormGroup.reset();
    }

    onFileUpload(event) {
        this.selectedFile = event.target.files[0];
        const imageSize = this.selectedFile.size;
        if (imageSize > 1024000) {
        }
        const mimeType = this.selectedFile.type;
        if (mimeType.match(/selectedImage\/*/) == null) {
        }
        const readers = new FileReader();
        readers.readAsDataURL(this.selectedFile);
        this.OnUploadFile();
    }

    OnUploadFile() {
        const uploadFormData = new FormData();
        uploadFormData.append('file', this.selectedFile);
        this._doctorService
            .uploadImage(uploadFormData)
            .subscribe((data: any) => {
                this.selectedImage = data.picture;
                this._changeDetectorRef.markForCheck();
            });
    }

    deleteSelectedDoctor(): void {
        if (this.displayAddDoctorForm) {
            this.doctorFormGroup.reset();
            this.displayAddDoctorForm = false;
            return;
        }
        const dialogRef = this._confirmationService.open(this.configForm.value);
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._doctorService
                    .deleteDoctor(this.doctorId, 'delete-doctor', 2)
                    .subscribe((res: any) => {
                        if (res.status === true) {
                            this.resetDetails();
                            this.getDoctors();
                            this._alertService.message =
                                'Doctor deleted successfully.';
                            this._fuseAlertService.show('alert_success');
                            setTimeout(() => {
                                this._fuseAlertService.dismiss('alert_success');
                            }, 2500);
                        } else {
                            this.doctorFormGroup.reset();
                            this._alertService.message = res.message;
                            this._fuseAlertService.show('alert_error');
                            setTimeout(() => {
                                this._fuseAlertService.dismiss('alert_error');
                            }, 2500);
                        }
                    });
            }
        });
    }

    addUpdateSelectedDoctor(): void {
        if (this.doctorFormGroup.invalid) {
            return;
        }
        const formData = this.doctorFormGroup.getRawValue();
        formData['profileImgUrl'] = this.selectedImage;
        this.isLoading = true;
        this._doctorService
            .addUpdateDoctor(this.doctorId, formData)
            .subscribe((newPalletType: any) => {
                if (newPalletType.status === true) {
                    this.selectedType = newPalletType;
                    this.displayAddDoctorForm = false;
                    this.getDoctors();
                    this.doctorFormGroup.reset();
                    this._changeDetectorRef.markForCheck();
                    this.isLoading = false;
                    this._alertService.message = 'Doctor saved successfully.';
                    this._fuseAlertService.show('alert_success');
                    setTimeout(() => {
                        this._fuseAlertService.dismiss('alert_success');
                    }, 2500);
                } else {
                    this.doctorFormGroup.reset();
                    this._alertService.message = newPalletType.message;
                    this.isLoading = false;
                    this._fuseAlertService.show('alert_error');
                    setTimeout(() => {
                        this._fuseAlertService.dismiss('alert_error');
                    }, 2500);
                }
            });
    }

    trackByFn(index: number, item: any): any {
        return item._id || index;
    }
}
