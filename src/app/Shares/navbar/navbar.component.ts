import { Component } from '@angular/core';
import { AddNewTaskComponent } from '../../Views/add-new-task/add-new-task.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  UserData:any;
  userName:string = '';
  pm:string| null=null;
  nameInput: string = '';
  option:boolean=false;

  constructor(public dialog: MatDialog){}
   
  ngOnInit() {
    this.UserData = JSON.parse(localStorage.getItem('UserData') || '[]');
    this.userName=this.UserData.username;
    this.pm=this.UserData.pm;
  }

  saveName() {
    if (this.userName.trim() && this.pm?.trim()) {
 const data = {
      username: this.userName.trim(),
      pm: this.pm?.trim()
    };
  localStorage.setItem('UserData', JSON.stringify(data));
  // this.userName = this.nameInput.trim();
    }
    this.option=false;
  }
    
  OpenAddNewTaskDialog(){
   this.dialog.open(AddNewTaskComponent, {     
        })
  }
  
}
