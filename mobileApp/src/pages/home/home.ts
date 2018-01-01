import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NotesService } from '../../app/core/notesService';
import { ListPage } from '../list/list';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  username: string;
  password: string;
  message: string;
  pnoteUrl: string;

  constructor(public navCtrl: NavController, private notesService: NotesService, private storage: Storage) {
    storage.get("url").then(v => this.pnoteUrl = v)
    storage.get("username").then(v => this.username = v);
  }

  public login() {
    this.notesService.baseURL = this.pnoteUrl;
    this.notesService.login(this.username, this.password).then(status => {
      if (status = 200) {
        this.storage.set("url", this.pnoteUrl);
        this.storage.set("username", this.username);
        this.navCtrl.push(ListPage);
      }
      else {
        this.message = 'Login failed.'
      }
    }).catch(err => this.message = err);
  }

}
