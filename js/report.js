import { calculateTotalExpensesByDate } from "./purchase.js";
import { orders } from "./order.js";

//verileri filtreleme
function filterDataByDateRange(data, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return data.filter((record) => {
    const recordDate = new Date(record.date); 
    return recordDate >= start && recordDate <= end;
  });
}



// Toplam gelir
function calculateTotalIncome(startDate, endDate) {
  const filteredOrders = filterDataByDateRange(orders, startDate, endDate);

  // Filtrelenmiş siparişler
  console.log("Filtered Orders:", filteredOrders);

  return filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0);
}

// Rapor
export function generateReport(startDate, endDate) {
  const totalIncome = calculateTotalIncome(startDate, endDate);
  const totalExpenses = calculateTotalExpensesByDate(startDate, endDate);

  console.log(`Total Income: $${totalIncome}`);
  console.log(`Total Expenses: $${totalExpenses}`);

  document.getElementById("totalIncome").textContent = `$${totalIncome.toFixed(2)}`;
  document.getElementById("totalExpenses").textContent = `$${totalExpenses.toFixed(2)}`;
  document.getElementById("reportOutput").hidden = false;
}


document.getElementById("generateReportButton").addEventListener("click", () => {
  const startDate = document.getElementById("reportStartDate").value;
  const endDate = document.getElementById("reportEndDate").value;

  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  generateReport(startDate, endDate);
});
