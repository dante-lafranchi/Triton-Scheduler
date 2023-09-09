import { useState, useRef, useEffect } from 'react';
import CourseCardPopup from './CourseCardPopUp';

function CalendarCourseCard({ key, section, handleOverlappingSectionClick }) {
    const [popupVisible, setPopupVisible] = useState(false);
    const popupRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setPopupVisible(false);
            }
        };

        if (popupVisible) {
            setTimeout(() => {
                document.addEventListener('click', handleOutsideClick);
            }, 250);
        }

        // clean up
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [popupVisible]);

    return (
        <>
            {popupVisible && <CourseCardPopup section={section} popupRef={popupRef} popupVisible={popupVisible} />}
            <div
                key={key}
                className='calendar-card'
                style={{
                    top: section.top,
                    height: section.height,
                    opacity: section.isOverlapping ? 1 : section.isHovering ? 0.7 : 1,
                    backgroundColor: section.courseColor,
                    boxSizing: 'border-box',
                    border: section.isOverlapping ? 'solid 2px red' : 'none',
                    width: section.isOverlapping ? (section.width === '80%' ? '80%' : null) : null,
                    zIndex: section.isOverlapping ? section.zIndex : 1,
                    color: section.courseColor === '#FCCF46' ? 'black' : 'white',
                }}
                onClick={(e) => {
                    if (section.isOverlapping && section.width === '100%') {
                        handleOverlappingSectionClick(section.day, section);
                    }
                    setPopupVisible((prevpopupVisible) => !prevpopupVisible);
                }}
            >
                <div
                    className='calendar-card-details'
                    style={{ padding: section.isOverlapping ? '5px 13px' : '7px 13px' }}
                    key={key}
                >
                    <div className='calendar-card-details-title'>
                        <span>{section.subAndCrseCode}</span>
                        <span className='bullet-symbol'> &bull; </span>
                        <span>{section.FK_CDI_INSTR_TYPE} </span>
                        <span>{section.SECT_CODE}</span>
                    </div>
                    <div className='calendar-card-details-body'>
                        <p>
                            {section.BLDG_CODE.trim()} {section.ROOM_CODE.trim()}
                        </p>
                        <p>{section.formattedTime}</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CalendarCourseCard;
