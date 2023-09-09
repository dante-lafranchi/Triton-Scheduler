import { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login as userLogin } from '../redux/slices/UserSlice';

export const useLogin = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(null);

    const dispatch = useDispatch();

    const login = async (username, password) => {
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
            await axios.post(`user/login`, JSON.stringify({ username, password }), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // get current user courses to make sure we dont add duplicates from local storage
            const coursesResponse = await axios.get(`/get_courses`);
            const coursesInDatabase = coursesResponse.data;

            // add storedCourses to database if they aren't already there
            const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
            if (storedCourses) {
                for (let course of storedCourses) {
                    const existingCourse = coursesInDatabase.find((currentCourse) => currentCourse.sub_and_crse_code === course.subAndCrseCode);

                    if (!courseExists) {
                        const createCourseReponse = await axios.post(
                            `scheduler/create_course`,
                            JSON.stringify({ subAndCrseCode: course.subAndCrseCode }),
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            }
                        );
                        existingCourse = createCourseReponse.data;
                    }

                    if (existingCourse) { // course exists in database
                        // get current user sections to make sure we dont add duplicates from local storage
                        const sectionsResponse = await axios.get(`scheduler/get_sections_for_course/${courseExists.id}`);
                        const sectionsInDatabase = sectionsResponse.data;

                        // add stored sections to user in database
                        for (let section of course.sections) {
                            const sectionExists = sectionsInDatabase && sectionsInDatabase.some((currentSection) => currentSection.sect_code === section);

                            if (!sectionExists) {
                                await axios.post(
                                    `scheduler/create_section`,
                                    JSON.stringify({ courseId: existingCourse.id, sectCode: section }),
                                    {
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                    }
                                );
                            }
                        }
                    }
                }

                // delete every stored course from local storage now that they're in database
                localStorage.removeItem('courses');
            }

            dispatch(userLogin());

            setIsLoading(false);
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'There was an error getting the class details. Please try again.';
            setError(errorMessage);
            return;
        }
    };

    return { login, isLoading, error };
};
