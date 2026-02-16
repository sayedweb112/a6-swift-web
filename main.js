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