import { bootstrapApplication } from '@angular/platform-browser';

import { App } from '#/components';
import { appConfig } from '#/configs/frontend';


bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
