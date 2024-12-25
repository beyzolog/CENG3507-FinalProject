// Satın alma kayıtlarının listesi
let purchases = JSON.parse(localStorage.getItem("purchases")) || [];

// Satın alma kaydı ekleme 
export function savePurchase(purchase) {
  if (purchases.some((p) => p.purchaseId === purchase.purchaseId)) {
    alert("Purchase ID must be unique.");
    return;
  }

  purchases.push(purchase);
  localStorage.setItem("purchases", JSON.stringify(purchases));
  renderPurchaseList();
}

// Satın alma kayıtlarını listelemek için
export function renderPurchaseList() {
  const purchaseList = document.getElementById("purchaseList");
  purchaseList.innerHTML = "";

  purchases.forEach((purchase) => {
    const tr = document.createElement("tr");

    const tdId = document.createElement("td");
    tdId.textContent = purchase.purchaseId;

    const tdFarmerId = document.createElement("td");
    tdFarmerId.textContent = purchase.farmerId;

    const tdDate = document.createElement("td");
    tdDate.textContent = purchase.date;

    const tdQuantity = document.createElement("td");
    tdQuantity.textContent = purchase.quantity;

    const tdPrice = document.createElement("td");
    tdPrice.textContent = purchase.pricePerKg;

    const tdTotalCost = document.createElement("td");
    tdTotalCost.textContent = (purchase.quantity * purchase.pricePerKg).toFixed(
      2
    );

    // Silme butonu
    const tdActions = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deletePurchase(purchase.purchaseId); // Silme işlemi

    tdActions.appendChild(deleteBtn);

    tr.appendChild(tdId);
    tr.appendChild(tdFarmerId);
    tr.appendChild(tdDate);
    tr.appendChild(tdQuantity);
    tr.appendChild(tdPrice);
    tr.appendChild(tdTotalCost);
    tr.appendChild(tdActions); // Actions sütunu için butonu ekle

    purchaseList.appendChild(tr);
  });
}

// Yeni satın alma kaydı dinleme
const purchaseForm = document.getElementById("purchaseForm");
purchaseForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const purchaseId = document.getElementById("purchaseId").value.trim();
  const farmerId = document.getElementById("farmerIdSelect").value.trim();
  const date = document.getElementById("purchaseDate").value.trim();
  const quantity = parseFloat(document.getElementById("quantity").value.trim());
  const pricePerKg = parseFloat(
    document.getElementById("pricePerKg").value.trim()
  );

  if (
    !purchaseId ||
    !farmerId ||
    !date ||
    isNaN(quantity) ||
    isNaN(pricePerKg)
  ) {
    alert("All fields are required and must be valid.");
    return;
  }
  if (quantity <= 0 || pricePerKg <= 0) {
    alert("Quantity and price must be greater than 0.");
    return;
  }

  const purchase = {
    purchaseId,
    farmerId,
    date,
    quantity,
    pricePerKg,
  };

  savePurchase(purchase);
  purchaseForm.reset();
});
// // Satın alma kaydını silme 
export function deletePurchase(purchaseId) {

  purchases = purchases.filter((p) => p.purchaseId !== purchaseId);
  localStorage.setItem("purchases", JSON.stringify(purchases));
  renderPurchaseList(); // Satın alma listesine güncelleme
  updateUncategorizedQuantityFromPurchases(); 
}

// Çiftçiye ait satın alma kayıtları silme
export function deletePurchasesByFarmerId(farmerId) {
  // purchases dizisindeki, çiftçinin farmerId'sine ait tüm kayıtları sil
  purchases = purchases.filter((p) => p.farmerId !== farmerId);
  localStorage.setItem("purchases", JSON.stringify(purchases));
  renderPurchaseList(); //listeye güncellemeleri uygula
}

