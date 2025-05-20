export class Task {
  taskId: string;  // 👈 Unique Task ID
  name: string = '';
  note: string = '';
  project: string = '';
  status: string = 'ToDo';
  startDate: Date = new Date();
  endDate: Date = new Date();
  priority: string = 'Medium';

  constructor() {
    this.taskId = this.generateTaskId();  // 👈 Set taskId on creation
  }

  private generateTaskId(): string {
  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2, '0') +
                  now.getMinutes().toString().padStart(2, '0') +
                  now.getSeconds().toString().padStart(2, '0');

  const timestampStr = Date.now().toString(36);

  // Generate a random 40-character uppercase string
  const randomStr = Array.from({length: 40}, () =>
    Math.floor(Math.random() * 36).toString(36) // 0-9, a-z
  ).join('').toUpperCase();

  return `TASK-${timestampStr}-${timeStr}-${randomStr}`;
}

}
