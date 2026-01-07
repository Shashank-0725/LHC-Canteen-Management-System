const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : window.location.origin;

/* ================= NAVIGATION ================= */
function openNav() {
  document.getElementById('sideNav').classList.add('open');
  document.getElementById('overlay').classList.add('active');
}
function closeNav() {
  document.getElementById('sideNav').classList.remove('open');
  document.getElementById('overlay').classList.remove('active');
}

/* ================= AUTH HELPERS ================= */
function getToken() {
  return localStorage.getItem('token');
}
function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
}
function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}
function logout() {
  if (confirm('ARE YOU SURE YOU WANT TO LOGOUT?')) {
    localStorage.clear();
    window.location.href = 'login.html';
  }
}

/* ================= CART HELPERS ================= */
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}
function clearCart() {
  localStorage.removeItem('cart');
}

/* ================= MENU ================= */
function showCategory(category) {
  document.querySelectorAll('.menu-category').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
  document.getElementById(category).classList.add('active');
  event.target.classList.add('active');
}

async function loadMenuCategory(category) {
  const res = await fetch(`${API_BASE}/api/menu?category=${category}`);
  const data = await res.json();

  const container = document.querySelector(`#${category} .grid`);
  container.innerHTML = '';

  data.items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.imageUrl || 'https://via.placeholder.com/400x200'}">
      <div class="card-body">
        <h3>${item.name}</h3>
        <div class="price-row">
          <span class="price">₹${item.price}</span>
          <span class="stock-status ${item.inStock ? 'in-stock' : 'out-stock'}">
            ${item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
          </span>
        </div>
        <button class="btn btn-add" ${item.inStock ? '' : 'disabled'}
          onclick="addToCart('${item._id}','${item.name}',${item.price},'${item.imageUrl || ''}')">
          ADD TO CART
        </button>
      </div>`;
    container.appendChild(card);
  });
}

function initMenuPage() {
  ['snacks', 'meals', 'beverages', 'sweets'].forEach(loadMenuCategory);
}

/* ================= CART ACTIONS ================= */
function addToCart(id, name, price, imageUrl) {
  const cart = getCart();
  const item = cart.find(i => i.menuItemId === id);

  if (item) {
    item.quantity++;
  } else {
    cart.push({
      menuItemId: id,
      name,
      price,
      imageUrl,
      quantity: 1
    });
  }

  saveCart(cart);
  showToast('Added to Cart', `${name} has been added.`, 'success');
}


function renderCart() {
  const cart = getCart();
  const list = document.getElementById('orders-list');
  const empty = document.getElementById('orders-empty');
  list.innerHTML = '';

  if (cart.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  let total = 0;
  cart.forEach(i => {
    total += i.price * i.quantity;
    const card = document.createElement('div');
    card.className = 'card';
    // const img = i.imageUrl?.startsWith("/")
    // ? i.imageUrl
    // : "/" + i.imageUrl;
    card.innerHTML = `
  

      <div class="card-body">
        <h3>${i.name}</h3>
        <p class="price">₹${i.price}</p>

        <div style="display:flex; align-items:center; gap:10px; margin:10px 0;">
          <button onclick="changeQty('${i.menuItemId}',-1)">−</button>
          <strong>${i.quantity}</strong>
          <button onclick="changeQty('${i.menuItemId}',1)">+</button>
        </div>

        <p><strong>Subtotal:</strong> ₹${i.price * i.quantity}</p>

        <button class="btn btn-add" style="background:#c0392b; margin-top:8px;"
          onclick="removeFromCart('${i.menuItemId}')">
          REMOVE
        </button>
      </div>
    `;

    list.appendChild(card);
  });

  const totalBox = document.createElement('div');
  totalBox.innerHTML = `
    <h3 style="text-align:center;margin-top:20px;">TOTAL: ₹${total}</h3>
    <div style="text-align:center">
      <button id="placeOrderBtn" class="btn btn-add" onclick="checkoutCart()">CHECKOUT</button>
    </div>`;
  list.appendChild(totalBox);
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.menuItemId === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) removeFromCart(id);
  else saveCart(cart);
  renderCart();
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.menuItemId !== id));
  renderCart();
}

async function checkoutCart() {
  const token = getToken();
  if (!token) return alert('Login required');

  const cart = getCart();
  const items = cart.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity }));

  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({ items })
  });

  const data = await res.json();
  if (!res.ok) return alert(data.message || 'Order failed');

  clearCart();
  alert('Order placed successfully');
  renderCart();
}

/* ================= ORDERS ================= */
function initCartPage() {
  renderCart();
}

function initOrdersPage() {
  loadMyOrders();
}


/* ================= EXPORT ================= */
window.openNav = openNav;
window.closeNav = closeNav;
window.logout = logout;
window.showCategory = showCategory;
window.initMenuPage = initMenuPage;
window.initOrdersPage = initOrdersPage;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.checkoutCart = checkoutCart;


async function loadMyOrders() {
  const token = getToken();
  if (!token) {
    alert('PLEASE LOGIN FIRST');
    window.location.href = 'login.html';
    return;
  }

  const res = await fetch(`${API_BASE}/api/orders/my`, {
    headers: { Authorization: 'Bearer ' + token }
  });

  const data = await res.json();
  const list = document.getElementById('orders-list');
  const empty = document.getElementById('orders-empty');

  list.innerHTML = '';

  if (!data.orders || data.orders.length === 0) {
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  data.orders.forEach((order) => {
    const card = document.createElement('div');
    card.className = 'card';

    const itemsHtml = order.items
      .map(
        (it) =>
          `<li>${it.name} × ${it.quantity} — ₹${it.subtotal}</li>`
      )
      .join('');

    card.innerHTML = `
    <div class="card-body">
      <h3>ORDER #${order._id.slice(-6).toUpperCase()}</h3>
      <p><strong>Status:</strong> <span class="badge badge-${order.status.toLowerCase()}">${order.status.toUpperCase()}</span></p>
      <p><strong>Payment:</strong> ${order.paymentStatus.toUpperCase()}</p>
      <p><strong>Total:</strong> ₹${order.totalAmount}</p>

      ${order.note ? `<div style="background:#fff3cd; color:#856404; padding:8px; border:1px solid #ffeeba; border-radius:4px; font-size:13px; margin:10px 0; font-weight:600;">📝 Your Note: ${order.note}</div>` : ''}

      <ul style="margin-top:10px; padding-left:18px; font-size:14px;">
        ${itemsHtml}
      </ul>
    </div>
  `;

    list.appendChild(card);

  });

}

// [Deleted old loadStaffOrdersGrouped duplicate]

async function updateStatus(orderId, status) {
  const token = getToken();
  if (!token) return;

  const res = await fetch(`${API_BASE}/api/orders/staff/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({ status })
  });

  if (res.ok) {
    showToast('Status Updated', `Order marked as ${status}`, 'success');
    // Refresh logic
    if (document.getElementById('staff-orders-pending')) {
      loadStaffOrdersFull();
    } else {
      loadStaffOrdersGrouped();
    }
  } else {
    showToast('Error', 'Failed to update status', 'error');
  }
}
window.updateStatus = updateStatus;

