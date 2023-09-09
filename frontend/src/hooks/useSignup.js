import { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login as userLogin } from '../redux/slices/UserSlice';

export const useSignup = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(null);

    const dispatch = useDispatch();

    const signup = async (username, password) => {
        setIsLoading(true);
        setError(null);

        if (!username || !password) {
            setError('Username and password are required.');
            setIsLoading(false);
            return;
        } else if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            setIsLoading(false);
            return;
        }

        try {
            await axios.post(`user/signup`, JSON.stringify({ username, password }), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // add storedCourses to user in database
            let storedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
            if (storedCourses) {
                for (let course of storedCourses) {
                    const createCourseResponse = await axios.post(
                        `scheduler/create_course`,
                        JSON.stringify({ subAndCrseCode: course.subAndCrseCode }),
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    // add stored sections to user in database
                    for (let section of course.sections) {
                        await axios.post(`scheduler/create_section`, JSON.stringify({ courseId: createCourseResponse.data.id, sectCode: section }), {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                    }
                }
                // delete every stored course from local storage now that they're in database
                localStorage.removeItem('courses');
            }

            dispatch(userLogin());

            setIsLoading(false);
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'There was an error signing in. Please try again.';
            setError(errorMessage);
            return;
        }
    };

    return { signup, isLoading, error };
};
