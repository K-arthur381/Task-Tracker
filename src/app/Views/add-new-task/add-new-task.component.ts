import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Task } from '../../models/task.model';
import { Project } from '../../models/project.model';
import { ObserverService } from '../../Serives/observer.service';


@Component({
  selector: 'app-add-new-task',
  templateUrl: './add-new-task.component.html',
  styleUrl: './add-new-task.component.css'
})
export class AddNewTaskComponent {
  task: Task = new Task();
  ProjectList:Project[]=[];
  index: number =-1;
  
 
 constructor(
   public observerService:ObserverService,private dialogRef: MatDialogRef<AddNewTaskComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    if (data?.task) {
      this.index = data.index;
      this.task=data.task;
    }
    this.ProjectList = JSON.parse(localStorage.getItem('ProjectData') || '[]');
  }


  saveTask() {

    let existingTasks = JSON.parse(localStorage.getItem('TaskListData') || '[]');
  
       if (this.index !== -1) {
        // Edit existing task
         const alreadytaskIndex =existingTasks.findIndex((t: { taskId: string }) => t.taskId === this.task.taskId);
        existingTasks[alreadytaskIndex] = this.task;
      } else {
        // Add new task
        existingTasks.push(this.task);
      }
    localStorage.setItem('TaskListData', JSON.stringify(existingTasks));
      this.observerService.notifyTaskUpdated(); // ✅ notify other components 
    this.dialogRef.close(); // Close dialog
  }
}
