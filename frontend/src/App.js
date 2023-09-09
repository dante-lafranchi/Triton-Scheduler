import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { login } from './redux/slices/UserSlice';

function App() {
    const [isFetchingUser, setIsFetchingUser] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();

        window.addEventListener('resize', checkMobile);

        // clean up
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = axios.get('user/check_authentication');

                if (response.data.authenticated) {
                    dispatch(login());
                }
            } catch (error) {
                console.log(error);
            }

            setIsFetchingUser(false);
        };

        fetchUser();
    }, []);

    return (
        <div className='App'>
            {!isFetchingUser && (
                <BrowserRouter>
                    <Navbar />
                    {!isMobile && (
                        <div className='pages'>
                            <Routes>
                                <Route path='/' element={<Home />} />
                                <Route path='/login' element={!user ? <Login /> : <Navigate to='/' />} />
                                <Route path='/signup' element={!user ? <Signup /> : <Navigate to='/' />} />
                            </Routes>
                        </div>
                    )}
                    {isMobile && (
                        <div className='mobile'>
                            <p>Sorry, Triton Scheduler is not available on mobile devices.</p>
                        </div>
                    )}
                </BrowserRouter>
            )}
        </div>
    );
}

export default App;
