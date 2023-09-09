import { useDispatch } from 'react-redux';
import { logout as userLogout } from '../redux/slices/UserSlice';
import { setCourses } from '../redux/slices/CoursesSlice';
import { setSections } from '../redux/slices/SectionsSlice';
import axios from 'axios';

export const useLogout = () => {

    const dispatch = useDispatch();

    const logout = async () => {
        try {
            await axios.post('user/logout')

            dispatch(userLogout())
            dispatch(setCourses([]))
            dispatch(setSections([]))
        } catch (error) {
            console.log(error)
        }
    }

    return { logout }
}