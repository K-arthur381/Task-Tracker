import { Component, ElementRef } from '@angular/core';
import {ApexNonAxisChartSeries,ApexChart,ApexFill,ApexStroke,ApexPlotOptions} from 'ng-apexcharts';
import { AddNewProjectComponent } from '../add-new-project/add-new-project.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ObserverService } from '../../Serives/observer.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent {
  progress = 0;
  ProjectData: any;
  TaskData: any;
constructor(private router:Router,public dialog: MatDialog,private ObserverService:ObserverService,private eRef: ElementRef){
  this.loadProjectData();
}
ngOnInit() {
  this.ObserverService.taskUpdated$.subscribe(() => {
    this.loadProjectData(); // reload logic
  });
}


// Delete task from ProjectData and localStorage
  deletePj(PjId: string): void {
    if (confirm("Are you sure you want to delete this task?")) {
        const index = this.ProjectData.findIndex((t: { ProjectId: string }) => t.ProjectId === PjId);
      this.ProjectData.splice(index, 1); // Remove task from array
      localStorage.setItem('ProjectData', JSON.stringify(this.ProjectData)); // Update localStorage
      this.loadProjectData();
    }
  }

  // Open dialog to edit task
  editPj(PjId: string): void {
   const index = this.ProjectData.findIndex((t: { ProjectId: string }) => t.ProjectId === PjId);
     const Pj = this.ProjectData[index];
    const dialogRef = this.dialog.open(AddNewProjectComponent, {
      width: '800px',
      data: { Pj: Pj, index } // Pass task data to dialog
    });
  }


loadProjectData() {
  this.ProjectData = JSON.parse(localStorage.getItem('ProjectData') || '[]');  
  this.TaskData = JSON.parse(localStorage.getItem('TaskData') || '[]');  

  this.ProjectData.forEach((proj: any) => {
    const relatedTasks = this.TaskData.filter(
      (t: { project: string }) => t.project === proj.projectName
    );

    const completedTasks = relatedTasks.filter(
      (t: { status: string }) => t.status === 'Completed'
    );

    const progress = relatedTasks.length > 0
      ? Math.round((completedTasks.length / relatedTasks.length) * 100)
      : 0;

    proj.progress = progress; // Attach progress directly to the project
  });
}


 OpenAddNewProjectDialog() {
    this.dialog.open(AddNewProjectComponent, {
      width: '400px',
    })
  }

 //public series: ApexNonAxisChartSeries = [this.progress]; 
  public chart: ApexChart = {
    height: 250,
    type: 'radialBar'
  };
  public fill: ApexFill = {
    colors: ['#1e88e5']
  };
  public stroke: ApexStroke = {
    lineCap: 'round'
  };
  public plotOptions: ApexPlotOptions = {
    radialBar: {
      hollow: {
        size: '55%'
      },
      dataLabels: {
        name: {
          show: true
        },
        value: {
          fontSize: '20px',
          fontWeight: 600,
          color: '#333'
        }
      }
    }
  };
  public labels: string[] = ['Completed'];

GoProjectDetial(projectId:string){
 this.router.navigate(['/projectdetail', projectId]); // For /projectdetail/:id
}

}
