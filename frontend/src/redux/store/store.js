import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../slices/UserSlice';
import coursesReducer from '../slices/CoursesSlice';
import sectionsReducer from '../slices/SectionsSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        courses: coursesReducer,
        sections: sectionsReducer,
    },
});

export default store;
