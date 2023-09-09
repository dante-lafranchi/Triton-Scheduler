import { useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { deleteCourse } from '../redux/slices/CoursesSlice';
import { deleteSections } from '../redux/slices/SectionsSlice';

function CourseHeader({ courseOverview, toggleShowLecture }) {
    const [showLecture, setShowLecture] = useState(courseOverview.showLecture);

    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const handleDelete = async () => {
        if (user) {
            try {
                await axios.delete(`scheduler/delete_course/${courseOverview.courseId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error) {
                console.log(error);
            }
        } else {
            let storedCourses = JSON.parse(localStorage.getItem('courses'));
            storedCourses = storedCourses.filter(
                (storedCourse) => storedCourse.subAndCrseCode !== courseOverview.subAndCrseCode
            );
            localStorage.setItem('courses', JSON.stringify(storedCourses));
        }

        dispatch(deleteCourse(courseOverview.subAndCrseCode));
        dispatch(deleteSections(courseOverview.subAndCrseCode));
    };

    return (
        <div className='course-header'>
            <div className='course-header-title'>
                <div className='course-square' style={{ backgroundColor: courseOverview.color }}></div>
                <h4>{courseOverview.subAndCrseCode}</h4>
                <div className='delete-icon' onClick={handleDelete}>
                    <svg xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width='24' height='24' viewBox='0 0 24 24'>
                        <path d='M 10 2 L 9 3 L 4 3 L 4 5 L 5 5 L 5 20 C 5 20.522222 5.1913289 21.05461 5.5683594 21.431641 C 5.9453899 21.808671 6.4777778 22 7 22 L 17 22 C 17.522222 22 18.05461 21.808671 18.431641 21.431641 C 18.808671 21.05461 19 20.522222 19 20 L 19 5 L 20 5 L 20 3 L 15 3 L 14 2 L 10 2 z M 7 5 L 17 5 L 17 20 L 7 20 L 7 5 z M 9 7 L 9 18 L 11 18 L 11 7 L 9 7 z M 13 7 L 13 18 L 15 18 L 15 7 L 13 7 z'></path>
                    </svg>
                </div>
            </div>
            <div className='course-header-body'>
                <p className='course-title'>{courseOverview.CRSE_TITLE}</p>
                {courseOverview.study_hours_per_week && (
                    <div className='course-header-reviews'>
                        <span>{courseOverview.study_hours_per_week} study hrs/week </span>
                        <span className='bullet-symbol'> &bull; </span>
                        <span>
                            {courseOverview.average_grade_received !== 'F (0)'
                                ? `${courseOverview.average_grade_received} avg. grade`
                                : 'N/A avg. grade'}
                        </span>
                    </div>
                )}
                <div className='course-header-enrolled-and-dropdown'>
                    <div className='course-header-enrolled'>
                        <span className={`${courseOverview.enrollmentColorClass} course-header-enrollment`}>
                            {courseOverview.enrollment}/{courseOverview.capacity} enrolled
                        </span>
                        <span className='bullet-symbol'> &bull; </span>
                        <span className='course-units'>{courseOverview.UNIT_TO} units</span>
                    </div>
                    <div
                        className='arrow-icon'
                        onClick={() => {
                            toggleShowLecture();
                            setShowLecture((prevShowLecture) => !prevShowLecture);
                        }}
                    >
                        <svg
                            style={!showLecture ? { transform: 'rotate(-180deg)' } : null}
                            width='14'
                            height='8'
                            viewBox='0 0 14 8'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            <path d='M1 1L7 7L13 1'></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseHeader;
