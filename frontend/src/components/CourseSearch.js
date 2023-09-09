import { useState, useRef } from 'react';
import axios from 'axios';
import subAndCrseCodes from '../data/allCourseCodes.json';
import { useSelector, useDispatch } from 'react-redux';
import { rearrangeCourses, createCourse } from '../redux/slices/CoursesSlice';

function CourseSearch() {
    const inputRef = useRef(null);

    const { courses } = useSelector((state) => state.courses);
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [subAndCrseCode, setSubAndCrseCode] = useState('');
    const [courseOptions, setCourseOptions] = useState(subAndCrseCodes.subAndCrseCodes);
    const [isFocusedOnInput, setIsFocusedOnInput] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e, courseName) => {
        if (e) {
            e.preventDefault();
        }

        const getNewCourseInfo = async () => {
            try {
                const findClassResponse = JSON.parse(
                    await axios.get(`scheduler/find_class/${courseName.toUpperCase()}`, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                );

                const sections = response.data.sections;

                const formattedSubAndCrseCode =
                    response.data.course_info.SUBJ_CODE.trim() + ' ' + response.data.course_info.CRSE_CODE.trim();

                let key =
                    courses.length > 0
                        ? courses.reduce(
                              (max, course) => (course.courseOverview.key > max ? course.courseOverview.key : max), -1) + 1
                        : 0;

                let course = {
                    courseOverview: {
                        ...findClassResponse.data.course_overview,
                        subAndCrseCode: formattedSubAndCrseCode,
                        key: key,
                    },
                    sections: sections,
                };

                return course;
            } catch (error) {
                const errorMessage =
                    error.response?.data?.error || 'There was an error getting the class details. Please try again.';
                setError(errorMessage);
                return;
            }
        };

        const existingCourse = courses.find(
            (course) => course.courseOverview.subAndCrseCode === courseName.toUpperCase()
        );

        if (!existingCourse) {
            let course = await getNewCourseInfo();

            if (!course) {
                return;
            }

            if (user) {
                const createCourseResponse = await axios.post(
                    `scheduler/create_course`,
                    JSON.stringify({
                        subAndCrseCode: courseName.toUpperCase(),
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                course.courseOverview.courseId = createCourseResponse.data.id;
            } else {
                let storedCourses = localStorage.getItem('courses');
                if (storedCourses) {
                    storedCourses = JSON.parse(storedCourses);
                    storedCourses.push({ subAndCrseCode: courseName.toUpperCase(), sections: [] });
                    localStorage.setItem('courses', JSON.stringify(storedCourses));
                } else {
                    localStorage.setItem(
                        'courses',
                        JSON.stringify([{ subAndCrseCode: courseName.toUpperCase(), sections: [] }])
                    );
                }
            }

            dispatch(createCourse(course));
        } else {
            dispatch(rearrangeCourses(existingCourse));
        }

        setSubAndCrseCode('');
        setIsFocusedOnInput(false);
        setCourseOptions(subAndCrseCodes.subAndCrseCodes);
        if (e) {
            inputRef.current.blur();
        }
    };

    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        setSubAndCrseCode(inputValue);
        setError(null);
        setCourseOptions(
            subAndCrseCodes.subAndCrseCodes.filter((subAndCrseCode) => {
                return subAndCrseCode.startsWith(inputValue.toUpperCase());
            })
        );
    };

    return (
        <div className='class-search'>
            <form
                onSubmit={(e) => {
                    e.target.blur();
                    handleSubmit(e, subAndCrseCode);
                }}
            >
                <div className='class-search-input-container'>
                    <input
                        type='text'
                        placeholder='Find a class'
                        name='subAndCrseCode'
                        value={subAndCrseCode}
                        ref={inputRef}
                        onChange={handleInputChange}
                        onFocus={() => setIsFocusedOnInput(true)}
                        onBlur={() => setIsFocusedOnInput(false)}
                        onClick={() => {
                            setIsFocusedOnInput(true);
                        }}
                    />
                    {isFocusedOnInput && courseOptions.length > 0 && (
                        <div className='class-search-course-suggestion-list'>
                            {courseOptions.map((course, index) => (
                                <div
                                    key={index}
                                    className='class-search-course-option'
                                    onMouseDown={() => {
                                        handleSubmit(null, course);
                                    }}
                                >
                                    {course}
                                </div>
                            ))}
                        </div>
                    )}
                    {error && <div className='error'>{error}</div>}
                </div>
            </form>
        </div>
    );
}

export default CourseSearch;
