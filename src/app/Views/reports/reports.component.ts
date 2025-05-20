import { Component, OnInit } from '@angular/core';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

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


  ngOnInit(): void {
    this.UserData = JSON.parse(localStorage.getItem('UserData') || '{}');
    this.TaskData = JSON.parse(localStorage.getItem('TaskData') || '[]');
     const { monday, sunday } = this.getStartAndEndOfWeek();
  // Set default date inputs
  this.customStartDate = this.formatDateInput(monday);
  this.customEndDate = this.formatDateInput(sunday);

  // Apply default filter
  this.filterWeeklyTasks();
  }

 getStartAndEndOfWeek(): { monday: Date; sunday: Date } {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1); // if Sunday (0), go to previous Monday

  const monday = new Date(today.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6); // 6 days after Monday is Sunday

  return { monday: new Date(monday), sunday: new Date(sunday) };
}

stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

formatDateInput(date: Date): string {
  return date.toISOString().substring(0, 10); // format as yyyy-MM-dd for input[type="date"]
}

formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

  filterWeeklyTasks() {
  const { monday, sunday } = this.getStartAndEndOfWeek();

  const filterStart = this.stripTime(new Date(this.customStartDate || monday));
  const filterEnd = this.stripTime(new Date(this.customEndDate || sunday));

  this.weeklyTasks = this.TaskData.filter(task => {
    const startDate = this.stripTime(new Date(task.startDate));
    const endDate = this.stripTime(new Date(task.endDate));
   return startDate >= filterStart && startDate <= filterEnd;
  });
}


 async exportToExcel(): Promise<void> {
  const userName = this.UserData.username || 'Unknown';
  const pm = this.UserData.pm || 'Unknown';

  const { monday, sunday } = this.getStartAndEndOfWeek(); // default range
 const filterStart = this.stripTime(new Date(this.customStartDate || monday));
  const filterEnd = this.stripTime(new Date(this.customEndDate || sunday));

  const dateRange = `${this.formatDate(new Date(filterStart))} to ${this.formatDate(new Date(filterEnd))}`;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Weekly Report');

  // Title row
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'Weekly Report';
  titleCell.font = { size: 15, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  // Subtitle
  worksheet.mergeCells('A2:H2');
  const subtitleCell = worksheet.getCell('A2');
  subtitleCell.value = `Status Date as of ${dateRange}`;
  subtitleCell.font = { size: 14, bold: true };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  // Blank row
  worksheet.mergeCells('A3:H3');

  // Header row
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

  // Filter and group tasks by startDate
  const tasksInRange = this.weeklyTasks.filter(task => {
   const startDate = this.stripTime(new Date(task.startDate));
    const endDate = this.stripTime(new Date(task.endDate));
   return startDate >= filterStart && startDate <= filterEnd;
});
  const groupedTasks: { [date: string]: any[] } = {};
  tasksInRange.forEach(task => {
    const dateKey = this.formatDate(new Date(task.startDate));
    if (!groupedTasks[dateKey]) {
      groupedTasks[dateKey] = [];
    }
    groupedTasks[dateKey].push(task);
  });

  let groupCounter = 1;

  for (const dateKey of Object.keys(groupedTasks).sort((a, b) => {
    const [da, ma, ya] = a.split('/').map(Number);
    const [db, mb, yb] = b.split('/').map(Number);
    return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
  })) {
    const group = groupedTasks[dateKey];
    const startRow = worksheet.lastRow!.number + 1;

    group.forEach((task, index) => {
      const row = worksheet.addRow([
        '', // "No" will be merged and filled later
        task.name,
        '', // Action By
        '', // Action Taken
        '', // Date
        task.status,
        '', // Remarks
        ''  // Pic
      ]);
      row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
    });

    // Merging only for the first row of the group
    const endRow = startRow + group.length - 1;

   worksheet.mergeCells(`A${startRow}:A${endRow}`);
worksheet.getCell(`A${startRow}`).value = groupCounter;
worksheet.getCell(`A${startRow}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

worksheet.mergeCells(`C${startRow}:C${endRow}`);
worksheet.getCell(`C${startRow}`).value = userName;
worksheet.getCell(`C${startRow}`).alignment = { vertical: 'middle',horizontal: 'center', wrapText: true };

worksheet.mergeCells(`D${startRow}:D${endRow}`);
worksheet.getCell(`D${startRow}`).value = pm;
worksheet.getCell(`D${startRow}`).alignment = { vertical: 'middle',horizontal: 'center', wrapText: true };

worksheet.mergeCells(`E${startRow}:E${endRow}`);
worksheet.getCell(`E${startRow}`).value = dateKey;
worksheet.getCell(`E${startRow}`).alignment = { vertical: 'middle',horizontal: 'center', wrapText: true };

worksheet.mergeCells(`G${startRow}:G${endRow}`);
worksheet.getCell(`G${startRow}`).value = '';
worksheet.getCell(`G${startRow}`).alignment = { vertical: 'middle',horizontal: 'center', wrapText: true };

worksheet.mergeCells(`H${startRow}:H${endRow}`);
worksheet.getCell(`H${startRow}`).value = '';
worksheet.getCell(`H${startRow}`).alignment = { vertical: 'middle',horizontal: 'center', wrapText: true };

// Set row height
worksheet.getRow(startRow).height = 50;
worksheet.getRow(endRow).height = 50;

    groupCounter++;
  }

  // Set column widths
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

  // Export
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  FileSaver.saveAs(blob, `Weekly_Report_(${userName}).xlsx`);
}


}
