import {Page, Events, Loading, NavController, Alert} from 'ionic-angular';

import {AppManager, ConnectionType} from '../../services/app-manager';

/**
 * Controller for login page
 * 
 * @export
 * @class LoginPage
 */
@Page({
  templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {
  private static waitMessage = 'Пожалуйста, подождите...';
  private static authError = 'Ошибка авторизации!';
  private static wrongData = 'Вы ввели неправильные логин и/или пароль.';
  private status: ConnectionType;
  private statusDescription: string;

  constructor(private events: Events, private appManager: AppManager, private nav: NavController) {
    this.changeConnection();
  }

  private login(form: any) {
    var loading = Loading.create({
      content: LoginPage.waitMessage
    });
    this.nav.present(loading);

    this.appManager.login({
      login: form.login, password: form.password
    }).then((userdata) => {
      loading.dismiss();
      this.events.publish('user:login', userdata);
    }).catch((error) => {
      loading.dismiss();
      var alert = Alert.create({
        title: LoginPage.authError,
        message: LoginPage.wrongData,
        buttons: ['OK']
      });
      this.nav.present(alert);
    })

  }

  private changeConnection() {
    var target: ConnectionType = (this.status == ConnectionType.Online) ? ConnectionType.Offline : ConnectionType.Online;
    this.status = this.appManager.updateConnection(target);
    this.statusDescription = ConnectionType[this.status];
  }
}
