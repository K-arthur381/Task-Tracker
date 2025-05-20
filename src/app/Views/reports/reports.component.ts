import { Component, OnInit } from '@angular/core';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import { ObserverService } from '../../Serives/observer.service';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  UserData: any;
  TaskData: any[] = [];
  weeklyTasks: any[] = [];
customStartDate :any; // example
customEndDate :any;

constructor(private ObserverService: ObserverService){}

  ngOnInit(): void {
     this.ObserverService.taskUpdated$.subscribe(() => {
      this.filterWeeklyTasks(); // reload logic
    });
    this.UserData = JSON.parse(localStorage.getItem('UserData') || '{}');
    this.TaskData = JSON.parse(localStorage.getItem('TaskListData') || '[]');
     const { monday, sunday,friday } = this.getStartAndEndOfWeek();
     console.log('from oninit',monday)
  // Set default date inputs
  this.customStartDate = this.formatDateInput(monday);
    console.log('from oninitw',this.customStartDate)
  this.customEndDate = this.formatDateInput(sunday);

  // Apply default filter
  this.filterWeeklyTasks();
  }

 getStartAndEndOfWeek(): { monday: Date; sunday: Date,friday:Date } {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1); // if Sunday (0), go to previous Monday

  const monday = new Date(today.setDate(diffToMonday));
  console.log('monday',monday)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6); // 6 days after Monday is Sunday

   const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4); // 6 days after Monday is Sunday

  return { monday: new Date(monday), sunday: new Date(sunday), friday: new Date(friday) };
}

stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

formatDateInput(date: Date): string {
const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`; // yyyy-MM-dd
}

formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

  filterWeeklyTasks() {
  const { monday, sunday,friday } = this.getStartAndEndOfWeek();

  const filterStart = this.stripTime(new Date(this.customStartDate || monday));
  const filterEnd = this.stripTime(new Date(this.customEndDate || sunday));

  this.weeklyTasks = this.TaskData.filter(task => {
    const startDate = this.stripTime(new Date(task.startDate));
    const endDate = this.stripTime(new Date(task.endDate));
   return (startDate >= filterStart && startDate <= filterEnd) || endDate<=filterEnd;
  });
}


 async exportToExcel(): Promise<void> {
  const userName = this.UserData.username || 'Unknown';
  const pm = this.UserData.pm || 'Unknown';

  const { monday, sunday,friday } = this.getStartAndEndOfWeek();
  const filterStart = this.stripTime(new Date(this.customStartDate || monday));
  const filterEnd = this.stripTime(new Date(this.customEndDate || sunday));
  const weeklyEnd = this.stripTime(new Date(this.customEndDate || friday));

  const dateRange = `${this.formatDate(new Date(filterStart))} to ${this.formatDate(new Date(weeklyEnd))}`;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Weekly Report');

  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'Weekly Report';
  titleCell.font = { size: 18, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  worksheet.mergeCells('A2:H2');
  const subtitleCell = worksheet.getCell('A2');
  subtitleCell.value = `Status Date as of ${dateRange}`;
  subtitleCell.font = { size: 14, bold: true };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  worksheet.mergeCells('A3:H3');

  const headerRow = worksheet.addRow(['No', 'Task Description', 'Action By', 'Action Taken', 'Follow up/Target Date', 'Status', 'Remarks', 'Pic']);
  headerRow.font = { bold: true, size: 12 };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  headerRow.eachCell(cell => {
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
    cell.fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB0C4DE' }
    };
  });

  // Generate expanded task list per date
  const taskEntries: any[] = [];
  for (const task of this.weeklyTasks) {
    const start = this.stripTime(new Date(task.startDate));
    const end = this.stripTime(new Date(task.endDate));

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateCopy = new Date(d);
      if (dateCopy >= filterStart && dateCopy <= filterEnd) {
        taskEntries.push({
          ...task,
          date: this.formatDate(dateCopy),
          status: (this.stripTime(dateCopy).getTime() === this.stripTime(new Date(task.endDate)).getTime()) ? 'Completed' : 'Progress'
        });
      }
    }
  }

  const groupedByDate: { [date: string]: any[] } = {};
  taskEntries.forEach(entry => {
    if (!groupedByDate[entry.date]) groupedByDate[entry.date] = [];
    groupedByDate[entry.date].push(entry);
  });

  let groupCounter = 1;
  for (const dateKey of Object.keys(groupedByDate).sort((a, b) => {
    const [da, ma, ya] = a.split('/').map(Number);
    const [db, mb, yb] = b.split('/').map(Number);
    return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
  })) {
    const group = groupedByDate[dateKey];
    const startRow = worksheet.lastRow!.number + 1;

    group.forEach(task => {
      worksheet.addRow([
        '', // No
        task.name,
        '', // Action By
        '', // Action Taken
        '', // Date
        task.status,
        '', // Remarks
        ''  // Pic
      ]);
    });

    const endRow = startRow + group.length - 1;

    worksheet.mergeCells(`A${startRow}:A${endRow}`);
    worksheet.getCell(`A${startRow}`).value = groupCounter;
    worksheet.getCell(`A${startRow}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    worksheet.mergeCells(`C${startRow}:C${endRow}`);
    worksheet.getCell(`C${startRow}`).value = userName;
    worksheet.getCell(`C${startRow}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    worksheet.mergeCells(`D${startRow}:D${endRow}`);
    worksheet.getCell(`D${startRow}`).value = pm;
    worksheet.getCell(`D${startRow}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    worksheet.mergeCells(`E${startRow}:E${endRow}`);
    worksheet.getCell(`E${startRow}`).value = dateKey;
    worksheet.getCell(`E${startRow}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    worksheet.mergeCells(`G${startRow}:G${endRow}`);
    worksheet.getCell(`G${startRow}`).value = '';
    worksheet.getCell(`G${startRow}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    worksheet.mergeCells(`H${startRow}:H${endRow}`);
    worksheet.getCell(`H${startRow}`).value = '';
    worksheet.getCell(`H${startRow}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
      const row = worksheet.getRow(rowNum);
      row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      row.height = 40;
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
    }

    groupCounter++;
  }

  worksheet.columns = [
    { key: 'no', width: 6 },
    { key: 'desc', width: 70 },
    { key: 'actionBy', width: 20 },
    { key: 'actionTaken', width: 20 },
    { key: 'date', width: 18 },
    { key: 'status', width: 15 },
    { key: 'remarks', width: 15 },
    { key: 'pic', width: 15 }
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  FileSaver.saveAs(blob, `Weekly_Report_(${userName}).xlsx`);
}



}
