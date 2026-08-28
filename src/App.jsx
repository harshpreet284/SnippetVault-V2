import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './components/Home';
import Paste from './components/Paste';
import ViewPaste from './components/ViewPaste';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { restoreSession } from './redux/authSlice';
import { store } from './redux/store';

/**
 * Attempt to restore the authenticated session immediately on startup.
 * Called once before the router renders so the auth state is ready
 * before ProtectedRoute makes its redirect decision.
 */
store.dispatch(restoreSession());

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <div className="w-full h-full flex flex-col">
        <Navbar />
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </div>
    ),
  },
  {
    path: '/pastes',
    element: (
      <div className="w-full h-full flex flex-col">
        <Navbar />
        <ProtectedRoute>
          <Paste />
        </ProtectedRoute>
      </div>
    ),
  },
  {
    path: '/pastes/:id',
    element: (
      <div className="w-full h-full flex flex-col">
        <Navbar />
        <ProtectedRoute>
          <ViewPaste />
        </ProtectedRoute>
      </div>
    ),
  },
  {
    path: '/login',
    element: (
      <div className="w-full h-full flex flex-col">
        <Navbar />
        <Login />
      </div>
    ),
  },
  {
    path: '/register',
    element: (
      <div className="w-full h-full flex flex-col">
        <Navbar />
        <Register />
      </div>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
