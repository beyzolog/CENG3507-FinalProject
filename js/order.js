// order.js
import { populateCategoryTable, productCategories } from "./product.js";
import { checkStockLevels } from "./product.js";
// Sipariş verileri
export let orders = JSON.parse(localStorage.getItem("orders")) || [];
function getCategories(params) {
  let categories = JSON.parse(localStorage.getItem("categories"))
}
let categories = JSON.parse(localStorage.getItem("categories"))

// Sipariş ekleme 
document.getElementById("orderForm").addEventListener("submit", function (event) {
  event.preventDefault();

  // Formdan verileri alma
  const orderId = document.getElementById("orderId").value;
  const customerInfo = document.getElementById("customerInfo").value;
  const productCategory = document.getElementById("productCategory").value;
  const productCategories = ["Small", "Medium", "Large", "Extra Large", "Family Pack", "Bulk Pack", "Premium"];
const productCategoryDropdown = document.getElementById("productCategory");
productCategoryDropdown.innerHTML = productCategories
  .map(category => `<option value="${category}">${category}</option>`)
  .join('');


  const quantityOrdered = parseInt(document.getElementById("quantityOrdered").value);
  const prodCat = categories.filter((c) => c.name == productCategory)[0]
  const unitPrice = prodCat.pricePerKg;
  
  const orderStatus = document.getElementById("orderStatus").value;
  const orderDate = document.getElementById("orderDate").value;

  // OrderID (unique olmalı)
  if (orders.some((order) => order.orderId === orderId)) {
    alert("Order ID must be unique. Please use a different ID.");
    return;
  }

  // Toplam fiyat
  const totalPrice = quantityOrdered * unitPrice;
  console.log(totalPrice);
  
  // Yeni sipariş
  const newOrder = {
    orderId,
    customerInfo,
    productCategory,
    quantityOrdered,
    totalPrice,
    date: orderDate,
    orderStatus,
  };
  console.log(newOrder);
  
  
  const isOk = reduceStock(productCategory, quantityOrdered)
  console.log(isOk);
  
  if (isOk) {
    orders.push(newOrder);
    saveOrdersToLocalStorage();
    displayOrderHistory();

    
    document.getElementById("orderForm").reset();
  }
});

// Sipariş geçmişi için localStorage 
function saveOrdersToLocalStorage() {
  localStorage.setItem("orders", JSON.stringify(orders));
}

// Sipariş geçmişi
function displayOrderHistory(filteredOrders = orders) {
  const orderListElement = document.getElementById("orderHistoryList");
  orderListElement.innerHTML = ""; 
  filteredOrders.forEach((order) => {
    const row = document.createElement("tr");
    console.log(order);
    
    row.innerHTML = `
      <td>${order.orderId}</td>
      <td>${order.customerInfo}</td>
      <td>${order.productCategory}</td>
      <td>${order.quantityOrdered}</td>
      <td>${order.totalPrice.toFixed(2)}</td>
      <td>${order.date}</td>
      <td>${order.orderStatus}</td>
      <td>
        <button data-order-id="${order.orderId}">Update Status</button>
      </td>
    `;

    orderListElement.appendChild(row);
  });
  displayRevenueTable(filteredOrders)
}
function displayRevenueTable(filteredOrders) {
  const revenueList = filteredOrders.reduce((acc, order) => {
    acc[order.productCategory] = (acc[order.productCategory] || 0) + order.totalPrice;
    return acc;
  }, {});
  
  const orderListElement = document.getElementById("orderRevenueList");
  orderListElement.innerHTML = ""; 

  Object.entries(revenueList).forEach((rev) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${rev[0]}</td>
      <td>${rev[1]}</td>
    `;

    orderListElement.appendChild(row);
  });
}

// Sipariş durumu güncelle
function updateOrderStatus(orderId) {
  const order = orders.find((order) => order.orderId === orderId);
  if (order) {
    const newStatus = prompt(
      "Enter new order status (Pending, Processed, Shipped, Delivered):",
      order.orderStatus
    );
    if (newStatus) {
      order.orderStatus = newStatus;
      saveOrdersToLocalStorage(); // Güncelleme
      displayOrderHistory(); //  geçmişi güncelle
    }
  }
}
// güncellemek için event listener
document.getElementById("orderHistoryList").addEventListener("click", function (event) {
  // Eğer tıklanan öğe bir 'Update Status' butonuysa
  if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "Update Status") {
    const orderId = event.target.getAttribute("data-order-id"); // Butonun data-attribute'inden sipariş ID'sini al
    updateOrderStatus(orderId); // Siparişin durumunu güncelle
  }
});

//  filtreleme
document.getElementById("searchOrder").addEventListener("input", function () {
  const searchQuery = this.value.toLowerCase();

  const filteredOrders = orders.filter((order) => {
    return (
      order.customerInfo.toLowerCase().includes(searchQuery) ||
      order.orderStatus.toLowerCase().includes(searchQuery)
    );
  });

  displayOrderHistory(filteredOrders);
});

// sipariş geçmişini gösterme
window.addEventListener("load", () => {
  displayOrderHistory();
});

// Ürünü kategoriden azaltma
function reduceStock(weight, quantity) {
  let categories = JSON.parse(localStorage.getItem("categories"))
  
  // Miktarı kontrol et
  if (quantity <= 0) {
    alert("Quantity must be greater than 0.");
    return; 
  }

  const category = categories.find(cat => cat.name === weight || cat.weight === "Custom");

  if (category) {
    // Yeterli stok kontrolü
    if (category.stockLevel < quantity) {
      alert(`${category.name} category does not have enough stock!`);
      return false;
    }

    // azaltma işlemi
    category.stockLevel -= quantity;
    category.stockHistory.push({ date: new Date(), change: quantity, newStock: category.stockLevel });
    checkStockLevels(category);  // Stok seviyeleri
    localStorage.setItem("categories", JSON.stringify(categories)); 
    populateCategoryTable(); // Tabloyu güncelleme

    // Fiyat hesabı
    const totalPrice = (weight / 1000) * category.pricePerKg * quantity;

  } else {
    alert("No suitable category found for this weight.");
    return false;
  }
  return true;
}
