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