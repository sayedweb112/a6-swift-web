const BASE_URL = "https://fakestoreapi.com";

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let allProducts = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchCategories();
  loadProducts("all");
  updateCartCount();
});

async function fetchCategories() {
  try {
    const res = await fetch(`${BASE_URL}/products/categories`);
    const cats = await res.json();
    renderCategories(cats);
  } catch (err) { console.error(err); }
}

function renderCategories(cats) {
  const container = document.getElementById("category-filter");
  container.innerHTML = `<button class="btn btn-primary rounded-full" data-cat="all">All</button>`;
  
  cats.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline rounded-full";
    btn.dataset.cat = cat;
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    container.appendChild(btn);
  });

  container.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll("button").forEach(b => b.classList.remove("btn-primary", "btn-outline"));
      btn.classList.add("btn-primary");
      loadProducts(btn.dataset.cat);
    });
  });
}

async function loadProducts(category = "all") {
  document.getElementById("loading").classList.remove("hidden");
  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";

  try {
    let url = category === "all" ? `${BASE_URL}/products?limit=20` : `${BASE_URL}/products/category/${encodeURIComponent(category)}`;
    const res = await fetch(url);
    allProducts = await res.json();

    renderProducts(allProducts, "products-grid");

    // Trending: Top 4 by rating
    const sorted = [...allProducts].sort((a, b) => b.rating.rate - a.rating.rate);
    renderProducts(sorted.slice(0, 4), "trending-grid");
  } catch (err) {
    console.error(err);
  } finally {
    document.getElementById("loading").classList.add("hidden");
  }
}

function renderProducts(products, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "card bg-base-100 shadow-xl hover:shadow-2xl transition-all";
    card.innerHTML = `
      <figure class="px-4 pt-4">
        <img src="${p.image}" alt="${p.title}" class="rounded-xl h-64 w-full object-contain bg-white p-4" loading="lazy"/>
      </figure>
      <div class="card-body">
        <h2 class="card-title line-clamp-2">${p.title}</h2>
        <div class="badge badge-outline">${p.category}</div>
        <div class="flex items-center gap-2 mt-2">
          <div class="rating rating-sm">
            ${'<input type="radio" class="mask mask-star bg-orange-400" checked disabled />'.repeat(Math.round(p.rating.rate))}
            ${'<input type="radio" class="mask mask-star bg-gray-300" disabled />'.repeat(5 - Math.round(p.rating.rate))}
          </div>
          <span class="text-sm">(${p.rating.count})</span>
        </div>
        <p class="text-2xl font-bold text-primary mt-2">$${p.price.toFixed(2)}</p>
        <div class="card-actions justify-between mt-4">
          <button class="btn btn-outline btn-sm" onclick="showProductModal(${p.id})">Details</button>
          <button class="btn btn-primary btn-sm" onclick="addToCart(${p.id})">Add</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

async function showProductModal(id) {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  const p = await res.json();

  const modal = document.getElementById("product-modal");
  const body = document.getElementById("modal-body");
  body.innerHTML = `
    <div class="grid md:grid-cols-2 gap-8">
      <img src="${p.image}" alt="${p.title}" class="w-full h-96 object-contain bg-white rounded-xl p-8 border"/>
      <div>
        <h3 class="text-3xl font-bold">${p.title}</h3>
        <p class="text-4xl font-bold text-primary my-4">$${p.price.toFixed(2)}</p>
        <div class="badge badge-lg mb-4">${p.category}</div>
        <div class="rating mb-4">${'<input type="radio" class="mask mask-star bg-orange-400" checked disabled />'.repeat(Math.round(p.rating.rate))}</div>
        <p class="mb-6">${p.description}</p>
        <button class="btn btn-primary w-full" onclick="addToCart(${p.id}); document.getElementById('product-modal').close();">Add to Cart</button>
      </div>
    </div>
  `;
  modal.showModal();
}

function addToCart(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  const item = cart.find(i => i.id === id);
  if (item) item.quantity = (item.quantity || 1) + 1;
  else cart.push({ ...product, quantity: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  // Toast
  const toast = document.createElement("div");
  toast.className = "toast toast-top toast-end";
  toast.innerHTML = `<div class="alert alert-success"><span>Added: ${product.title.slice(0,30)}...</span></div>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function updateCartCount() {
  const count = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  document.getElementById("cart-count").textContent = count;
}