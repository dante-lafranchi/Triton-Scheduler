import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import CalendarCourseCard from './CalendarCourseCard';

function Calendar() {
    const { sections } = useSelector((state) => state.sections);

    const [sectionsByDay, setSectionsByDay] = useState({});

    useEffect(() => {
        const separateSectionByDay = (selectedSections) => {
            let sectionByDay = {
                M: [],
                T: [],
                W: [],
                Th: [],
                F: [],
            };

            selectedSections.forEach((section) => {
                section.top = (section.BEGIN_HH_TIME - 8) * 70 + (section.BEGIN_MM_TIME * 70) / 60;
                section.height =
                    ((section.END_HH_TIME * 60 + section.END_MM_TIME -
                        (section.BEGIN_HH_TIME * 60 + section.BEGIN_MM_TIME)) * 70) / 60;

                for (let i = 0; i < section.dayCode.length; i++) {
                    let day = section.dayCode[i];
                    if (day === 'T' && i + 1 < section.dayCode.length && section.dayCode[i + 1] === 'h') {
                        sectionByDay['Th'].push(section);
                        i++; // Skip the next character since it's already handled
                    } else {
                        sectionByDay[day].push(section);
                    }
                }

                if (section.subLecture && section.subLecture.dayCode && isDayCodeValid(section.subLecture.dayCode)) {
                    sectionByDay[section.subLecture.dayCode].push({
                        ...section.subLecture,
                        isHovering: section.isHovering,
                    });
                }
            });

            const findOverlappingSections = (sectionByDay) => {
                const doSectionsOverlap = (sectionA, sectionB) => {
                    return (
                        (sectionA.END_HH_TIME > sectionB.BEGIN_HH_TIME ||
                            (sectionA.END_HH_TIME === sectionB.BEGIN_HH_TIME &&
                                sectionA.END_MM_TIME >= sectionB.BEGIN_MM_TIME)) &&
                        (sectionA.BEGIN_HH_TIME < sectionB.END_HH_TIME ||
                            (sectionA.BEGIN_HH_TIME === sectionB.END_HH_TIME &&
                                sectionA.BEGIN_MM_TIME <= sectionB.END_MM_TIME))
                    );
                };

                for (let day in sectionByDay) {
                    let sections = sectionByDay[day];
                    for (let i = 0; i < sections.length; i++) {
                        let section = sections[i];
                        section.isOverlapping = false;
                        for (let j = 0; j < sections.length; j++) {
                            let otherSection = sections[j];
                            if (section.uniqueIdentifier !== otherSection.uniqueIdentifier) {
                                if (doSectionsOverlap(section, otherSection)) {
                                    section.isOverlapping = true;
                                    section.width = '80%';
                                    section.zIndex = 2;
                                    section.otherOverlappingSectionUniqueIdentifier = otherSection.uniqueIdentifier;
                                    otherSection.isOverlapping = true;
                                    otherSection.width = '100%';
                                    otherSection.zIndex = 1;
                                    otherSection.otherOverlappingSectionUniqueIdentifier = section.uniqueIdentifier;
                                }
                            }
                        }
                    }
                }

                return sectionByDay;
            };

            sectionByDay = findOverlappingSections(JSON.parse(JSON.stringify(sectionByDay)));

            return sectionByDay;
        };

        setSectionsByDay(separateSectionByDay(JSON.parse(JSON.stringify(sections))));
    }, [sections]);

    const handleOverlappingSectionClick = (day, section) => {
        setSectionsByDay((prevSectionsByDay) => {
            const updatedSections = prevSectionsByDay[day].map((existingSection) => {
                if (existingSection.uniqueIdentifier === section.otherOverlappingSectionUniqueIdentifier) {
                    return {
                        ...existingSection,
                        width: existingSection.width === '100%' ? '80%' : '100%',
                        zIndex: existingSection.zIndex === 1 ? 2 : 1,
                    };
                } else if (existingSection.uniqueIdentifier === section.uniqueIdentifier) {
                    return {
                        ...existingSection,
                        width: section.width === '100%' ? '80%' : '100%',
                        zIndex: section.zIndex === 1 ? 2 : 1,
                    };
                }
                return existingSection;
            });

            return {
                ...prevSectionsByDay,
                [day]: updatedSections,
            };
        });
    };

    return (
        <div className='calendar'>
            <div className='calendar-header'>
                <div className='calendar-spacer'></div>
                <div className='calendar-week'>
                    <div className='calendar-day-name'>Monday</div>
                    <div className='calendar-day-name'>Tuesday</div>
                    <div className='calendar-day-name'>Wednesday</div>
                    <div className='calendar-day-name'>Thursday</div>
                    <div className='calendar-day-name calendar-last-day'>Friday</div>
                </div>
            </div>
            <div className='calendar-body'>
                <div className='calendar-time'>
                    <div className='calendar-hour'>8am</div>
                    <div className='calendar-hour'>9am</div>
                    <div className='calendar-hour'>10am</div>
                    <div className='calendar-hour'>11am</div>
                    <div className='calendar-hour'>12pm</div>
                    <div className='calendar-hour'>1pm</div>
                    <div className='calendar-hour'>2pm</div>
                    <div className='calendar-hour'>3pm</div>
                    <div className='calendar-hour'>4pm</div>
                    <div className='calendar-hour'>5pm</div>
                    <div className='calendar-hour'>6pm</div>
                    <div className='calendar-hour'>7pm</div>
                    <div className='calendar-hour'>8pm</div>
                </div>
                <div className='calendar-week-events'>
                    <div className='calendar-day-events'>
                        {sectionsByDay['M'] &&
                            sectionsByDay['M'].map((section, index) => (
                                <CalendarCourseCard
                                    key={'M' + section.uniqueIdentifier}
                                    section={{ ...section, day: 'M' }}
                                    handleOverlappingSectionClick={handleOverlappingSectionClick}
                                />
                            ))}
                    </div>
                    <div className='calendar-day-events'>
                        {sectionsByDay['T'] &&
                            sectionsByDay['T'].map((section, index) => (
                                <CalendarCourseCard
                                    key={'T' + section.uniqueIdentifier}
                                    section={{ ...section, day: 'T' }}
                                    handleOverlappingSectionClick={handleOverlappingSectionClick}
                                />
                            ))}
                    </div>
                    <div className='calendar-day-events'>
                        {sectionsByDay['W'] &&
                            sectionsByDay['W'].map((section, index) => (
                                <CalendarCourseCard
                                    key={'W' + section.uniqueIdentifier}
                                    section={{ ...section, day: 'W' }}
                                    handleOverlappingSectionClick={handleOverlappingSectionClick}
                                />
                            ))}
                    </div>
                    <div className='calendar-day-events'>
                        {sectionsByDay['Th'] &&
                            sectionsByDay['Th'].map((section, index) => (
                                <CalendarCourseCard
                                    key={'Th' + section.uniqueIdentifier}
                                    section={{ ...section, day: 'Th' }}
                                    handleOverlappingSectionClick={handleOverlappingSectionClick}
                                />
                            ))}
                    </div>
                    <div className='calendar-last-day calendar-day-events'>
                        {sectionsByDay['F'] &&
                            sectionsByDay['F'].map((section, index) => (
                                <CalendarCourseCard
                                    key={'F' + section.uniqueIdentifier}
                                    section={{ ...section, day: 'F' }}
                                    handleOverlappingSectionClick={handleOverlappingSectionClick}
                                />
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Calendar;
