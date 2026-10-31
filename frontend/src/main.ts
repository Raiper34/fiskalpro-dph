import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

declare const Neutralino: { init(): void; events: { on(event: string, handler: () => void): void } };

function bootstrap(): void {
  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
}

if (typeof Neutralino !== 'undefined') {
  Neutralino.events.on('ready', bootstrap);
  Neutralino.init();
} else {
  bootstrap();
}
