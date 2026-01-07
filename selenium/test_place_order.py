from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.alert import Alert
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
wait = WebDriverWait(driver, 15)

# STEP 1: Login
driver.get("http://localhost:5500/login.html")
wait.until(EC.presence_of_element_located((By.ID, "email")))

driver.find_element(By.ID, "email").send_keys("studentuser@gmail.com")
driver.find_element(By.ID, "password").send_keys("1234")
driver.find_element(By.TAG_NAME, "button").click()

print("Login successful")
time.sleep(2)
# STEP 2: Menu → Add to cart
driver.get("http://localhost:5500/menu.html")
wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "btn-add"))).click()

# Accept alert
alert = wait.until(EC.alert_is_present())
print("Alert:", alert.text)
alert.accept()
time.sleep(2)
# STEP 3: Go to cart
driver.get("http://localhost:5500/cart.html")
time.sleep(2)
# STEP 4: WAIT for Place Order button (JS rendered)
place_order_btn = wait.until(
    EC.element_to_be_clickable((By.ID, "placeOrderBtn"))
)
place_order_btn.click()
time.sleep(2)
# STEP 5: Accept order alert
alert = wait.until(EC.alert_is_present())
print("Order alert:", alert.text)
alert.accept()
time.sleep(2)
# STEP 6: Orders page
driver.get("http://localhost:5500/orders.html")
time.sleep(2)
print("Order placed and verified successfully")
driver.quit()
