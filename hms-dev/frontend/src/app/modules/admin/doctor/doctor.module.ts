import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
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
import { CommonModule } from '@angular/common';
import { DoctorComponent } from './doctor.component';
import { DoctorResolver } from './doctor.resolver';
import { MatRadioModule } from '@angular/material/radio';

const routes: Route[] = [
    {
        path: '',
        component: DoctorComponent,
        resolve: {
            doctors: DoctorResolver,
        },
    },
];
@NgModule({
    declarations: [DoctorComponent],
    imports: [
        RouterModule.forChild(routes),
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
        MatSelectModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatTableModule,
        SharedModule,
        MatRadioModule,
    ],
})
export class DoctorListModule {}
