import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { NavbarData } from '../data/Navbar';
import { logoutUser } from '../redux/authSlice';
import { resetPaste } from '../redux/pasteSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(resetPaste());          // clear solutions from Redux state
    navigate('/login');
  };

  return (
    <div className="w-full h-[45px] flex justify-between items-center px-5 bg-gray-800 relative">
      {/* Brand */}
      <div className="text-white font-medium text-xl">SnippetVault</div>

      {/* Nav links */}
      <div className="flex gap-x-5 items-center">
        {user &&
          NavbarData.map((link, idx) => (
            <NavLink
              key={idx}
              to={link.path}
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-500 font-semibold text-xl'
                  : 'text-white font-medium text-xl'
              }
            >
              {link.title}
            </NavLink>
          ))}
      </div>

      {/* Auth controls */}
      <div className="flex gap-x-3 items-center">
        {user ? (
          <>
            <span className="text-gray-300 text-sm hidden sm:block truncate max-w-[140px]">
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-3 py-1.5"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className="text-white font-medium text-sm hover:text-blue-400"
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
            >
              Register
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