async function loadAllMenuItemsForStaff() {
  const token = getToken();
  if (!token) return;

  const res = await fetch(`${API_BASE}/api/menu`, {
    headers: { Authorization: 'Bearer ' + token }
  });

  const data = await res.json();

  const list = document.getElementById('items-list');
  const empty = document.getElementById('items-empty');

  if (!list || !empty) return;

  list.innerHTML = '';

  if (!data.items || data.items.length === 0) {
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  data.items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
  <img src="${item.imageUrl || 'https://via.placeholder.com/400x200'}"
       style="width:100%; height:180px; object-fit:cover;">

  <div class="card-body">
    <h3>${item.name}</h3>
    <p>₹${item.price}</p>

    <p>
      Status:
      <span class="badge ${item.inStock ? 'badge-ready' : 'badge-cancelled'}">
        ${item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
      </span>
    </p>

    <button class="btn btn-add"
      style="margin-top:8px;"
      onclick="toggleStock('${item._id}', ${!item.inStock})">
      ${item.inStock ? 'MARK OUT OF STOCK' : 'MARK IN STOCK'}
    </button>
    
    <button class="btn btn-delete"
      onclick="deleteMenuItem('${item._id}')">
      DELETE ITEM
    </button>
  </div>
`;


    list.appendChild(card);
  });
}

window.loadMyOrders = loadMyOrders;
window.initCartPage = initCartPage;
window.initOrdersPage = initOrdersPage;

async function toggleStock(itemId, newStatus) {
  const token = getToken();
  if (!token) return;

  const res = await fetch(`${API_BASE}/api/menu/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({ inStock: newStatus })
  });

  if (!res.ok) {
    showToast('Error', 'Failed to update stock status', 'error');
    return;
  }

  loadAllMenuItemsForStaff(); // refresh list
  showToast('Success', 'Stock status updated', 'success');
}
window.toggleStock = toggleStock;

