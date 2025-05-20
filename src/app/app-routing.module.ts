import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './Views/dashboard/dashboard.component';
import { TaskListComponent } from './Views/task-list/task-list.component';
import { ProjectListComponent } from './Views/project-list/project-list.component';
import { RecentTasksComponent } from './Views/recent-tasks/recent-tasks.component';
import { AddNewProjectComponent } from './Views/add-new-project/add-new-project.component';
import { AddNewTaskComponent } from './Views/add-new-task/add-new-task.component';
import { ProjectDetailComponent } from './Views/project-detail/project-detail.component';
import { ReportsComponent } from './Views/reports/reports.component';

const routes: Routes = [
  {path:'dashboard',component:DashboardComponent},
  {path:'tasklist',component:TaskListComponent},
  {path:'projectlist',component:ProjectListComponent},
  {path:'recenttask',component:RecentTasksComponent},
  {path:'add-new-project',component:AddNewProjectComponent},
  {path:'add-new-task',component:AddNewTaskComponent},
 { path: 'projectdetail/:projectId', component: ProjectDetailComponent },
  { path: 'report', component: ReportsComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
