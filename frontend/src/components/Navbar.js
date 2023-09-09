import { Link } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import { useSelector } from 'react-redux';

const Navbar = () => {
    const { logout } = useLogout();
    const { user } = useSelector((state) => state.user);

    const handleClick = () => {
        logout();
    };

    return (
        <header>
            <div className='header-container'>
                <Link to='/' className='header-title'>
                    Triton Scheduler
                </Link>
                <nav>
                    {user && (
                        <div>
                            <span className='navbar-element'>{user.username}</span>
                            <button className='navbar-element logout-button' onClick={handleClick}>
                                Log out
                            </button>
                        </div>
                    )}
                    {!user && (
                        <div>
                            <Link to='/login' className='navbar-element'>
                                Login
                            </Link>
                            <Link to='/signup' className='navbar-element'>
                                Signup
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
            <hr className='navbar-divider'></hr>
        </header>
    );
};

export default Navbar;
