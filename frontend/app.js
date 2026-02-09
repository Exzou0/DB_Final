const API = "http://localhost:5000/api";



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



function showCurrentUser() {
  const email = localStorage.getItem("userEmail");
  const role = localStorage.getItem("userRole");
  const el = document.getElementById("currentUser");

  if (el && email && role) {
    el.innerText = `Logged in as ${email} (${role})`;
  }
}



async function loadProducts() {
  const res = await fetch(`${API}/products`);
  const products = await res.json();
  const tbody = document.getElementById("products");
  if (!tbody) return;

  tbody.innerHTML = "";
  products.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="cursor: pointer" onclick="document.getElementById('revProductId').value='${p._id}'">
        <strong>${p.name}</strong><br>
        <small style="color: gray; font-size: 10px;">ID: ${p._id}</small>
      </td>
      <td>${p.price}</td>
      <td>
        <button class="buy-btn" onclick="buyProduct('${p._id}')">Buy</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function buyProduct(productId) {
  const token = getToken();
  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      products: [{
        product_id: productId,
        quantity: 1 
      }]
    })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Purchase failed");
    return;
  }

  alert("Success! Order created.");

  window.location.href = "orders.html";
}



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
    headers: { "Authorization": `Bearer ${getToken()}` }
  });

  if (!res.ok) return;
  const data = await res.json();
  const list = document.getElementById("adminReviews");
  if (!list) return;

  list.innerHTML = "";
data.forEach(r => {
  const li = document.createElement("li");
  
  const userName = r.user_id?.full_name || "Unknown User";
  const productName = r.product_id?.name || "Unknown Product";
  const rating = r.rating || "No rating";
  const comment = r.comment || "(No comment text)"; 

  li.innerHTML = `
    <strong>${userName}</strong> reviewed <strong>${productName}</strong><br>
    <span>Rating: ${rating}/5</span><br>
    <em>"${comment}"</em><br>
    <small style="color: #888">ID: ${r._id}</small>
    <button onclick="deleteReview('${r._id}')" style="padding: 2px 8px; margin-left: 10px; background: #ff3b30; font-size: 11px;">Delete</button>
  `;
  
  list.appendChild(li);
});
}



async function createCategory() {
  const name = document.getElementById("newCatName").value.trim();
  if (!name) return alert("Enter category name");

  const res = await fetch(`${API}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({ name })
  });

  if (res.ok) {
    alert("Category created");
    document.getElementById("newCatName").value = "";
    loadAdminCategories(); 
  } else {
    const data = await res.json();
    alert(data.message || "Error creating category");
  }
}

async function deleteReview(id) {
  if (!confirm("Are you sure you want to delete this review?")) return;

  const res = await fetch(`${API}/reviews/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  });

  if (res.ok) {
    alert("Review deleted");
    loadAdminReviews(); 
  } else {
    const data = await res.json();
    alert(data.message || "Delete failed");
  }
}

async function createProduct() {
  const name = document.getElementById("newProdName").value.trim();
  const price = Number(document.getElementById("newProdPrice").value);
  const category_id = document.getElementById("newProdCatId").value.trim();

  if (!name || !price || !category_id) return alert("Fill all fields");

  const res = await fetch(`${API}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({ name, price, category_id })
  });

  if (res.ok) {
    alert("Product created");
    document.getElementById("newProdName").value = "";
    document.getElementById("newProdPrice").value = "";
    document.getElementById("newProdCatId").value = "";
    loadAdminProducts();
    loadAdminProductRefs();
  } else {
    const data = await res.json();
    alert(data.message || "Error creating product");
  }
}



async function submitReview() {
  const product_id = document.getElementById("revProductId").value.trim();
  const rating = Number(document.getElementById("revRating").value);
  const comment = document.getElementById("revComment").value.trim();

  if (!product_id || !rating || !comment) {
    alert("Please fill all fields");
    return;
  }

  const res = await fetch(`${API}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({ product_id, rating, comment })
  });

  if (res.ok) {
    alert("Review added successfully!");
    document.getElementById("revProductId").value = "";
    document.getElementById("revRating").value = "";
    document.getElementById("revComment").value = "";
  } else {
    const data = await res.json();
    alert(data.message || "Failed to add review");
  }
}








async function loadOrders() {
  const role = localStorage.getItem("userRole");
  const token = getToken();
  
  if (!token) return;


  const endpoint = (role === "admin") ? `${API}/orders` : `${API}/orders/my`;

  try {
    const res = await fetch(endpoint, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
        const err = await res.json();
        console.error("Order load error:", err.message);
        return;
    }

    const orders = await res.json();
    const tbody = document.getElementById("orders");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (orders.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4'>No orders found.</td></tr>";
        return;
    }

    orders.forEach(o => {
      const tr = document.createElement("tr");
      
      const statusCell = (role === "admin") 
        ? `<select id="status-${o._id}" onchange="updateOrder('${o._id}')">
            <option value="Pending" ${o.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Completed" ${o.status === "Completed" ? "selected" : ""}>Completed</option>
            <option value="Cancelled" ${o.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
           </select>`
        : `<span>${o.status}</span>`;

      const actionCell = (role === "admin")
        ? `<button onclick="deleteOrder('${o._id}')">Delete</button>`
        : `<small>Contact support to cancel</small>`;

      tr.innerHTML = `
        <td>${new Date(o.createdAt).toLocaleString()}</td>
        <td>${statusCell}</td>
        <td>${o.total_price} $</td>
        <td>${actionCell}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Fetch failed:", error);
  }
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


document.addEventListener("DOMContentLoaded", () => {
    showCurrentUser();


    const role = localStorage.getItem("userRole");
    const adminControls = document.getElementById("admin-controls");
    
    const isAdminPage = document.querySelector(".admin-actions");
    const isOrdersPage = document.getElementById("orders");
    const isUserProductsPage = document.getElementById("products") && !isAdminPage;


    if (isAdminPage) {
        console.log("Admin page detected");
        protectAdminPage();
        loadAdminProducts();
        loadAdminCategories();
        loadAdminProductRefs();
        loadAdminReviews();
    } 
    

    if (isUserProductsPage) {
        console.log("User products page detected");
        loadProducts();
    }

    if (isOrdersPage) {
        console.log("Orders page detected");
        

        if (role === "admin" && adminControls) {
            adminControls.style.display = "block";
        }
        
        loadOrders();
    }
});


