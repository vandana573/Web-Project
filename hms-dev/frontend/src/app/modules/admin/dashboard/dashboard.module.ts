import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Route, RouterModule } from '@angular/router';
import { FuseAlertModule } from '@fuse/components/alert';
import { DashboardComponent } from 'app/modules/admin/dashboard/dashboard.component';
import { SharedModule } from 'app/shared/shared.module';
import {
    AppointmentResolver,
    EventResolver,
} from '../appointment-list/appointment-list.resolver';
import { DoctorResolver } from '../doctor/doctor.resolver';
import { AppointmentListComponent } from '../appointment-list/appointment-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const dashboardRoute: Route[] = [
    {
        path: '',
        component: DashboardComponent,
        resolve: {
            events: EventResolver,
            doctors: DoctorResolver,
            appointments: AppointmentResolver
        },
    },
];

@NgModule({
    declarations: [ DashboardComponent ],
    imports: [
        RouterModule.forChild(dashboardRoute),
        MatButtonModule,
        CommonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSortModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSlideToggleModule,
        MatTooltipModule,
        FuseAlertModule,
        SharedModule,
    ],
})
export class DashboardModule { }
