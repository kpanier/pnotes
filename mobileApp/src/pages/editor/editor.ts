import { NavController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';
import { Note } from '../../app/core/model';
import { NotesService } from '../../app/core/notesService';
import { HomePage } from '../home/home';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'page-editor',
  templateUrl: 'editor.html'
})
export class Editor implements OnInit {

  aNote: Note;

  constructor(public navCtrl: NavController, public navParams: NavParams, private notesService: NotesService) {
  }

  ngOnInit() {
    this.aNote = this.navParams.get('note');
    if (this.aNote._id) {
      console.log("Try to load: " + this.aNote);
      this.notesService.getNote(this.aNote._id).then(n => this.aNote = n).catch((error) => this.navCtrl.push(HomePage));
    }
  }

  public save() {
    if (this.aNote._id) {
      console.log('Save -> update note');
      this.notesService.updateNote(this.aNote).then(r => { this.notesService.getNote(this.aNote._id).then(n => this.aNote = n); }).catch((error) => this.navCtrl.push(HomePage));
    }
    else {
      console.log('Save -> create note');
      this.notesService.addNote(this.aNote).then(r => this.notesService.getNote(r).then(n => this.aNote = n)).catch((error) => this.navCtrl.push(HomePage));
    }
  }

}
