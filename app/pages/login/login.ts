import {Page, Events} from 'ionic-angular';

import {AppManager} from '../../services/app-manager';

@Page({
  templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {
  constructor(private events: Events, private appManager: AppManager) {
  }

  private login(form: any) {
    this.appManager.Connection.login({
      login: form.login, password: form.password
    }).then(() => {
      this.events.publish('user:login');
    }).catch(() => {
      alert("Access denied!");
    })

  }
}
