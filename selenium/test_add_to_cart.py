from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.alert import Alert
from webdriver_manager.chrome import ChromeDriverManager
import time

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

# Step 1: Open menu page
driver.get("http://localhost:5500/menu.html")
time.sleep(3)

# Step 2: Click first "Add to Cart" button
driver.find_element(By.CLASS_NAME, "btn-add").click()
time.sleep(2)

# Step 3: Handle alert (accept)
try:
    alert = Alert(driver)
    print("Alert text:", alert.text)
    alert.accept()
except:
    print("No alert found")

time.sleep(2)

# Step 4: Go to cart page
driver.get("http://localhost:5500/cart.html")
time.sleep(3)

print("Add to cart test completed successfully")

# Step 5: End test
driver.quit()
