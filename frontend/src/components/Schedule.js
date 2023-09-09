import { useState, useEffect } from 'react';
import axios from 'axios';
import Course from './Course';
import CourseSearch from './CourseSearch';
import { useSelector, useDispatch } from 'react-redux';
import { setCourses } from '../redux/slices/CoursesSlice';

function Schedule() {
    const { courses } = useSelector((state) => state.courses);
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [error, setError] = useState(null);

    const availableColors = ['#FF5733', '#FCCF46', '#25A6FF', '#17C273', '#BB5290', '#525DBB'];

    useEffect(() => {
        const processCourseOverview = (courseOverview, index) => ({
            ...courseOverview,
            key: index,
        });

        const fetchCourseOverviews = async () => {
            if (user) {
                try {
                    const response = await axios.get(`scheduler/get_courses`, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    return response.data.map(processCourseOverview);
                } catch (error) {
                    const errorMessage =
                        error.response?.data?.error ||
                        'There was an error getting the class details. Please try again.';
                    setError(errorMessage);
                }
            } else {
                let storedCourses = localStorage.getItem('courses');
                if (storedCourses) {
                    return JSON.parse(storedCourses).map(processCourseOverview).reverse();
                }
            }

            return [];
        };

        const courseOverviews = fetchCourseOverviews();

        const fetchSingleCourse = async (courseOverview, index) => {
            const subAndCrseCode = user ? courseOverview.sub_and_crse_code : courseOverview.subAndCrseCode;
            if (subAndCrseCode) {
                try {
                    const findClassResponse = await axios.get(`scheduler/find_class/${subAndCrseCode}`, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    const newSubAndCrseCode = `${findClassResponse.data.course_info.SUBJ_CODE.trim()} ${findClassResponse.data.course_info.CRSE_CODE.trim()}`;

                    return {
                        courseOverview: {
                            ...findClassResponse.data.course_info,
                            key: index,
                            courseId: user ? courseOverview.id : null,
                            subAndCrseCode: newSubAndCrseCode,
                        },
                        sections: findClassResponse.data.sections,
                    };
                } catch (error) {
                    const errorMessage =
                        error.response?.data?.error ||
                        'There was an error getting the class details. Please try again.';
                    setError(errorMessage);
                }
            }

            return null;
        };

        const fetchCourses = async (courseOverviews) => {
            const fetchPromises = courseOverviews.map((courseOverview, index) =>
                fetchSingleCourse(courseOverview, index)
            );
            const findClassResponses = await Promise.all(fetchPromises);

            return findClassResponses.filter(Boolean);
        };

        const existingCourses = fetchCourses(courseOverviews);
        dispatch(setCourses(existingCourses));
    }, []);

    return (
        <div className='schedule'>
            <CourseSearch />
            {error && <div className='error'>{error}</div>}
            <div className='courses'>
                {courses &&
                    courses.map((course, index) => (
                        <div key={course.courseOverview.key}>
                            <Course
                                courseOverview={{
                                    ...course.courseOverview,
                                    color: availableColors[(courses.length - index - 1) % availableColors.length],
                                }}
                                sections={course.sections}
                                key={course.courseOverview.key}
                            />
                            {index !== courses.length - 1 && <hr className='course-divider' />}
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default Schedule;
