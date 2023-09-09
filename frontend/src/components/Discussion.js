import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import {
    handleCheckboxChange,
    handleEnterHover,
    handleExitHover,
    setIsSectionDeleted,
} from '../redux/slices/SectionsSlice';

function Discussion({ section, courseOverview }) {
    const [isChecked, setIsChecked] = useState(false);
    const [sectionId, setSectionId] = useState('');

    const { user } = useSelector((state) => state.user);
    const { sections, isSectionDeleted } = useSelector((state) => state.sections);
    const dispatch = useDispatch();

    useEffect(() => {
        let lectureIsSelected = sections.some(
            (selectedSection) => selectedSection.uniqueIdentifier === section.uniqueIdentifier
        );

        // handle section deletion from calendar
        if (isChecked && !lectureIsSelected) {
            setIsChecked(false);
            dispatch(setIsSectionDeleted(false));
        }
    }, [isSectionDeleted]);

    useEffect(() => {
        if (section.isChecked) {
            setIsChecked(true);
        }
    }, [section.isChecked]);

    const isDayCodeValid = (dayCode) => {
        const validDays = ['M', 'T', 'W', 'Th', 'F'];

        for (let i = 0; i < dayCode.length; i++) {
            let day = dayCode[i];
            if (day === 'T' && i + 1 < dayCode.length && dayCode[i + 1] === 'h') {
                day = 'Th';
                i++; // Skip the next character ('h') since it's already handled
            }
            if (!validDays.includes(day)) {
                return false;
            }
        }

        return true;
    };

    const handleSectionSelection = (section, isHovering, isCheckbox) => {
        if (!isDayCodeValid(section.dayCode)) {
            return;
        }

        if (isCheckbox) {
            dispatch(handleCheckboxChange(section.uniqueIdentifier));
        } else {
            const isSectionSelected = sections.some(
                (selectedSection) => selectedSection.uniqueIdentifier === section.uniqueIdentifier
            );
            if (isHovering) {
                if (!isSectionSelected) {
                    dispatch(handleEnterHover({ section: section, uniqueIdentifier: section.uniqueIdentifier }));
                }
            } else if (!isChecked) {
                dispatch(handleExitHover(section.uniqueIdentifier));
            }
        }
    };

    const handleClick = async (section) => {
        if (isChecked) {
            // checkbox is being unchecked
            if (user) {
                // if there is a user, the sectionId was either added in the Course component
                // when we got the planned sections, or added in this component when the user
                // checked the checkbox
                try {
                    let thisSectionId = section.sectionId || sectionId;
                    await axios.delete(`scheduler/delete_section/${thisSectionId}`, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                } catch (error) {
                    console.log(error);
                }
            } else {
                let storedCourses = JSON.parse(localStorage.getItem('courses'));
                const courseIndex = storedCourses.findIndex(
                    (course) => course.subAndCrseCode === section.subAndCrseCode
                );
                if (courseIndex !== -1) {
                    storedCourses[courseIndex].sections = storedCourses[courseIndex].sections.filter(
                        (storedSection) => storedSection !== section.SECT_CODE
                    );
                    localStorage.setItem('courses', JSON.stringify(storedCourses));
                }
            }
        } else {
            // checkbox is being checked
            if (user) {
                try {
                    const response = await axios.post(
                        'scheduler/create_section',
                        JSON.stringify({ sectCode: section.SECT_CODE, courseId: section.courseId }),
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    setSectionId(response.data.id);
                } catch (error) {
                    console.log(error);
                }
            } else {
                let storedCourses = JSON.parse(localStorage.getItem('courses'));
                const courseIndex = storedCourses.findIndex(
                    (course) => course.subAndCrseCode === courseOverview.subAndCrseCode
                );

                if (courseIndex !== -1) {
                    storedCourses[courseIndex].sections.push(section.SECT_CODE);
                    localStorage.setItem('courses', JSON.stringify(storedCourses));
                }
            }
        }
    };

    return (
        <div
            className='discussion-details'
            onMouseEnter={handleSectionSelection.bind(null, section, true, false)}
            onMouseLeave={handleSectionSelection.bind(null, section, false, false)}
        >
            <label className='discussion-checkbox-and-label'>
                <input
                    type='checkbox'
                    checked={isChecked}
                    id={`discussion-checkbox-${section.uniqueIdentifier}`}
                    onChange={() => {
                        setIsChecked((prevIsChecked) => !prevIsChecked);
                        handleSectionSelection(section, false, true);
                        handleClick(section);
                    }}
                />
                <svg
                    className='checkmark discussion-checkmark'
                    xmlns='http://www.w3.org/2000/svg'
                    x='0px'
                    y='0px'
                    width='26'
                    height='26'
                    viewBox='0 0 26 26'
                >
                    <path d='M 22.566406 4.730469 L 20.773438 3.511719 C 20.277344 3.175781 19.597656 3.304688 19.265625 3.796875 L 10.476563 16.757813 L 6.4375 12.71875 C 6.015625 12.296875 5.328125 12.296875 4.90625 12.71875 L 3.371094 14.253906 C 2.949219 14.675781 2.949219 15.363281 3.371094 15.789063 L 9.582031 22 C 9.929688 22.347656 10.476563 22.613281 10.96875 22.613281 C 11.460938 22.613281 11.957031 22.304688 12.277344 21.839844 L 22.855469 6.234375 C 23.191406 5.742188 23.0625 5.066406 22.566406 4.730469 Z'></path>{' '}
                </svg>
                <div className='discussion-details-body'>
                    <span>
                        <label className='checkbox-label' htmlFor={`discussion-checkbox-${section.uniqueIdentifier}`}>
                            {section.SECT_CODE}:
                        </label>
                    </span>
                    <span style={{ whiteSpace: 'pre-wrap' }}> </span>
                    <span>
                        {section.dayCode}, {section.formattedTime},{' '}
                    </span>
                    <span>
                        {section.BLDG_CODE.split(' ').join('')} {section.ROOM_CODE.split(' ').join('')},{' '}
                    </span>
                    <p
                        className={section.enrollementColorClass + ' discussion-details-enrollment-info'}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {section.enrollment}/{section.capacity} enrolled
                    </p>
                </div>
            </label>
        </div>
    );
}

export default Discussion;
