import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { Route } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { PatientAppoinmentComponent } from './patient-appointment.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FullCalendarModule } from '@fullcalendar/angular';
import { FuseDateRangeModule } from '@fuse/components/date-range';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRadioModule } from '@angular/material/radio';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DoctorResolver } from '../doctor/doctor.resolver';
import { AppointmentResolver } from '../appointment-list/appointment-list.resolver';

const routes: Route[] = [
    {
        path: '',
        component: PatientAppoinmentComponent,
        resolve: {
            doctors: DoctorResolver,
            appointments: AppointmentResolver,
        },
    },
];

@NgModule({
    declarations: [PatientAppoinmentComponent],
    imports: [
        RouterModule.forChild(routes),
        ScrollingModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatMomentDateModule,
        MatRadioModule,
        MatSelectModule,
        MatSidenavModule,
        MatTooltipModule,
        FuseDateRangeModule,
        SharedModule,
        FullCalendarModule,
        MatSortModule,
    ],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {
                    dateInput: 'DD.MM.YYYY',
                },
                display: {
                    dateInput: 'DD.MM.YYYY',
                    monthYearLabel: 'MMM YYYY',
                    dateA11yLabel: 'DD.MM.YYYY',
                    monthYearA11yLabel: 'MMMM YYYY',
                },
            },
        },
    ],
})
export class PatientAppoinmentModule {}
