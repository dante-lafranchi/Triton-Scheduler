from django.core.cache import caches
from redis.lock import Lock
from redis.exceptions import LockNotOwnedError

from .models import SharedData

from .get_cookies import get_session_cookies
from apscheduler.schedulers.background import BackgroundScheduler
from pytz import timezone
import atexit

def initialize_scheduler():
    redis_client = caches['default'].client.get_client()

    lock = Lock(redis_client, 'scheduler_lock', timeout=10)

    if lock.acquire(blocking=False):
        try:
            start_scheduler()
        finally:
            try:
                lock.release()
            except LockNotOwnedError:
                print('Lock was not acquired by this instance.')
    else:
        print('Another instance is already starting the scheduler.')

def start_scheduler():
    print('starting scheduler')

    numTabs = 0 

    def get_session_cookies_with_app_context(numTabs):
        result = get_session_cookies(numTabs)    

        from django.core.cache import caches

        redis_client = caches['default'].client.get_client()
        
        redis_client.hmset('cookies', result)

    get_session_cookies_with_app_context(numTabs)
    numTabs = 1
    
    scheduler = BackgroundScheduler(timezone=timezone('US/Pacific'))
    scheduler.add_job(get_session_cookies_with_app_context, 'cron', hour=4, minute=0, second=0, args=[numTabs])
    scheduler.start()
    atexit.register(lambda: scheduler.shutdown())