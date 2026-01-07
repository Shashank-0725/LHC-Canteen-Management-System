from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
wait = WebDriverWait(driver, 15)

# STEP 1: Open staff login page
driver.get("http://localhost:5500/staff-login.html")

# STEP 2: Login as staff
wait.until(EC.presence_of_element_located((By.ID, "staffId")))
driver.find_element(By.ID, "staffId").send_keys("staffuser@gmail.com")  # staff ID
driver.find_element(By.ID, "password").send_keys("1234")       # staff password
driver.find_element(By.TAG_NAME, "button").click()

time.sleep(3)
print("Staff login successful")

# STEP 3: Go to staff orders page
driver.get("http://localhost:5500/staff-orders.html")

# STEP 4: Wait for at least one order card
order_card = wait.until(
    EC.presence_of_element_located((By.CLASS_NAME, "card"))
)

# STEP 5: Find the status dropdown inside first order
status_dropdown = order_card.find_element(By.TAG_NAME, "select")
select = Select(status_dropdown)

# STEP 6: Change status to PREPARING
select.select_by_value("preparing")
time.sleep(3)

print("Order status changed from PENDING to PREPARING")

# END TEST
driver.quit()
