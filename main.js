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