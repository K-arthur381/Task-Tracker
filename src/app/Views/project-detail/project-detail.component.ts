import { Component, ElementRef } from '@angular/core';
import { ApexNonAxisChartSeries, ApexChart, ApexFill, ApexLegend, ApexTooltip } from 'ng-apexcharts';
import { MatDialog } from '@angular/material/dialog';
import { ObserverService } from '../../Serives/observer.service';
import { AddNewTaskComponent } from '../add-new-task/add-new-task.component';
import { ActivatedRoute, Router } from '@angular/router';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  legend?: ApexLegend;
};

export type RadialBarChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  plotOptions: any;
  fill: ApexFill;
  labels: string[]; // ✅ Correct type here
  legend?: ApexLegend;
};


type ExtendedApexChart = ApexChart & { colors?: string[] };

export type ColumnChartOptions = {
  series: ApexAxisChartSeries;
  chart: ExtendedApexChart;
  xaxis: ApexXAxis;
  dataLabels: any;
  plotOptions: any;
  title: ApexTitleSubtitle;
  fill: ApexFill;
  tooltip: ApexTooltip;
  grid: ApexGrid;
};


@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css'
})

export class ProjectDetailComponent {
  public chartOptions: ChartOptions;
  public chartOptions2: RadialBarChartOptions;
  public chartOptions1: ColumnChartOptions;

  filter = { project: '', status: '', priority: '', date: '' };
  TaskData: any;
  ProgressData: any;
  temp: any;
  plotOptions: any;
  currentProject: any;
  ProjectData: any;

  Totaltask:number=0;
  Totalprogress: any;
  Totalcomplete: any;
  Totalonhold: any;
  Totaltodo: any;

   TotalprogressCount: any;
  TotalcompleteCount: any;
  TotalonholdCount: any;
  TotaltodoCount: any;


  constructor(private route: ActivatedRoute, public dialog: MatDialog, private ObserverService: ObserverService, private eRef: ElementRef) {
    this.chartOptions1 = {
      series: [
        {
          name: "ToDo",
          data: [44, 45, 18]
        },
        {
          name: "Completed",
          data: [35, 40, 22]
        },
        {
          name: "InProgress",
          data: [26, 15, 33]
        },
        {
          name: "OnHold",
          data: [35, 22, 33]
        }
      ],
      chart: {
        type: "bar",
        height: 260,
        colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560']  // colors here
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: [
          "May", "Jun", "July"
        ]
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val + "  tasks";
          }
        }
      },
      title: {
        text: ""
      },
      grid: {
        borderColor: '#e7e7e7',
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5
        }
      }
    };
    this.chartOptions2 = {
      series: [0, 0, 0, 0],
      chart: {
        height: 240,
        type: "radialBar"
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: '22px',
            },
            value: {
              fontSize: '16px',
            },
            total: {
              show: true,
              label: 'Total',
              formatter: function () {
                return 0;
              }
            }
          }
        }
      },
      labels: ["ToDo", "Completed", "InProgress", "Onhold"], // ✅ Just a string array
      fill: {
        type: 'gradient'
      }
    };

    this.chartOptions = {
      series: [0, 0, 0, 0],
      chart: {
        type: "pie",
        width: 350
      },
      labels: ["ToDo", "Complete", "InProgress", "Onhold"],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 300
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
    this.loadTaskData();
  }

  ngOnInit() {
    const projectId = this.route.snapshot.paramMap.get('projectId');
    this.ObserverService.taskUpdated$.subscribe(() => {
      this.loadTaskData(); // reload logic
      this.loadChart();
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
    const projectId = this.route.snapshot.paramMap.get('projectId');

    // Get all projects from localStorage
    const Pj = JSON.parse(localStorage.getItem('ProjectData') || '[]');

    // Find the project that matches the given ID
    this.currentProject = Pj.find((t: { ProjectId: string }) => t.ProjectId === projectId);

    if (!this.currentProject) {
      console.error('Project not found!');
      return;
    }
    // Load task data
    this.TaskData = JSON.parse(localStorage.getItem('TaskListData') || '[]');
    // Filter task data related to the current project's name
    this.ProgressData = this.TaskData
      .filter((t: { project: string }) => t.project === this.currentProject.projectName);

    const todoTasks = this.ProgressData.filter((t: { status: string }) => t.status === 'ToDo');
    const completedTasks = this.ProgressData.filter((t: { status: string }) => t.status === 'Completed');
    const progressTasks = this.ProgressData.filter((t: { status: string }) => t.status === 'InProgress');
    const onholdTasks = this.ProgressData.filter((t: { status: string }) => t.status === 'OnHold');

    const todo = this.ProgressData.length > 0 ? Math.round((todoTasks.length / this.ProgressData.length) * 100) : 0;
    const completed = this.ProgressData.length > 0 ? Math.round((completedTasks.length / this.ProgressData.length) * 100) : 0;
    const progress = this.ProgressData.length > 0 ? Math.round((progressTasks.length / this.ProgressData.length) * 100) : 0;
    const onhold = this.ProgressData.length > 0 ? Math.round((onholdTasks.length / this.ProgressData.length) * 100) : 0;
   
    this.Totaltodo = todo;
    this.Totalcomplete = completed;
    this.Totalprogress = progress;
    this.Totalonhold = onhold;

    this.TotaltodoCount=todoTasks.length;
    this.TotalcompleteCount=completedTasks.length;
    this.TotalprogressCount=progressTasks.length;
    this.TotalonholdCount=onholdTasks.length;
  }

  loadChart() {
   const total=this.ProgressData.length;

 // ✅ Now update the chart options
  this.chartOptions1 = {
    series: [{
      name: 'Tasks',
      data: [this.TotaltodoCount, this.TotalcompleteCount, this.TotalprogressCount, this.TotalonholdCount]
    }],
    chart: {
      type: 'bar',
      height: 350
    },
    xaxis: {
      categories: ['ToDo', 'Completed', 'InProgress', 'OnHold']
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: '50%',
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val + ' task';
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#304758']
      }
    },
    fill: {
       colors: ['#007bff', '#28a745', '#ffc107', '#dc3545'] // Blue, Green, Yellow, Red
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val + '  task';
        }
      }
    },
    title: {
      text: this.currentProject.projectName,
      align: 'center'
    },
    grid: {
      borderColor: '#e7e7e7',
      row: {
        colors: ['#f3f3f3', 'transparent'],
        opacity: 0.5
      }
    }
  };

    this.chartOptions2 = {
      series: [44, 55, 67, 83],
      chart: {
        height: 240,
        type: "radialBar"
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: '22px',
            },
            value: {
              fontSize: '16px',
            },
            total: {
              show: true,
              label: 'Total Tasks',
              formatter: function () {
               return total.toString(); 
              }
            }
          }
        }
      },
      labels: ["ToDo", "Completed", "InProgress", "Onhold"], // ✅ Just a string array
      fill: {
        type: 'gradient'
      }
    };

    this.chartOptions = {
      series: [44, 55, 13, 43],
      chart: {
        type: "pie",
        width: 350
      },
      labels: ["ToDo", "Complete", "InProgress", "Onhold"],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 300
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
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
