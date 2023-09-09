from .webdriver_manager import WebDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException
import os

from datetime import datetime
import pytz
from pytz import timezone
from apscheduler.schedulers.background import BackgroundScheduler
import atexit

def get_session_cookies(numTabs):
    # so that duo remembers us for 7 days
    driver = WebDriverManager.get_webdriver()

    if numTabs >= 1:
        driver.execute_script('window.open()')
        driver.switch_to.window(driver.window_handles[0])
        driver.close()
        driver.switch_to.window(driver.window_handles[0])
 
    driver.get('https://act.ucsd.edu/webreg2/main?p1=FA23')
    username_field = driver.find_element('id', 'ssousername')
    password_field = driver.find_element('id', 'ssopassword')

    username_field.send_keys(os.environ.get('SSO_USERNAME'))
    password_field.send_keys(os.environ.get('SSO_PASSWORD'))

    password_field.send_keys(Keys.RETURN)

    poss_duo_frame = driver.find_element(By.CSS_SELECTOR, "iframe[id='duo_iframe']")
    driver.switch_to.frame(poss_duo_frame)

    try:
        element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "#remember_me_label_text"))
        )
        element.click()

        element = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "#auth_methods > fieldset > div.row-label.push-label > button"))
        )
        element.click()
    except (NoSuchElementException, TimeoutException) as e:
        print("DUO is already logged in", e)

    try:
        element = WebDriverWait(driver, 30).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '#start-button-cell-id')))
        element.click()
        import time
        time.sleep(3)
    except (NoSuchElementException, TimeoutException) as e:
        print('Error finding start button:', e)

    cookies = driver.get_cookies()

    formatted_cookies = {cookie['name']: cookie['value'] for cookie in cookies}

    if driver.title == 'webregMain':
        from django.core.cache import caches

        redis_client = caches['default'].client.get_client()
    
        redis_client.set('scheduler_started', 0)

    # make sure page doesnt go inactive
    def refresh_page():
        print('refreshing driver')
        print('driver title', driver.title)

        target_time = datetime.now().replace(hour=5, minute=0, second=0, microsecond=0, tzinfo=pytz.timezone('US/Pacific'))

        current_time = datetime.now(pytz.timezone('US/Pacific'))

        # calculate time difference in minutes
        time_difference = (target_time - current_time).total_seconds() / 60
     
        if abs(time_difference) < 2:
            return 

        driver.refresh()

    # only add refresh page scheduler if num tabs is 0
    if numTabs == 0:
        scheduler = BackgroundScheduler(timezone=timezone('US/Pacific'))
        scheduler.add_job(refresh_page, 'interval', minutes=15)
        scheduler.start()
        atexit.register(lambda: scheduler.shutdown())

    return formatted_cookies