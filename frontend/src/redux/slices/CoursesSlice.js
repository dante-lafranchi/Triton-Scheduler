import { createSlice } from '@reduxjs/toolkit';

const coursesSlice = createSlice({
    name: 'courses',
    initialState: {
        courses: [],
    },
    reducers: {
        setCourses: (state, action) => {
            state.courses = [...action.payload];
        },
        rearrangeCourses: (state, action) => {
            state.courses = [
                action.payload,
                ...state.courses.filter(
                    (course) => course.courseOverview.subAndCrseCode !== action.payload.courseOverview.subAndCrseCode
                ),
            ];
        },
        createCourse: (state, action) => {
            state.courses = [action.payload, ...state.courses];
        },
        deleteCourse: (state, action) => {
            const subAndCrseCode = action.payload;
            state.courses = state.courses.filter((course) => course.courseOverview.subAndCrseCode !== subAndCrseCode);
        },
    },
});

export const { setCourses, rearrangeCourses, createCourse, deleteCourse } = coursesSlice.actions;

export default coursesSlice.reducer;