// Belirli bir zaman aralığının özetini oluşturma
export function generatePurchaseSummary(
  farmerId = null,
  startDate = null,
  endDate = null
) {
  let filteredPurchases = purchases;

  if (farmerId) {
    filteredPurchases = filteredPurchases.filter(
      (p) => p.farmerId === farmerId
    );
  }

  if (startDate) {
    filteredPurchases = filteredPurchases.filter(
      (p) => new Date(p.date) >= new Date(startDate)
    );
  }

  if (endDate) {
    filteredPurchases = filteredPurchases.filter(
      (p) => new Date(p.date) <= new Date(endDate)
    );
  }

  const totalQuantity = filteredPurchases.reduce(
    (sum, p) => sum + p.quantity,
    0
  );
  const totalCost = filteredPurchases.reduce(
    (sum, p) => sum + p.quantity * p.pricePerKg,
    0
  );

  alert(
    `Summary:\nTotal Quantity: ${totalQuantity} kg\nTotal Cost: $${totalCost.toFixed(
      2
    )}`
  );
}

// sıralama işlevi
export function sortPurchases(byField) {
  purchases.sort((a, b) => {
    if (byField === "date") {
      return new Date(a.date) - new Date(b.date);
    } else if (byField === "amount") {
      return b.quantity * b.pricePerKg - a.quantity * a.pricePerKg;
    } else {
      return a[byField].localeCompare(b[byField]);
    }
  });
  renderPurchaseList();
}

document.getElementById("sortButton").addEventListener("click", () => {
  const sortOption = document.getElementById("sortOptions").value;
  import("./purchase.js").then((module) => module.sortPurchases(sortOption));
});

document
  .getElementById("generateSummaryButton")
  .addEventListener("click", () => {
    const farmerId = document.getElementById("summaryFarmerId").value.trim();
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    import("./purchase.js").then((module) =>
      module.generatePurchaseSummary(farmerId, startDate, endDate)
    );
  });

// satın alma listesini yükleme
window.addEventListener("load", renderPurchaseList);

// Toplam maliyeti (zaman dilimine göre)hesaplama fonksiyonu
export function calculateTotalExpenses(period = "daily") {
  let totalCost = 0;
  const now = new Date();

  purchases.forEach((purchase) => {
    const purchaseDate = new Date(purchase.date);
    let isInTimePeriod = false;

    // Zaman dilimi hesaplamaları
    if (period === "daily") {
      // Günlük hesaplama
      if (purchaseDate.toDateString() === now.toDateString()) {
        isInTimePeriod = true;
      }
    } else if (period === "weekly") {
      // (bu hafta)
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay())); // Haftanın ilk günü
      const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6)); // Haftanın son günü
      if (purchaseDate >= weekStart && purchaseDate <= weekEnd) {
        isInTimePeriod = true;
      }
    } else if (period === "monthly") {
      // (bu ay)
      if (
        purchaseDate.getMonth() === now.getMonth() &&
        purchaseDate.getFullYear() === now.getFullYear()
      ) {
        isInTimePeriod = true;
      }
    }

    // Zaman diliminde ise toplam maliyeti ekle
    if (isInTimePeriod) {
      totalCost += purchase.quantity * purchase.pricePerKg;
    }
  });

  return totalCost;
}

// Zaman dilimine göre gider raporu
export function generateExpenseReport() {
  const period = document.getElementById("expensePeriod").value; // Kullanıcıdan zaman dilimi seçimini al
  const totalExpense = calculateTotalExpenses(period);

  alert(
    `Total expense for the selected period (${period}): $${totalExpense.toFixed(
      2
    )}`
  );
}

// "Generate Expense Report" butonu
document
  .getElementById("generateExpenseReportButton")
  .addEventListener("click", generateExpenseReport);



  // Belirli bir zaman aralığına göre giderleri hesapla
export function calculateTotalExpensesByDate(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const filteredPurchases = purchases.filter((purchase) => {
    const purchaseDate = new Date(purchase.date);
    return purchaseDate >= start && purchaseDate <= end;
  });

  return filteredPurchases.reduce((sum, purchase) => sum + purchase.quantity * purchase.pricePerKg, 0);
}
