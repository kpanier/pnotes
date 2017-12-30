import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { NotesService } from '../../app/core/notesService';
import { Editor } from '../editor/editor';
import { Note } from '../../app/core/model';
import { HomePage } from '../home/home';


@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  icons: string[];
  items: ListItem[];

  constructor(public navCtrl: NavController, public navParams: NavParams, private notesService: NotesService) {
  }

  ionViewWillEnter() {
    this.reloadNotesFromService();
  }

  reloadNotesFromService() {
    this.items = [];
    this.notesService.getNoteList().then(notes => notes.forEach(note => {
      this.items.push({
        title: note.name,
        note: note,
        icon: 'paper-plane'
      });
    }
    )).catch((error)=> this.navCtrl.push(HomePage));
  }

  itemTapped(item: ListItem) {
    this.navCtrl.push(Editor, {
      note: item.note
    });
  }

  remove(item: ListItem) {
    console.log('Remove: ' + item.title);
    this.notesService.remove(item.note).catch((error)=> this.navCtrl.push(HomePage));
    this.items.slice(this.items.indexOf(item),1);
  }

  newNote() {
    console.log('Create a new Note');
    this.navCtrl.push(Editor, {
      note: {
        name: 'New Note',
        content: 'Sample content'
      }
    });
  }

}

class ListItem {
  public title: string;
  public note: Note;
  public icon: string;
}