async function deleteMenuItem(itemId) {
  if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) return;

  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/menu/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    });

    if (!res.ok) {
      const data = await res.json();
      showToast('Error', data.message || 'Failed to delete item', 'error');
      return;
    }

    showToast('Deleted', 'Item deleted successfully', 'success');
    loadAllMenuItemsForStaff();
  } catch (err) {
    console.error(err);
    showToast('Error', 'Network error', 'error');
  }
}
window.deleteMenuItem = deleteMenuItem;

async function handleAddItem(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData();

  formData.append('name', document.getElementById('itemName').value);
  formData.append('category', document.getElementById('itemCategory').value);
  formData.append('price', document.getElementById('itemPrice').value);
  formData.append('inStock', document.getElementById('itemStock').value === 'true');
  formData.append('avgTime', document.getElementById('itemAvgTime').value);

  const imageFile = document.getElementById('itemImage').files[0];
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const token = getToken();

  const res = await fetch(`${API_BASE}/api/menu`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token
    },
    body: formData
  });

  if (res.ok) {
    alert('Item added');
    form.reset();
    loadAllMenuItemsForStaff();
  } else {
    const data = await res.json();
    alert('Failed to add item: ' + (data.message || 'Unknown error'));
  }
  return false;
}
window.handleAddItem = handleAddItem;



/* ================= ORDER HELPERS ================= */

// [Removed duplicate handleAddItem]

