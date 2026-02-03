const API = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function login() {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  const data = await res.json();
  localStorage.setItem("token", data.token);
  alert("Logged in");
}

async function loadProducts() {
  const res = await fetch(`${API}/products`);
  const products = await res.json();

  const list = document.getElementById("products");
  list.innerHTML = "";

  products.forEach(p => {
    const li = document.createElement("li");
    li.innerText = `${p.name} - ${p.price}`;
    list.appendChild(li);
  });
}

async function createOrder() {
  await fetch(`${API}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      products: [{
        product_id: productId.value,
        quantity: quantity.value
      }]
    })
  });

  alert("Order created");
}

async function addProduct() {
  await fetch(`${API}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      name: name.value,
      price: price.value,
      category_id: category.value
    })
  });

  alert("Product added");
}

if (document.getElementById("products")) {
  loadProducts();
}

async function updateProduct() {
  await fetch(`${API}/products/${updateId.value}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      price: updatePrice.value
    })
  });

  alert("Product updated");
}


async function deleteProduct() {
  await fetch(`${API}/products/${deleteId.value}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  });

  alert("Product deleted");
}

