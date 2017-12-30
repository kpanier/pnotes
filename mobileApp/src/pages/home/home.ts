import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NotesService } from '../../app/core/notesService';
import { ListPage } from '../list/list';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  username: string;
  password: string;
  message: string;

  constructor(public navCtrl: NavController, private notesService: NotesService) {

  }

  public login() {
    this.notesService.login(this.username, this.password).then(status => {
      if(status = 200) {
        this.navCtrl.push(ListPage);
      }
      else{
        this.message = 'Login failed.'
      }
    }).catch(err => this.message = err);
  }

}
