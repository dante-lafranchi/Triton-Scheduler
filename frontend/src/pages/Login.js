import { useState, useEffect } from 'react';
import { useLogin } from '../hooks/useLogin';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, isLoading } = useLogin();

    const handleSubmit = async (event) => {
        event.preventDefault();

        await login(username, password);
    };

    return (
        <div className='login-container'>
            <form className='login-form' onSubmit={handleSubmit}>
                <h3>Login</h3>
                <label htmlFor='username'>Username:</label>
                <input
                    type='text'
                    onChange={(event) => setUsername(event.target.value)}
                    name='username'
                    value={username}
                    id='username'
                />
                <label htmlFor='password'>Password:</label>
                <input
                    type='password'
                    onChange={(event) => setPassword(event.target.value)}
                    name='password'
                    value={password}
                    id='password'
                />
                <button disabled={isLoading}>Login</button>
                {error && <div className='error'>{error}</div>}
            </form>
        </div>
    );
};

export default Login;
