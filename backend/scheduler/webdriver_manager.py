import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

class WebDriverManager:
    _web_driver = None

    @classmethod
    def get_webdriver(cls):
        chrome_options = Options()
        chrome_options.binary_location = os.environ.get('GOOGLE_CHROME_BIN')
        chrome_options.add_argument("--headless")
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--no-sandbox')

        file_path = os.path.join(os.environ.get("HOME"), "backend", "scheduler", "chromedriver", "chromedriver_exe")

        if cls._web_driver is None:
            cls._web_driver = webdriver.Chrome(service=Service(executable_path=file_path), options=chrome_options)
        return cls._web_driver