import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { createSections, updateSectionsColor } from '../redux/slices/SectionsSlice';
import Lecture from './Lecture';
import CourseHeader from './CourseHeader';
import Seminar from './Seminar';

const Course = ({ courseOverview, sections, key }) => {
    const { user } = useSelector((state) => state.user);
    const { sections: plannedSections } = useSelector((state) => state.sections);
    const dispatch = useDispatch();

    const [showLecture, setShowLecture] = useState(false);
    const [updatedSections, setUpdatedSections] = useState({});
    const [courseEnrollmentData, setCourseEnrollmentData] = useState({});

    useEffect(() => {
        if (courseOverview.showLecture) {
            setShowLecture(true);
        }

        // helper functions
        const numberToDay = {
            1: 'M',
            2: 'T',
            3: 'W',
            4: 'Th',
            5: 'F',
            6: 'S',
            7: 'Su',
        };

        const convertTime = (hour, minute) => {
            const h = (hour === 12 ? 12 : hour % 12).toString() + ':';
            const m = (minute < 10 ? '0' : '') + minute.toString();
            return h + m + ' ' + (hour < 12 ? 'AM' : 'PM');
        };

        const getEnrollment = (section) => {
            let enrollment = 0;
            let capacity = 0;

            if (section.FK_CDI_INSTR_TYPE === 'LE' && section.discussions) {
                for (let discussion of section.discussions) {
                    enrollment += discussion.SCTN_ENRLT_QTY + discussion.COUNT_ON_WAITLIST;
                    capacity += discussion.SCTN_CPCTY_QTY;
                }
            } else {
                enrollment += section.SCTN_ENRLT_QTY + section.COUNT_ON_WAITLIST;
                capacity += section.SCTN_CPCTY_QTY;
            }

            return { enrollment, capacity };
        };

        const getEnrollmentColorClass = (enrollment, capacity) => {
            if (enrollment / capacity < 0.5) {
                return 'green';
            } else if (enrollment / capacity < 0.75) {
                return 'yellow';
            } else {
                return 'red';
            }
        };

        const separateSections = (sections) => {
            let separatedSections = {
                lectures: [],
                discussions: [],
                seminars: [],
            };

            courseOverview.enrollment = 0;
            courseOverview.capacity = 0;

            let someSeminarIsHalfEnrolled = false;

            // separate sections into section type
            for (let section of sections) {
                if (section.FK_SST_SCTN_STATCD === 'CA') {
                    // section is cancelled
                    continue;
                }

                section.dayCode = [...section.DAY_CODE].map((digit) => numberToDay[digit]).join('');
                section.fomattedTime = `${convertTime(section.BEGIN_HH_TIME, section.BEGIN_MM_TIME)} - ${convertTime(
                    section.END_HH_TIME,
                    section.END_MM_TIME
                )}`;

                section.SECT_CODE = section.SECT_CODE;
                section.courseColor = courseOverview.color;
                section.uniqueIdentifier = `${section.SECT_CODE}-${courseOverview.subAndCrseCode}`;
                section.professor = section.PERSON_FULL_NAME.split(';')[0].trim();

                const { enrollment, capacity } = getEnrollment(section);
                section.enrollment = enrollment;
                section.capacity = capacity;
                section.enrollmentColorClass = getEnrollmentColorClass(enrollment, capacity);

                if (section.FK_CDI_INSTR_TYPE === 'LE') { // lecture
                    // associate corresponding discussions with lecture
                    section.discussions = separatedSections.discussions.filter(
                        (discussion) => discussion.SECT_CODE[0] === section.SECT_CODE[0]
                    );

                    courseOverview.enrollment += enrollment;
                    courseOverview.capacity += capacity; 
                } else if (section.FK_CDI_INSTR_TYPE === 'SE') { // seminar
                    courseOverview.enrollment += enrollment;
                    courseOverview.capacity += capacity;
                }

                if (section.FK_SPM_SPCL_MTG_CD === '  ') { // not a special meeting
                    if (section.FK_CDI_INSTR_TYPE === 'DI' || section.FK_CDI_INSTR_TYPE === 'LA') { // discussion or lab
                        separatedSections.discussions.push(section);
                    } else if (section.FK_CDI_INSTR_TYPE === 'SE') { // seminar
                        separatedSections.seminars.push(section);

                        if (section.enrollment / section.capacity > 0.5) {
                            someSeminarIsHalfEnrolled = true;
                        }
                    } else if (section.FK_CDI_INSTR_TYPE === 'LE') { // lecture
                        const existingLectureWithSameSectCode = separatedSections.lectures.find(
                            (existingSection) => existingSection.SECT_CODE === section.SECT_CODE
                        );

                        // handle case where the lecture has a sub-lecture
                        if (existingLectureWithSameSectCode) {
                            if (existingLectureWithSameSectCode.dayCode.length > section.dayCode.length) {
                                existingLectureWithSameSectCode.subLecture = section;
                                section.subLecure = null;
                            } else {
                                section.subLecture = existingLectureWithSameSectCode;
                                existingLectureWithSameSectCode.subLecture = null;
                                separatedSections.lectures = separatedSections.lectures.filter(
                                    (section) => section.SECT_CODE !== existingLectureWithSameSectCode.SECT_CODE 
                                );
                                separatedSections.lectures.push(section);
                            }
                        } else {
                            separatedSections.lectures.push(section);
                        }
                    }
                }
            }

            // remove seminars that webreg discreetly cancelled
            if (someSeminarIsHalfEnrolled) {
                for (let seminar of separatedSections.seminars) {
                    if (seminar.enrollment === 0) {
                        sections.seminars = sections.seminars.filter(
                            (existingSeminar) => existingSeminar.SECT_CODE !== seminar.SECT_CODE
                        );
                    }
                }
            }

            const courseEnrollmentColorClass = getEnrollmentColorClass(
                courseOverview.enrollment,
                courseOverview.capacity
            );
            setCourseEnrollmentData({
                enrollment: courseOverview.enrollment,
                capacity: courseOverview.capacity,
                enrollmentColorClass: courseEnrollmentColorClass,
            });

            return separatedSections;
        };

        const separatedSections = separateSections(sections);

        setUpdatedSections(separatedSections);

        const getPlannedSections = async (sections) => {
            let plannedSections = [];

            if (user) {
                try {
                    const response = await axios.get(`scheduler/get_sections_for_course/${courseOverview.courseId}`, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    plannedSections = response.data;
                } catch (error) {
                    console.log(error);
                }
            } else {
                let storedCourses = JSON.parse(localStorage.getItem('courses'));
                let course = storedCourses.find((course) => course.subAndCrseCode === courseOverview.subAndCrseCode);
                if (course) {
                    plannedSections = course.sections;
                }
            }

            for (let section of plannedSections) {
                section.SECT_CODE = user ? section.sect_code : section;
                section.sectionId = user ? section.id : null;
                section.courseId = user ? section.course_id : null;
                section.isChecked = true;
                section.isHovering = false;

                const matchingSection =
                    sections.lectures.find((lecture) => lecture.SECT_CODE === section.SECT_CODE) ||
                    sections.discussions.find((discussion) => discussion.SECT_CODE === section.SECT_CODE) ||
                    sections.seminars.find((seminar) => seminar.SECT_CODE === section.SECT_CODE);

                if (matchingSection) {
                    let updatedSection = { ...section, ...matchingSection };
                    Object.assign(section, updatedSection);
                }
            }

            return plannedSections;
        };

        getPlannedSections(separatedSections).then((plannedSections) => {
            dispatch(createSections(plannedSections));
        });
    }, [key]);

    useEffect(() => {
        if (plannedSections && plannedSections.length > 0) {
            dispatch(
                updateSectionsColor({ subAndCrseCode: courseOverview.subAndCrseCode, color: courseOverview.color })
            );
        }

        if (updatedSections && updatedSections.lecture && updatedSections.seminar) {
            setUpdatedSections((prevUpdatedSections) => {
                return {
                    ...prevUpdatedSections,
                    lecture: prevUpdatedSections.lecture.map((lecture) => ({
                        ...lecture,
                        courseColor: courseOverview.color,
                        discussions: lecture.discussions.map((discussion) => ({
                            ...discussion,
                            courseColor: courseOverview.color,
                        })),
                    })),
                    seminar: prevUpdatedSections.seminar.map((seminar) => ({
                        ...seminar,
                        courseColor: courseOverview.color,
                    })),
                };
            });
        }
    }, [courseOverview.color]);

    const toggleShowLecture = () => {
        setShowLecture((prevShowLecture) => !prevShowLecture);
    };

    return (
        <div className='class-details'>
            {courseEnrollmentData && (
                <CourseHeader
                    courseOverview={{ ...courseOverview, ...courseEnrollmentData }}
                    toggleShowLecture={toggleShowLecture}
                />
            )}
            <div
                className={`lectures ${showLecture ? 'show' : ''}`}
                style={{
                    maxHeight: showLecture
                        ? updatedSections.seminar && updatedSections.seminar.length === 0
                            ? updatedSections.lecture.length * 234 +
                              updatedSections.discussion.length * 42 +
                              Math.min(190, updatedSections.discussion.length * 42) +
                              'px'
                            : '450px' // seminar
                        : 0,
                }}
            >
                {updatedSections.lecture &&
                    updatedSections.lecture.length > 0 &&
                    updatedSections.lecture.map((section, index) => (
                        <Lecture key={index} section={section} courseOverview={courseOverview} />
                    ))}
                {updatedSections.seminar && updatedSections.seminar.length > 0 && (
                    <div className='seminar-container'>
                        <div className='seminar-sections'>
                            <div className='vertical-bar' style={{ backgroundColor: courseOverview.color }}></div>
                            <h4 className='seminar-header'>Seminar</h4>
                            {updatedSections.seminar.map((section, index) => (
                                <Seminar key={index} section={section} courseOverview={courseOverview} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Course;
