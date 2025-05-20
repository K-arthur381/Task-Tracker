import { Component, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ObserverService } from '../../Serives/observer.service';
import { AddNewTaskComponent } from '../add-new-task/add-new-task.component';

@Component({
  selector: 'app-recent-tasks',
  templateUrl: './recent-tasks.component.html',
  styleUrl: './recent-tasks.component.css'
})
export class RecentTasksComponent {

  filter = { project: '',status: '',priority: '',date: '' };
  TaskData: any;
  ProgressData: any;
  temp: any;

  constructor(public dialog: MatDialog, private ObserverService: ObserverService, private eRef: ElementRef) {
    this.loadTaskData();
  }
  ngOnInit() {
    this.ObserverService.taskUpdated$.subscribe(() => {
      this.loadTaskData(); // reload logic
    });
  }

  filteredTasks() {
    return this.ProgressData.filter((task: any) => {
      const matchesProject = this.filter.project === '' || task.project.toLowerCase().includes(this.filter.project.toLowerCase());
      const matchesStatus = this.filter.status === '' || task.status === this.filter.status;
      const matchesPriority = this.filter.priority === '' || task.priority === this.filter.priority;
      const matchesDate = this.filter.date === '' || new Date(task.startDate).toDateString() === new Date(this.filter.date).toDateString();

      return matchesProject && matchesStatus && matchesPriority && matchesDate;
    });
  }

  loadTaskData() {
    this.TaskData = JSON.parse(localStorage.getItem('TaskListData') || '[]');
    this.ProgressData = this.TaskData
      .filter((t: { status: string }) => t.status !== 'Completed');
  }

  // Delete task from TaskData and localStorage
  deleteTask(taskId: string): void {
     const index = this.TaskData.findIndex((t: { taskId: string }) => t.taskId === taskId);
     const task = this.TaskData[index];
    if (confirm("Are you sure you want to delete this task?")) {
      this.TaskData.splice(index, 1); // Remove task from array
      localStorage.setItem('TaskListData', JSON.stringify(this.TaskData)); // Update localStorage
      this.loadTaskData();
    }
  }

  // Open dialog to edit task
  editTask(taskId: string): void {
   const index = this.TaskData.findIndex((t: { taskId: string }) => t.taskId === taskId);
     const task = this.TaskData[index];
    const dialogRef = this.dialog.open(AddNewTaskComponent, {
      width: '800px',
      data: { task: task, index } // Pass task data to dialog
    });
  }

  //#region **Change color accounding to status,priority and project**
  getStatusClass(status: string): string {
    switch (status) {
      case 'ToDo': return 'bg-primary';
      case 'InProgress': return 'bg-warning text-dark';
      case 'Completed': return 'bg-success';
      case 'OnHold': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Urgent': return 'bg-danger';
      case 'High': return 'bg-primary';
      case 'Medium': return 'bg-warning text-dark';
      case 'Low': return 'bg-primary';
      default: return 'bg-secondary';
    }
  }

  // Optional: style for project if needed
  getProjectClass(project: string): string {
    return 'bg-secondary'; // You can customize this if you want to color project too
  }
  //#endregion
}