async function loadMenuCategory(category) {
  const res = await fetch(`${API_BASE}/api/menu?category=${category}`);
  const data = await res.json();

  const container = document.querySelector(`#${category} .grid`);
  container.innerHTML = '';

  data.items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.imageUrl || 'https://via.placeholder.com/400x200'}">
      <div class="card-body">
        <h3>${item.name}</h3>
        <p style="font-size:12px; color:#666; margin-bottom:5px;">⏳ ${item.avgTime || '10-15 mins'}</p>
        <div class="price-row">
          <span class="price">₹${item.price}</span>
          <span class="stock-status ${item.inStock ? 'in-stock' : 'out-stock'}">
            ${item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
          </span>
        </div>
        <button class="btn btn-add" ${item.inStock ? '' : 'disabled'}
          onclick="addToCart('${item._id}','${item.name}',${item.price},'${item.imageUrl || ''}')">
          ADD TO CART
        </button>
      </div>`;
    container.appendChild(card);
  });
}


function renderCart() {
  const cart = getCart();
  const list = document.getElementById('orders-list');
  const empty = document.getElementById('orders-empty');
  list.innerHTML = '';

  if (cart.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  let total = 0;
  cart.forEach(i => {
    total += i.price * i.quantity;
    const card = document.createElement('div');
    card.className = 'card';
    card.style.display = 'flex';
    card.style.flexDirection = 'row';
    card.style.alignItems = 'center';
    card.style.padding = '10px';
    card.style.gap = '15px';


    card.innerHTML = `
      <div style="flex:1;">
        <h3 style="margin:0; font-size:16px;">${i.name}</h3>
        <p class="price" style="margin:5px 0;">₹${i.price}</p>
        <div style="display:flex; align-items:center; gap:10px;">
          <button onclick="changeQty('${i.menuItemId}',-1)" style="padding:2px 8px;">−</button>
          <strong>${i.quantity}</strong>
          <button onclick="changeQty('${i.menuItemId}',1)" style="padding:2px 8px;">+</button>
        </div>
      </div>
      <div>
         <p style="font-weight:bold;">₹${i.price * i.quantity}</p>
         <button onclick="removeFromCart('${i.menuItemId}')" style="background:none; border:none; color:red; cursor:pointer; font-size:12px;">REMOVE</button>
      </div>
    `;

    list.appendChild(card);
  });

  // Note Input
  const noteBox = document.createElement('div');
  noteBox.style.marginTop = '20px';
  noteBox.innerHTML = `
        <label style="font-size:14px; font-weight:600; display:block; margin-bottom:5px;">Order Note (Optional):</label>
        <textarea id="orderNote" placeholder="e.g. I will be 10 mins late" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ccc;"></textarea>
    `;
  list.appendChild(noteBox);

  const totalBox = document.createElement('div');
  totalBox.innerHTML = `
    <h3 style="text-align:center;margin-top:20px;">TOTAL: ₹${total}</h3>
    <div style="text-align:center">
      <button id="placeOrderBtn" class="btn btn-add" onclick="checkoutCart()">CHECKOUT</button>
    </div>`;
  list.appendChild(totalBox);
}

async function checkoutCart() {
  const token = getToken();
  if (!token) return alert('Login required');

  const cart = getCart();
  const note = document.getElementById('orderNote') ? document.getElementById('orderNote').value : '';
  console.log("Checkout Note:", note); // DEBUG

  const items = cart.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity }));

  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({ items, note })
  });

  const data = await res.json();
  if (!res.ok) return alert(data.message || 'Order failed');

  clearCart();
  alert('Order placed successfully');
  renderCart(); // clear view
  loadMyOrders(); // refresh history if on same page
}

async function loadStaffOrdersGrouped() {
  const token = getToken();
  if (!token) return;

  // FIX: Correct Endpoint
  const res = await fetch(`${API_BASE}/api/orders/staff`, {
    headers: { Authorization: 'Bearer ' + token }
  });

  const data = await res.json();
  if (!data.orders) return;

  const list = document.getElementById('orders-list');
  if (!list) return;
  list.innerHTML = '';

  // Split: ACTIVE (pending/preparing) vs COMPLETED (ready/completed/cancelled)
  const active = data.orders.filter(o => ['pending', 'preparing'].includes(o.status));
  const history = data.orders.filter(o => ['ready', 'completed', 'cancelled'].includes(o.status));

  function renderGroup(title, orders) {
    const h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.style.fontSize = '18px';
    h2.innerText = title + ` (${orders.length})`;
    list.appendChild(h2);

    if (orders.length === 0) {
      const p = document.createElement('p');
      p.className = 'text-center';
      p.innerText = 'No orders.';
      list.appendChild(p);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'grid';

    orders.forEach(order => {
      console.log("Rendering Order:", order._id, "Note:", order.note); // DEBUG
      const card = document.createElement('div');
      card.className = 'card';

      const itemsHtml = order.items
        .map(i => `<li>${i.name} x ${i.quantity}</li>`)
        .join('');

      // Allowed transitions for dropdown (Dashboard view)
      const allowedTransitions = {
        pending: ['preparing', 'ready', 'cancelled'],
        preparing: ['ready', 'cancelled'],
        ready: ['completed']
      };

      const isFinal = ['completed', 'cancelled'].includes(order.status);
      const nextOptions = (allowedTransitions[order.status] || [])
        .map(s => `<option value="${s}">${s.toUpperCase()}</option>`)
        .join('');

      card.innerHTML = `
          <div class="card-body">
            <h3>ORDER #${order._id.slice(-4).toUpperCase()}</h3>
            <p><strong>User:</strong> ${order.user?.name || 'Unknown'}</p>
            ${order.user?.mobile ? `<p><strong>Mobile:</strong> <a href="tel:${order.user.mobile}" style="color: var(--secondary-color);">${order.user.mobile}</a></p>` : ''}
            <p><strong>Status:</strong> <span class="badge badge-${order.status.toLowerCase()}">${order.status.toUpperCase()}</span></p>
            
            <ul style="padding-left:0; list-style:none; margin:10px 0;">${itemsHtml}</ul>
            
            ${order.note ? `<div style="background:#fff3cd; color:#856404; padding:8px; border:1px solid #ffeeba; border-radius:4px; font-size:13px; margin-bottom:10px; font-weight:600;">📝 Note: ${order.note}</div>` : ''}

            <p><strong>Total:</strong> ₹${order.totalAmount}</p>

             ${isFinal
          ? `<p style="color:#888;font-size:13px;">STATUS LOCKED</p>`
          : `
                <select onchange="updateStatus('${order._id}', this.value)" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ddd;">
                  <option disabled selected>UPDATE STATUS</option>
                  ${nextOptions}
                </select>
              `
        }
          </div>
        `;
      grid.appendChild(card);
    });
    list.appendChild(grid);
  }

  renderGroup('ACTIVE ORDERS', active);
  list.appendChild(document.createElement('hr'));
  renderGroup('PAST ORDERS', history);
}

/* ================= AUTH ACTIONS ================= */

// STUDENT LOGIN
async function handleLogin(event) {
  event.preventDefault();

  const emailOrId = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorBox = document.getElementById('errorMsg');

  errorBox.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrId, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorBox.textContent = data.message || 'Invalid credentials';
      errorBox.style.display = 'block';
      return false;
    }

    saveAuth(data.token, data.user);

    window.location.href =
      data.user.role === 'staff' || data.user.role === 'admin'
        ? 'staff-dashboard.html'
        : 'index.html';

  } catch (err) {
    errorBox.textContent = 'Network error';
    errorBox.style.display = 'block';
  }

  return false;
}


// STUDENT REGISTER
async function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const usnOrStaffId = document.getElementById('usn').value.trim();
  const email = document.getElementById('email').value.trim();
  const mobile = document.getElementById('mobile').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const errorBox = document.getElementById('errorMsg');

  errorBox.style.display = 'none';

  if (password !== confirmPassword) {
    errorBox.textContent = "Passwords don't match";
    errorBox.style.display = 'block';
    return false;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, usnOrStaffId, email, mobile, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorBox.textContent = data.message || 'Registration failed';
      errorBox.style.display = 'block';
      return false;
    }

    saveAuth(data.token, data.user);
    window.location.href = 'index.html';

  } catch (err) {
    errorBox.textContent = 'Network error';
    errorBox.style.display = 'block';
  }

  return false;
}


// STAFF LOGIN
async function handleStaffLogin(event) {
  event.preventDefault();

  const emailOrId = document.getElementById('staffId').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorBox = document.getElementById('errorMsg');

  errorBox.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrId, password })
    });

    const data = await res.json();

    if (
      !res.ok ||
      (data.user.role !== 'staff' && data.user.role !== 'admin')
    ) {
      errorBox.textContent = 'Invalid staff credentials';
      errorBox.style.display = 'block';
      return false;
    }

    saveAuth(data.token, data.user);
    window.location.href = 'staff-dashboard.html';

  } catch (err) {
    errorBox.textContent = 'Network error';
    errorBox.style.display = 'block';
  }

  return false;
}
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleStaffLogin = handleStaffLogin;



function initStaffDashboard() {
  loadStaffOrdersGrouped();
  loadAllMenuItemsForStaff();
}
window.initStaffDashboard = initStaffDashboard;

function initManageItemsPage() {
  loadAllMenuItemsForStaff();
}
window.initManageItemsPage = initManageItemsPage;

function initStaffOrdersPage() {
  loadStaffOrdersGrouped();
}
window.initStaffOrdersPage = initStaffOrdersPage;


// adding items by staff
// [Deleted old handleAddItem duplicate]

//stats

async function initStatsPage() {
  const token = getToken();
  if (!token) return;

  const headers = { Authorization: 'Bearer ' + token };

  // Summary
  const s = await fetch(`${API_BASE}/api/stats/summary`, { headers }).then(r => r.json());
  document.getElementById('todayRevenue').innerText = '₹' + s.todayRevenue;
  document.getElementById('todayOrders').innerText = s.todayOrders;
  document.getElementById('monthlyRevenue').innerText = '₹' + s.monthlyRevenue;
  document.getElementById('totalItems').innerText = s.totalItems;

  // Top items
  const top = await fetch(`${API_BASE}/api/stats/top-items`, { headers }).then(r => r.json());
  new Chart(document.getElementById('topItemsChart'), {
    type: 'bar',
    data: {
      labels: top.data.map(i => i._id),
      datasets: [{
        label: 'Orders',
        data: top.data.map(i => i.totalQty)
      }]
    }
  });

  // Weekly revenue
  const week = await fetch(`${API_BASE}/api/stats/weekly-revenue`, { headers }).then(r => r.json());
  new Chart(document.getElementById('weeklyRevenueChart'), {
    type: 'line',
    data: {
      labels: week.data.map(d => d._id),
      datasets: [{
        label: 'Revenue',
        data: week.data.map(d => d.revenue)
      }]
    }
  });
}

//profile

async function initProfilePage() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const res = await fetch(`${API_BASE}/api/users/me`, {
    headers: { Authorization: 'Bearer ' + token }
  });

  if (!res.ok) {
    alert('Session expired. Please login again.');
    logout();
    return;
  }

  const data = await res.json();
  const u = data.user;

  // ✅ PREFILL ALL FIELDS
  document.getElementById('profileName').value = u.name || '';
  document.getElementById('profileEmail').value = u.email || '';
  document.getElementById('profileMobile').value = u.mobile || '';
  document.getElementById('profileId').value = u.usnOrStaffId || '';
  document.getElementById('profileRole').value = (u.role || '').toUpperCase();
}

async function updateProfile(event) {
  event.preventDefault();

  const token = getToken();
  const body = {
    name: profileName.value,
    email: profileEmail.value,
    mobile: profileMobile.value
  };

  await fetch(`${API_BASE}/api/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify(body)
  });

  alert('Profile updated');
  return false;
}

