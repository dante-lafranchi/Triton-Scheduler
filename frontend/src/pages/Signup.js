import { useState } from 'react';
import { useSignup } from '../hooks/useSignup';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { signup, error, isLoading } = useSignup();

    const handleSubmit = async (event) => {
        event.preventDefault();

        await signup(username, password);
    };

    return (
        <div className='signup-container'>
            <form className='signup-form' onSubmit={handleSubmit}>
                <h3>Sign Up</h3>
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
                <button disabled={isLoading}>Sign up</button>
                {error && <div className='error'>{error}</div>}
            </form>
        </div>
    );
};

export default Signup;
