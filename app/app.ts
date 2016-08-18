import {App, IonicApp, NavController, Platform, MenuController, Events, Alert, Loading} from 'ionic-angular';
import {OnInit, Injector, provide} from '@angular/core';

import {AppManager, ConnectionType} from './services/app-manager';
import {Database} from './services/database';
import {Filesystem} from './services/filesystem';
import {Settings} from './services/settings';

import {ConnectionLocal, ConnectionServer} from './services/connections/connection';
import {UserData} from './services/descriptions';
import {TaskFactory} from './services/tasks/task';

import {DesktopPage} from './pages/desktop/desktop';
import {CoursesPage} from './pages/courses/courses';
import {LoginPage} from './pages/login/login';

@App({
  templateUrl: 'build/app.html',
  config: {}, // http://ionicframework.com/docs/v2/api/config/Config/
  providers: [
    provide(AppManager, { useClass: AppManager }),
    provide(Database, { useClass: Database }),
    provide(Filesystem, { useClass: Filesystem }),
    provide(Settings, { useClass: Settings }),
    provide(ConnectionLocal, { useClass: ConnectionLocal }),
    provide(ConnectionServer, { useClass: ConnectionServer }),
    provide(TaskFactory, { useClass: TaskFactory })
  ]
})

export class ILIASMobileClient implements OnInit {
  private statusDescription: string;
  private status: ConnectionType;
  private user: UserData;
  private nav: NavController;
  /*Pages*/
  private rootPage: any;
  private desktopPage: any = DesktopPage;
  private coursesPage: any = CoursesPage;

  constructor(private app: IonicApp, private platform: Platform, private menu: MenuController, private events: Events,
    private appManager: AppManager, private services: Injector) {
  }

  public ngOnInit() {
    this.platform.ready().then(() => {
      return Promise.all([
        this.appManager.initialize(),
        this.services.get(Settings).initialize(),
        this.services.get(Database).initialize(),
        this.services.get(Filesystem).initialize()
      ]).then(() => {
        this.menu.enable(false);
        this.nav = this.app.getActiveNav();
        this.events.subscribe('user:login', (data) => this.onUserLogin(data[0]));
        this.rootPage = LoginPage;
      }).catch((error) => {
        return Promise.reject(error);
      })
    }).catch((error) => {
      this.closeApplication();
    });
  }

  private onUserLogin(userdata: UserData) {
    this.appManager.getUserInfo(userdata).then((userdata) => {
      this.user = userdata;
      this.status = this.appManager.getConnection();
      this.statusDescription = ConnectionType[this.status];
      this.menu.enable(true);
      this.openPage(this.desktopPage);
    }).catch((error) => {
      var alert = Alert.create({
        title: 'Ошибка!',
        message: 'Невозможно получить доступ к данным пользователя',
        buttons: ['OK']
      })
      this.nav.present(alert);
    })
  }

  private openPage(page): void {
    this.menu.close();
    this.nav.setRoot(page, { user: this.user });
  }

  private changeConnection() {
    var target: ConnectionType = (this.status == ConnectionType.Online) ? ConnectionType.Offline : ConnectionType.Online;
    this.status = this.appManager.updateConnection(target);
    this.statusDescription = ConnectionType[this.status];
  }

  private closeApplication() {
    this.platform.exitApp();
  }
}  