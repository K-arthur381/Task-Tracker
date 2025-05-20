import { Component, Inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ObserverService } from '../../Serives/observer.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-add-new-project',
  templateUrl: './add-new-project.component.html',
  styleUrl: './add-new-project.component.css'
})
export class AddNewProjectComponent {

  Project: Project = new Project();
  index:number=-1;
  ProjectName: any;
  createDate = new Date();
  Projectid: any;

constructor(public observerService:ObserverService,
    public dialogRef: MatDialogRef<AddNewProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data?.Pj) {
      this.index=data?.index;
    this.Project=data?.Pj;
    }
  }
 
  SaveProject() {
    
let existingTasks = JSON.parse(localStorage.getItem('ProjectData') || '[]');

      if (this.index !== -1) {
        // Edit existing task
        existingTasks[this.index] = this.Project;
      } else {
        // Add new task
        existingTasks.push(this.Project);
      }

      localStorage.setItem('ProjectData', JSON.stringify(existingTasks));
       this.observerService.notifyTaskUpdated(); // ✅ notify other components 
      this.dialogRef.close(); // Close dialog

  }

}
