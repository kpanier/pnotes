import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NotesService } from './core/notesService';
import { HttpClientModule } from '@angular/common/http';
import { Editor } from '../pages/editor/editor';
import { ContenteditableDirective } from 'ng-contenteditable';
import { AceEditorDirective } from 'ng2-ace-editor';
import { IonicStorageModule } from '@ionic/storage';
import { NgReduxModule, NgRedux } from '@angular-redux/store';
import { INotesState, rootReducer, INIT_STATE } from './core/store';
import { LocalStoreService } from './core/localStoreService';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    Editor,
    ContenteditableDirective,
    AceEditorDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgReduxModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    Editor
  ],
  providers: [
    StatusBar,
    SplashScreen,
    NotesService,
    LocalStoreService,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule {
  constructor(ngRedux: NgRedux<INotesState>, notesService: NotesService, localStoreService: LocalStoreService) {
    const middleware = [localStoreService.middleware, notesService.middleware];
    ngRedux.configureStore(rootReducer, INIT_STATE, middleware);
  }
}
