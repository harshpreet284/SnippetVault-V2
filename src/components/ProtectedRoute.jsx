import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/**
 * Wraps any route that requires authentication.
 *
 * - While restoreSession is in flight (loading === true), renders nothing
 *   to prevent a flash redirect before the session check completes.
 * - If the session check completes with no user, redirects to /login.
 * - If authenticated, renders children normally.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  // Wait for session restore to complete before deciding
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
