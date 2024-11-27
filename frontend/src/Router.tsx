import HomeView from './views/home';
import RootFunctionView from './views/rootFunction';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <HomeView />
    },
    {
      path: '/fn/:name',
      element: <RootFunctionView />
    }
  ],
  {}
);
