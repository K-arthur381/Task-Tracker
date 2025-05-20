import { Component, ElementRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ObserverService } from '../../Serives/observer.service';
import { OnInit, AfterViewInit } from '@angular/core';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import { AddNewTaskComponent } from '../add-new-task/add-new-task.component';
@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit{
  pageSize = 5; // items per page
  filteredTasks:any;
currentPage = 1;
dataTable: any;
TaskData:any;
filter = { project: '',status: '',priority: '',startDate: '' ,endDate:''};

constructor(public dialog: MatDialog,private ObserverService:ObserverService,private eRef: ElementRef){
  this.loadTaskData();
}
ngOnInit() {
  this.ObserverService.taskUpdated$.subscribe(() => {
    this.loadTaskData(); // reload logic
  });
}

loadTaskData(){
  this.TaskData=JSON.parse(localStorage.getItem('TaskData') || '[]');  
  this.TaskData.sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

// Delete task from TaskData and localStorage
  deleteTask(taskId: number): void {
    if (confirm("Are you sure you want to delete this task?")) {
      this.TaskData.splice(taskId, 1); // Remove task from array
      localStorage.setItem('TaskData', JSON.stringify(this.TaskData)); // Update localStorage
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

filteredTasksPaginated() {
  this.filteredTasks = this.TaskData.filter((task: any) => {
      const matchesProject = this.filter.project === '' || task.project.toLowerCase().includes(this.filter.project.toLowerCase());
      const matchesStatus = this.filter.status === '' || task.status === this.filter.status;
      const matchesPriority = this.filter.priority === '' || task.priority === this.filter.priority;

     const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate); // Make sure you have task.endDate

    const filterStart = this.filter.startDate ? new Date(this.filter.startDate) : null;
    const filterEnd = this.filter.endDate ? new Date(this.filter.endDate) : null;

    const matchesDate =
      (!filterStart || taskStart >= filterStart || this.isSameDate(taskStart, filterStart)) &&
      (!filterEnd || taskEnd <= filterEnd || this.isSameDate(taskEnd, filterEnd));

    return matchesProject && matchesStatus && matchesPriority && matchesDate;
    });

  const start = (this.currentPage - 1) * this.pageSize;
  return this.filteredTasks.slice(start, start + this.pageSize);
}

get totalPages() {
  return Math.ceil(this.filteredTasks.length / this.pageSize);
}

goToPage(page: number) {
  this.currentPage = page;
}

// Example: whenever filter values change
onFilterChange() {
  this.currentPage = 1;
}

  // Helper to compare only the date part (ignoring time)
isSameDate(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
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
