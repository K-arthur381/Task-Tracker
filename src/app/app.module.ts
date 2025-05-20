import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { NgApexchartsModule } from "ng-apexcharts";
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './Views/dashboard/dashboard.component';
import { RecentTasksComponent } from './Views/recent-tasks/recent-tasks.component';
import { TaskListComponent } from './Views/task-list/task-list.component';
import { ProjectListComponent } from './Views/project-list/project-list.component';
import { AddNewTaskComponent } from './Views/add-new-task/add-new-task.component';
import { AddNewProjectComponent } from './Views/add-new-project/add-new-project.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { NavbarComponent } from './Shares/navbar/navbar.component';
import { ProjectDetailComponent } from './Views/project-detail/project-detail.component';
import { ReportsComponent } from './Views/reports/reports.component';
@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    RecentTasksComponent,
    TaskListComponent,
    ProjectListComponent,
    AddNewTaskComponent,
    AddNewProjectComponent,
    NavbarComponent,
    ProjectDetailComponent,
    ReportsComponent
  ],
  imports: [
    FormsModule,
    NgApexchartsModule,
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
    MatButtonModule,
     MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatToolbarModule,
    MatTabsModule,
    MatListModule,
    MatProgressBarModule,
   MatLabel,
   MatFormField,
     MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
      MatSelectModule,
   
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
