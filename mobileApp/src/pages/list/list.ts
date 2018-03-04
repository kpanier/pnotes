import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Editor } from '../editor/editor';
import { Note } from '../../app/core/model';
import { NgRedux } from '@angular-redux/store';
import { INotesState, Actions } from '../../app/core/store';


@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {

  icons: string[];
  items: ListItem[];

  constructor(public navCtrl: NavController, private ngRedux: NgRedux<INotesState>) {
  }

  ionViewWillEnter() {
    this.ngRedux.dispatch({ type: Actions.LOAD_NOTES });
    this.ngRedux.subscribe(() => this.reloadNotesFromStore());
  }

  reloadNotesFromStore() {
    this.items = [];
    this.ngRedux.getState().notes.forEach(note => {
      this.items.push({
        title: note.name,
        note: note,
        icon: 'paper-plane'
      });
    });
  }

  itemTapped(item: ListItem) {
    this.navCtrl.push(Editor, {
      note: item.note
    });
  }

  remove(item: ListItem) {
    console.log('Remove: ' + item.title);
    //TODO
    //this.notesService.remove(item.note).catch((error) => this.navCtrl.push(HomePage));
    this.items.slice(this.items.indexOf(item), 1);
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
