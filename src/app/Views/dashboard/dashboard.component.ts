import { Component, ElementRef } from '@angular/core';
import { AddNewTaskComponent } from '../add-new-task/add-new-task.component';
import { MatDialog } from '@angular/material/dialog';
import { AddNewProjectComponent } from '../add-new-project/add-new-project.component';
import { ObserverService } from '../../Serives/observer.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  TaskData: any;
  ProjectData: any;
  ToDo_TotalCount: any;
  Progress_TotalCount: any;
  Onhold_TotalCount: any;
  Completed_TotalCount: any;

  totalTasks: number = 0;
  completedPercent: number = 0;
  progressPercent: number = 0;
  todoPercent: number = 0;
  onholdPercent: number = 0;

  constructor(public dialog: MatDialog, private ObserverService: ObserverService, private eRef: ElementRef) {
    this.loadTaskData();
  }
  ngOnInit() {
    this.ObserverService.taskUpdated$.subscribe(() => {
      this.loadTaskData(); // reload logic
    });
  }

  loadTaskData() {
    this.TaskData = JSON.parse(localStorage.getItem('TaskData') || '[]');
    this.ProjectData = JSON.parse(localStorage.getItem('ProjectData') || '[]');

    this.ToDo_TotalCount = this.TaskData.filter((t: { status: string }) => t.status === 'ToDo').length;
    this.Progress_TotalCount = this.TaskData.filter((t: { status: string }) => t.status === 'InProgress').length;
    this.Onhold_TotalCount = this.TaskData.filter((t: { status: string }) => t.status === 'OnHold').length;
    this.Completed_TotalCount = this.TaskData.filter((t: { status: string }) => t.status === 'Completed').length;
    this.updateProgress();
  }

  OpenAddNewProjectDialog() {
    this.dialog.open(AddNewProjectComponent, {
      width: '400px',
    })
  }

  updateProgress() {
    this.totalTasks = this.ToDo_TotalCount + this.Progress_TotalCount + this.Completed_TotalCount + this.Onhold_TotalCount;

    this.completedPercent = this.totalTasks ? Math.round((this.Completed_TotalCount / this.totalTasks) * 100) : 0;
    this.progressPercent = this.totalTasks ? Math.round((this.Progress_TotalCount / this.totalTasks) * 100) : 0;
    this.todoPercent = this.totalTasks ? Math.round((this.ToDo_TotalCount / this.totalTasks) * 100) : 0;
    this.onholdPercent = this.totalTasks ? Math.round((this.Onhold_TotalCount / this.totalTasks) * 100) : 0;
  }
}
