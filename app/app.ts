import {App, IonicApp, NavController, Platform, MenuController, Events} from 'ionic-angular';
import {OnInit, Injector, provide} from '@angular/core';

import {AppManager} from './services/app-manager';
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
  template: `<ion-menu [content]="content">
      
      <ion-content>
        <ion-list>
          
          <button ion-item>
            <ion-avatar item-left>
              <img src="{{user?.avatar}}">
            </ion-avatar>
            <h1>{{user?.firstname}}</h1>
            <p>Открыть профиль</p>
            <ion-icon name="ios-arrow-forward-outline" item-right hideWhen="ios"></ion-icon>
          </button>

          <button ion-item (click)="openPage(desktopPage)" detail-push>
            <ion-icon name="desktop" item-left></ion-icon>
            Рабочий стол
            <ion-icon name="ios-arrow-forward-outline" item-right hideWhen="ios"></ion-icon>
          </button>
          
          <button ion-item (click)="openPage(coursesPage)">
            <ion-icon name="school" item-left></ion-icon>
            Мои курсы
            <ion-icon name="ios-arrow-forward-outline" item-right hideWhen="ios"></ion-icon>
          </button>

          <button ion-item>
            <ion-icon name="settings" item-left></ion-icon>
            Настройки
            <ion-icon name="ios-arrow-forward-outline" item-right hideWhen="ios"></ion-icon>
          </button>

          <button ion-item>
            <ion-icon name="log-out" item-left></ion-icon>
            Выход
            <ion-icon name="ios-arrow-forward-outline" item-right hideWhen="ios"></ion-icon>
          </button>

        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-nav id="menu-nav" #content [root]="rootPage"></ion-nav>`,
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
  user: UserData;
  nav: NavController;
  /*Pages*/
  rootPage: any;
  desktopPage: any = DesktopPage;
  coursesPage: any = CoursesPage;

  constructor(private app: IonicApp, private platform: Platform, private menu: MenuController, private events: Events,
    private appManager: AppManager, private services: Injector) {
  }

  public openPage(page): void {
    this.nav.setRoot(page, {user: this.user}, { animate: true });
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
        this.events.subscribe('user:login', () => this.onUserLogin());
        this.rootPage = LoginPage;
      }).catch((error) => {
        return Promise.reject(error);
      })
    }).catch((error) => {
      console.log(error)
    });
  }

  private onUserLogin() {
    this.appManager.getUserInfo().then((userdata) => {
      this.user = userdata;
      this.menu.enable(true);
      this.openPage(this.desktopPage);
    }).catch((error) => {
      console.log(error);
    })
  }
}  