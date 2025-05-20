// project.model.ts
export class Project {
  ProjectId: string;
  projectName: string='';
  createDate:Date=new Date();

constructor() {
    this.ProjectId = this.generateTaskId();  // 👈 Set taskId on creation
  }

  private generateTaskId(): string {
    // You can customize the format, e.g., prefix + timestamp + random string
    return 'PJ-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  }

}
