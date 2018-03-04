import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ListPage } from '../list/list';
import { INotesState, Actions, ILogin } from '../../app/core/store';
import { select, NgRedux } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @select() username$: Observable<string>;
  username: string;
  password: string;
  message: string;
  @select() pnoteUrl$: Observable<string>;
  pnoteUrl: string;
  @select() login$: Observable<ILogin>;

  constructor(public navCtrl: NavController, private ngRedux: NgRedux<INotesState>) {}

  ionViewWillEnter() {
    this.pnoteUrl$.subscribe(s => this.pnoteUrl = s);
    this.username$.subscribe(s => this.username = s);
    this.login$.subscribe(b => this.handleLoginState(b));
    this.ngRedux.dispatch({ type: Actions.INIT_APP });
}

  public handleLoginState(login: ILogin) {
    if (login.login) {
      if (login.loginSuccess) {
        this.navCtrl.setRoot(ListPage);
      }
      else {
        this.message = 'Login failed.';
      }
    }
  }

  public login() {
    this.ngRedux.dispatch({
      type: Actions.LOGIN,
      username: this.username,
      password: this.password,
      pnoteUrl: this.pnoteUrl
    });
  }

}
