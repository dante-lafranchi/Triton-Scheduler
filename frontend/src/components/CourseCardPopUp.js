import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { deleteSection } from '../redux/slices/SectionsSlice';

function CourseCardPopup({ section, popupRef, popupVisible }) {
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const handleSectionDelete = async (section) => {
        if (user) {
            try {
                await axios.delete(`scheduler/delete_section/${section.sectionId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error) {
                console.log(error);
            }
        } else {
            let storedCourses = JSON.parse(localStorage.getItem('courses'));
            const courseIndex = storedCourses.findIndex((course) => course.subAndCrseCode === section.subAndCrseCode);
            if (courseIndex !== -1) {
                storedCourses[courseIndex].sections = storedCourses[courseIndex].sections.filter(
                    (storedSection) => storedSection !== section.SECT_CODE
                );
                localStorage.setItem('courses', JSON.stringify(storedCourses));
            }
        }

        dispatch(deleteSection(section.uniqueIdentifier));
    };

    return (
        <div
            style={{
                top: section.top + section.height / 2 - 52,
                opacity: popupVisible ? 1 : 0,
                transition: 'opacity 1s',
            }}
            ref={popupRef}
            className='course-card-popup'
        >
            <div className='course-card-popup-details'>
                <div className='course-card-popup-details-title'>
                    <div className='course-square' style={{ backgroundColor: section.courseColor }}></div>
                    <p>
                        {section.subAndCrseCode} &bull; {section.FK_CDI_INSTR_TYPE} {section.SECT_CODE}
                    </p>
                    <div className='delete-icon' onClick={() => handleSectionDelete(section)}>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            x='0px'
                            y='0px'
                            width='24'
                            height='24'
                            viewBox='0 0 24 24'
                        >
                            <path d='M 10 2 L 9 3 L 4 3 L 4 5 L 5 5 L 5 20 C 5 20.522222 5.1913289 21.05461 5.5683594 21.431641 C 5.9453899 21.808671 6.4777778 22 7 22 L 17 22 C 17.522222 22 18.05461 21.808671 18.431641 21.431641 C 18.808671 21.05461 19 20.522222 19 20 L 19 5 L 20 5 L 20 3 L 15 3 L 14 2 L 10 2 z M 7 5 L 17 5 L 17 20 L 7 20 L 7 5 z M 9 7 L 9 18 L 11 18 L 11 7 L 9 7 z M 13 7 L 13 18 L 15 18 L 15 7 L 13 7 z'></path>
                        </svg>
                    </div>
                </div>
                <div className='course-card-popup-details-body'>
                    <p>
                        {section.BLDG_CODE.trim()} {section.ROOM_CODE.trim()}, {section.FORMATTED_TIME}
                    </p>
                    <p>{section.professor}</p>
                    <p className={section.enrollmentColorClass}>
                        {section.enrollment}/{section.capacity} enrolled
                    </p>
                </div>
            </div>
        </div>
    );
}

export default CourseCardPopup;