async function changePassword(event) {
  event.preventDefault();

  const token = getToken();

  const res = await fetch(`${API_BASE}/api/users/me/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    })
  });

  if (!res.ok) {
    alert('Incorrect current password');
    return false;
  }

  alert('Password changed successfully. Please login again.');

  // ✅ FORCE LOGOUT AFTER PASSWORD CHANGE
  localStorage.removeItem('token');
  window.location.href = 'login.html';

  return false;
}


window.initProfilePage = initProfilePage;
window.updateProfile = updateProfile;
window.changePassword = changePassword;


/* ============================================
   REAL-TIME ALERTS (POLLING)
   ============================================ */

// Simple "Ding" sound
const ALERT_SOUND = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
const NOTIFICATION_SOUND = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

function playAlertSound() {
  NOTIFICATION_SOUND.play().catch(e => console.log("Audio play blocked:", e));
}

// TOAST UI
function showToast(title, message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div>
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);
  playAlertSound();

  // Auto remove
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
window.showToast = showToast;


// --- STAFF POLLING (New Orders) ---
let lastStaffOrderIds = new Set();
let isFirstStaffLoad = true;
let staffPollInterval = null;

async function startStaffPolling() {
  if (staffPollInterval) clearInterval(staffPollInterval);

  // Initial Fetch
  // If we are on dashboard -> loadStaffOrdersGrouped
  // If we are on orders page -> loadStaffOrdersFull
  if (document.getElementById('orders-list')) {
    await loadStaffOrdersGrouped();
  } else if (document.getElementById('staff-orders-pending')) {
    await loadStaffOrdersFull();
  } else {
    await checkStaffOrders(true); // just background check
  }

  // Poll every 10 seconds
  staffPollInterval = setInterval(async () => {
    // Background check for toasts
    await checkStaffOrders(false);

    // Also refresh UI
    if (document.getElementById('orders-list')) {
      loadStaffOrdersGrouped();
    } else if (document.getElementById('staff-orders-pending')) {
      loadStaffOrdersFull();
    }
  }, 10000);
}

async function loadStaffOrdersFull() {
  const token = getToken();
  if (!token) return;

  try {
    console.log("Fetching staff orders...");
    const res = await fetch(`${API_BASE}/api/orders/staff`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();
    console.log("Staff orders data:", data);

    const orders = data.orders;
    if (!orders) {
      console.error("No orders array in data");
      return;
    }

    // Buckets
    const buckets = {
      pending: document.getElementById('staff-orders-pending'),
      ready: document.getElementById('staff-orders-ready'),
      completed: document.getElementById('staff-orders-completed'),
      cancelled: document.getElementById('staff-orders-cancelled')
    };

    const empties = {
      pending: document.getElementById('staff-orders-pending-empty'),
      ready: document.getElementById('staff-orders-ready-empty'),
      completed: document.getElementById('staff-orders-completed-empty'),
      cancelled: document.getElementById('staff-orders-cancelled-empty')
    };

    // Track which orders we've seen in this update
    const seenOrderIds = new Set();
    let counts = { pending: 0, preparing: 0, ready: 0, completed: 0, cancelled: 0 };

    orders.forEach(order => {
      seenOrderIds.add(order._id);
      console.log(`Full View Order ${order._id} Note: "${order.note}"`);

      // Determine target bucket
      let targetBucket = null;
      if (order.status === 'pending' || order.status === 'preparing') {
        targetBucket = 'pending';
        counts.pending++;
      } else if (order.status === 'ready') {
        targetBucket = 'ready';
        counts.ready++;
      } else if (order.status === 'completed') {
        targetBucket = 'completed';
        counts.completed++;
      } else if (order.status === 'cancelled') {
        targetBucket = 'cancelled';
        counts.cancelled++;
      }

      if (!targetBucket || !buckets[targetBucket]) return;

      // Check if card already exists
      const cardId = `order-card-${order._id}`;
      let existingCard = document.getElementById(cardId);

      const cardHTML = `
        <div class="card-body">
          <div style="display:flex; justify-content:space-between;">
            <h3> Order #${order._id.slice(-4).toUpperCase()} </h3>
            <span class="badge badge-${order.status.toLowerCase()}">${order.status.toUpperCase()}</span>
          </div>
          <p><strong>User:</strong> ${order.user?.name || 'Unknown'}</p>
          ${order.user?.mobile ? `<p><strong>Mobile:</strong> <a href="tel:${order.user.mobile}" style="color: var(--secondary-color);">${order.user.mobile}</a></p>` : ''}
           ${order.note ? `<div style="background:#fff3cd; color:#856404; padding:8px; border:1px solid #ffeeba; border-radius:4px; font-size:13px; margin:5px 0; font-weight:600;">📝 Note: ${order.note}</div>` : ''}
          <ul style="font-size:13px; padding-left:20px; list-style:disc; margin:10px 0;">
            ${order.items.map(i => `<li>${i.name} x ${i.quantity}</li>`).join('')}
          </ul>
          <p><strong>Total:</strong> ₹${order.totalAmount}</p>
          
          <div style="margin-top:10px; display:flex; gap:5px; flex-wrap:wrap;">
            ${order.status === 'pending' ? `
              <button class="btn btn-add" onclick="updateStatus('${order._id}','preparing')">PREPARING</button>
              <button class="btn btn-delete" style="margin-top:0;" onclick="updateStatus('${order._id}','cancelled')">CANCEL</button>
            ` : ''}
            ${order.status === 'preparing' ? `
              <button class="btn btn-add" style="background:var(--success)" onclick="updateStatus('${order._id}','ready')">READY</button>
            ` : ''}
            ${order.status === 'ready' ? `
              <button class="btn btn-add" style="background:#333" onclick="updateStatus('${order._id}','completed')">COMPLETED</button>
            ` : ''}
          </div>
        </div>
      `;

      if (existingCard) {
        // Card exists - check if it's in the right bucket
        const currentParent = existingCard.parentElement;
        if (currentParent !== buckets[targetBucket]) {
          // Move to correct bucket
          buckets[targetBucket].appendChild(existingCard);
        }
        // Update content (in case status badge or note changed)
        existingCard.innerHTML = cardHTML;
      } else {
        // Create new card
        const card = document.createElement('div');
        card.id = cardId;
        card.className = 'card';
        card.innerHTML = cardHTML;
        buckets[targetBucket].appendChild(card);
      }
    });

    // Remove cards for orders that no longer exist
    Object.values(buckets).forEach(bucket => {
      if (!bucket) return;
      const cards = bucket.querySelectorAll('[id^="order-card-"]');
      cards.forEach(card => {
        const orderId = card.id.replace('order-card-', '');
        if (!seenOrderIds.has(orderId)) {
          card.remove();
        }
      });
    });

    // Update empty states
    Object.keys(empties).forEach(k => {
      if (empties[k]) empties[k].style.display = 'none';
    });

    if (counts.pending === 0 && counts.preparing === 0 && empties.pending) empties.pending.style.display = 'block';
    if (counts.ready === 0 && empties.ready) empties.ready.style.display = 'block';
    if (counts.completed === 0 && empties.completed) empties.completed.style.display = 'block';
    if (counts.cancelled === 0 && empties.cancelled) empties.cancelled.style.display = 'block';

  } catch (err) {
    console.error(err);
  }
}

function initStaffOrdersPage() {
  loadStaffOrdersFull();
  startStaffPolling();
}
window.initStaffOrdersPage = initStaffOrdersPage;


async function checkStaffOrders(silent = false) {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/orders/staff`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();
    if (!data.orders) return;

    const currentIds = new Set(data.orders.map(o => o._id));

    // Check for NEW IDs
    if (!silent && !isFirstStaffLoad) {
      let newCount = 0;
      currentIds.forEach(id => {
        if (!lastStaffOrderIds.has(id)) newCount++;
      });

      if (newCount > 0) {
        showToast('New Order!', `${newCount} new order(s) received.`, 'success');
        // Refresh the dashboard list if we are on that page
        if (typeof loadStaffOrdersGrouped === 'function') {
          loadStaffOrdersGrouped();
        }
      }
    }

    lastStaffOrderIds = currentIds;
    isFirstStaffLoad = false;
  } catch (err) {
    console.warn("Polling error:", err);
  }
}


