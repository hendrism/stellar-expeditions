/* eslint-disable no-restricted-globals */

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
const handler = createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [new RegExp('^/_'), fileExtensionRegexp],
});

registerRoute(navigationRoute);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
