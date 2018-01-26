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
  state: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, private notesService: NotesService) {
  }

  ngOnInit() {
    this.aNote = this.navParams.get('note');
    if (this.aNote._id) {
      console.log("Try to load: " + this.aNote);
      this.state = 'Loading...';
      this.notesService.getNote(this.aNote._id).then(n => {
        this.aNote = n;
        this.state = 'Loaded';
      }).catch((error) => this.navCtrl.push(HomePage));
    }
  }

  public save() {
    if (this.aNote._id) {
      this.state = 'Saving note...';
      this.notesService.updateNote(this.aNote).then(r => {
        if (r.statusCode == 200) {
          this.state = 'Saving note done.';
        }
        this.notesService.getNote(this.aNote._id).then(n => {
          this.aNote = n;
          this.state = 'Synced.';
        });
      }).catch((error) => this.state = error);
    }
    else {
      this.state = 'Creating note...';
      this.notesService.addNote(this.aNote).then(r => {
        if (r.statusCode == 200) {
          this.state = 'Creating note done.';
        }
        this.notesService.getNote(r).then(n => {
          this.aNote = n;
          this.state = 'Synced.'
        });
      }).catch((error) => this.navCtrl.push(HomePage));
    }
  }

  public abort() {
    this.navCtrl.pop();
  }

}
