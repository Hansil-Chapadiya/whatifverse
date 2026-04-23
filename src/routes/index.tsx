import { createBrowserRouter } from 'react-router-dom';
import { PrototypePage } from '../pages/PrototypePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PrototypePage />,
  },
]);
