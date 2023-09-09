import { useState, useEffect } from 'react';
import axios from 'axios';

function ProfessorRatings({ subAndCrseCode, professorName }) {
    const [professorRatings, setProfessorRatings] = useState(null);

    useEffect(() => {
        const getProfessorRatings = async () => {
            try {
                const response = await axios.get(`scheduler/get_professor_ratings/${professorName}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.data.professor_courses[subAndCrseCode]) {
                    return {
                        courseSpecific: true,
                        averageGradeReceived: response.data.professor_courses[subAndCrseCode].average_grade_received,
                        averageStudyHoursPerWeek: response.data.professor_courses[subAndCrseCode].study_hours_per_week,
                        percentRecommend: response.data.professor_courses[subAndCrseCode].recommend_professor_percentage,
                    };
                } else if (response.data.average_grade_received) {
                    // set to overall because this instructor hasn't taught this course before
                    return {
                        courseSpecific: false,
                        averageGradeReceived: response.data.average_grade_received,
                        averageStudyHoursPerWeek: response.data.study_hours_per_week,
                        percentRecommend: response.data.recommend_professor_percentage,
                    };
                }
            } catch (error) {
                console.log(error);
            }
        };

        getProfessorRatings()
            .then((professorRatings) => {
                setProfessorRatings(professorRatings);
            })
            .catch((error) => {
            });
    }, [professorName]);

    return (
        <div>
            {professorRatings && (
                <div className='professor-ratings'>
                    {professorRatings.courseSpecific ? <p>{subAndCrseCode} Ratings:</p> : <p>Overvall Ratings:</p>}
                    <p>
                        {professorRatings.percentRecommend}% recommend {professorName.split(',')[0]}
                    </p>
                    <p>{professorRatings.averageStudyHoursPerWeek} study hrs/week</p>
                    <p>{professorRatings.averageGradeReceived} avg. grade</p>
                </div>
            )}
        </div>
    );
}

export default ProfessorRatings;
