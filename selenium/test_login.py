from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import time

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
driver.get("http://localhost:5500/login.html")  # change port if needed

time.sleep(2)

driver.find_element(By.ID, "email").send_keys("studentuser@gmail.com")
driver.find_element(By.ID, "password").send_keys("1234")
driver.find_element(By.TAG_NAME, "button").click()

time.sleep(3)

print("Login test executed successfully")
driver.quit()