// --- STUDENT POLLING (Status Change) ---
let lastOrderStatuses = {}; // { id: 'pending' }
let studentPollInterval = null;

async function startStudentPolling() {
  if (studentPollInterval) clearInterval(studentPollInterval);
  await checkMyOrders(true);
  studentPollInterval = setInterval(() => checkMyOrders(false), 10000);
}

async function checkMyOrders(silent = false) {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/orders/my`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();
    if (!data.orders) return;

    data.orders.forEach(order => {
      const prevStatus = lastOrderStatuses[order._id];
      const newStatus = order.status;

      if (!silent && prevStatus && prevStatus !== newStatus) {
        // Status changed!
        let msg = `Order #${order._id.slice(-4).toUpperCase()} is now ${newStatus.toUpperCase()}`;
        let type = 'info';

        if (newStatus === 'ready') type = 'success';
        if (newStatus === 'cancelled') type = 'error';

        showToast('Order Update', msg, type);

        // Refresh View if user is on orders page
        if (document.getElementById('orders-list')) {
          loadMyOrders();
        }
      }

      lastOrderStatuses[order._id] = newStatus;
    });

  } catch (err) {
    console.warn("Polling error:", err);
  }
}

// Hook into Init Functions
const originalInitStaffDashboard = window.initStaffDashboard;
window.initStaffDashboard = function () {
  if (originalInitStaffDashboard) originalInitStaffDashboard();
  startStaffPolling();
};

const originalInitOrdersPage = window.initOrdersPage;
window.initOrdersPage = function () {
  if (originalInitOrdersPage) originalInitOrdersPage();
  startStudentPolling();
};

function initGlobalPolling() {
  const user = getUser();
  if (user) {
    if (user.role === 'staff' || user.role === 'admin') {
      startStaffPolling();
    } else {
      startStudentPolling();
    }
  }
}
setTimeout(initGlobalPolling, 1500);
