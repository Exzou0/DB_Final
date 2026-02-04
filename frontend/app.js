const API = "http://localhost:5000/api";

/* ============ AUTH HELPERS ============ */

function getToken() {
  return localStorage.getItem("token");
}

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* ============ LOGIN ============ */

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("message");

  msg.innerText = "";

  if (!email || !password) {
    msg.innerText = "Email and password are required";
    return;
  }

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    msg.innerText = data.message || "Login failed";
    return;
  }

  localStorage.setItem("token", data.token);

  const user = parseJwt(data.token);
  localStorage.setItem("userEmail", user.email);
  localStorage.setItem("userRole", user.role);

  if (user.role === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "products.html";
  }
}

async function register() {
  const full_name = document.getElementById("full_name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role")?.value || "user";
  const msg = document.getElementById("message");

  msg.innerText = "";

  if (!full_name || !email || !password) {
    msg.innerText = "Full name, email and password are required";
    return;
  }

  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name,
      email,
      password,
      role
    })
  });

  const data = await res.json();

  if (!res.ok) {
    msg.innerText = data.message || "Registration failed";
    return;
  }

  msg.innerText = "Registered successfully. You can login now.";
}


/* ============ PAGE PROTECTION ============ */

function protectAdminPage() {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const user = parseJwt(token);
  if (!user || user.role !== "admin") {
    alert("Admin access only");
    window.location.href = "products.html";
  }
}

/* ============ USER INFO ============ */

function showCurrentUser() {
  const email = localStorage.getItem("userEmail");
  const role = localStorage.getItem("userRole");
  const el = document.getElementById("currentUser");

  if (el && email && role) {
    el.innerText = `Logged in as ${email} (${role})`;
  }
}

/* ============ PRODUCTS (USER) ============ */

async function loadProducts() {
  const res = await fetch(`${API}/products`);
  const products = await res.json();

  const tbody = document.getElementById("products");
  tbody.innerHTML = "";

  products.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.price}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* ============ PRODUCTS (ADMIN) ============ */

async function loadAdminProducts() {
  const res = await fetch(`${API}/products`);
  const products = await res.json();

  const tbody = document.getElementById("products");
  if (!tbody) return;

  tbody.innerHTML = "";

  products.forEach(p => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${p.name}</td>
      <td>
        <input type="number" id="price-${p._id}" value="${p.price}">
      </td>
      <td>
        <button onclick="updateProduct('${p._id}')">Update</button>
        <button onclick="deleteProduct('${p._id}')">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}


async function updateProduct(id) {
  const price = Number(document.getElementById(`price-${id}`).value);

  const res = await fetch(`${API}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({ price })
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.message);
    return;
  }

  loadAdminProducts();
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  const res = await fetch(`${API}/products/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.message);
    return;
  }

  loadAdminProducts();
}

async function createOrder() {
  const productId = prompt("Enter product ID:");
  const quantity = prompt("Enter quantity:");

  if (!productId || !quantity) return;

  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      products: [{
        product_id: productId,
        quantity: Number(quantity)
      }]
    })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Order creation failed");
    return;
  }

  alert("Order created");
  loadOrders();
}


/* ================= ADMIN REFERENCES ================= */

async function loadAdminCategories() {
  const res = await fetch(`${API}/categories`);
  const data = await res.json();

  const list = document.getElementById("adminCategories");
  if (!list) return;

  list.innerHTML = "";

  data.forEach(c => {
    const li = document.createElement("li");
    li.innerText = `${c.name} → ${c._id}`;
    list.appendChild(li);
  });
}

async function loadAdminProductRefs() {
  const res = await fetch(`${API}/products`);
  const data = await res.json();

  const list = document.getElementById("adminProducts");
  if (!list) return;

  list.innerHTML = "";

  data.forEach(p => {
    const li = document.createElement("li");
    li.innerText = `${p.name} → ${p._id}`;
    list.appendChild(li);
  });
}


async function loadAdminReviews() {
  const res = await fetch(`${API}/reviews`, {
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  });

  const data = await res.json();

  const list = document.getElementById("adminReviews");
  if (!list) return;

  list.innerHTML = "";

  data.forEach(r => {
    const li = document.createElement("li");
    li.innerText = `User: ${r.user_id} | Product: ${r.product_id} → ${r._id}`;
    list.appendChild(li);
  });
}



/* ============ INIT ============ */

document.addEventListener("DOMContentLoaded", () => {
  showCurrentUser();

  if (window.location.pathname.includes("admin")) {
    protectAdminPage();
    loadAdminProducts();
  } else if (document.getElementById("products")) {
    loadProducts();
  }
});


/* ================= ORDERS ================= */

async function loadOrders() {
  const res = await fetch(`${API}/orders`, {
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  });

  const orders = await res.json();
  const tbody = document.getElementById("orders");
  tbody.innerHTML = "";

  orders.forEach(o => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${new Date(o.createdAt).toLocaleString()}</td>
      <td>
        <select id="status-${o._id}">
          <option value="Pending" ${o.status === "Pending" ? "selected" : ""}>Pending</option>
          <option value="Completed" ${o.status === "Completed" ? "selected" : ""}>Completed</option>
          <option value="Cancelled" ${o.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
        </select>
      </td>
      <td>${o.total_price}</td>
      <td>
        <button onclick="updateOrder('${o._id}')">Update</button>
        <button onclick="deleteOrder('${o._id}')">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

async function updateOrder(id) {
  const status = document.getElementById(`status-${id}`).value;

  const res = await fetch(`${API}/orders/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({ status })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Update failed");
    return;
  }

  alert("Order updated");
  loadOrders();
}

async function deleteOrder(id) {
  if (!confirm("Delete this order?")) return;

  const res = await fetch(`${API}/orders/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Delete failed");
    return;
  }

  alert("Order deleted");
  loadOrders();
}

async function loadOrdersPerUser() {
  const res = await fetch(`${API}/analytics/orders-per-user`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  const data = await res.json();
  document.getElementById("analyticsOutput").innerText =
    JSON.stringify(data, null, 2);
}

async function loadRevenue() {
  const res = await fetch(`${API}/analytics/total-revenue`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  const data = await res.json();
  document.getElementById("analyticsOutput").innerText =
    `Total Revenue: ${data.revenue}`;
}

async function loadTopProducts() {
  const res = await fetch(`${API}/analytics/top-products`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  const data = await res.json();
  document.getElementById("analyticsOutput").innerText =
    JSON.stringify(data, null, 2);
}


