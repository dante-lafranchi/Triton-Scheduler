import Schedule from '../components/Schedule';
import Calendar from '../components/Calendar';

function Home() {
    return (
        <div className='Home'>
            <div className='schedule-container'>
                <Schedule />
            </div>
            <div className='calendar-container'>
                <Calendar />
            </div>
        </div>
    );
}

export default Home;
