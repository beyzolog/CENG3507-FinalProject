
let categories = JSON.parse(localStorage.getItem("categories")) || false

if (!categories) {
    categories = [
        { id: 1, name: "Small", weight: 100, stockLevel: 100, pricePerKg: 1, minStockLevel: 10, stockHistory: [] },
        { id: 2, name: "Medium", weight: 250, stockLevel: 100, pricePerKg: 10, minStockLevel: 10, stockHistory: [] },
        { id: 3, name: "Large", weight: 500, stockLevel: 115, pricePerKg: 15, minStockLevel: 10, stockHistory: [] },
        { id: 4, name: "Extra Large", weight: 1000, stockLevel: 215, pricePerKg: 25, minStockLevel: 10, stockHistory: [] },
        { id: 5, name: "Family Pack", weight: 2000, stockLevel: 415, pricePerKg: 45, minStockLevel: 5, stockHistory: [] },
        { id: 6, name: "Bulk Pack", weight: 5000, stockLevel: 110, pricePerKg: 80, minStockLevel: 5, stockHistory: [] },
        { id: 7, name: "Premium", weight: "Custom", stockLevel: 10, pricePerKg: 0, minStockLevel: 2, stockHistory: [] },
    ]
    JSON.parse(localStorage.setItem("categories", JSON.stringify(categories)))
}


export const productCategories = categories.map((category) => category.name);
export function reduceStock(category, quantity) {
    console.log("halloooo")
    if (stock[category] >= quantity) {
        stock[category] -= quantity;
    } else {
        alert("Not enough stock available!");
    }
}


// LocalStorage'a kategorileri kaydet
function saveCategoriesToLocalStorage() {
    localStorage.setItem("categories", JSON.stringify(categories));
}

// Kategorileri tabloya yükle
export function populateCategoryTable() {
    console.log("heyyyyyy");
    const categoriesUpdated = JSON.parse(localStorage.getItem("categories"));
    const tableBody = document.querySelector("#categoryTable tbody");
    tableBody.innerHTML = "";
    categoriesUpdated.forEach(category => {
        
        const row = document.createElement("tr");
        const pricePerKg = isNaN(category.pricePerKg) ? 0 : category.pricePerKg;
        row.innerHTML = `
            <td>${category.name}</td>
            <td>${category.weight}</td>
            <td>${category.stockLevel}</td>
            <td>${category.minStockLevel}</td>
            <td>$${pricePerKg.toFixed(2)}
            <button class="updatePriceBtn" data-category-id="${category.id}">update</button></td>  
        `;
        tableBody.appendChild(row);
    });
    
    const updatePriceButtons = document.querySelectorAll(".updatePriceBtn");
    updatePriceButtons.forEach(button => {
        button.addEventListener("click", function () {
            const categoryId = parseInt(button.getAttribute("data-category-id"), 10);
            updatePriceForCategory(categoryId);
        });
    });
}
// Sayfa yüklendiğinde kategorileri göster
window.addEventListener("load", function () {
    populateCategoryTable();
    
});

// Fiyat güncelleme işlemi
function updatePriceForCategory(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
        
        const newPrice = prompt(`Yeni fiyat girin (Kategori: ${category.name}, Mevcut Fiyat: $${category.pricePerKg}):`);

        if (newPrice && !isNaN(newPrice) && parseFloat(newPrice) > 0) {
            category.pricePerKg = parseFloat(newPrice);
            saveCategoriesToLocalStorage();  // Yeni fiyatı kaydet
            populateCategoryTable();  // Tabloyu güncelle
            alert(`${category.name} kategorisinin fiyatı $${newPrice} olarak güncellendi.`);
        } else {
            alert("Geçerli bir fiyat girin.");
        }
    } else {
        alert("Kategori bulunamadı.");
    }
}

export function assignProductToCategory(weight, quantity) {
    if (quantity <= 0) {
        alert("Quantity must be greater than 0.");
        return;
    }

   
    const packageWeightInKg = weight / 1000;  // kg cinsine çevrim


    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    const category = categories.find(cat => cat.weight === weight || cat.weight === "Custom");
    if (category) {
        // Stok seviyesi güncelleme
        category.stockLevel += quantity;
        category.stockHistory.push({ date: new Date(), change: quantity, newStock: category.stockLevel });

        // Kategoriyi LocalStorage'a kaydet
        localStorage.setItem("categories", JSON.stringify(categories));

        // UI'yi güncelle
        populateCategoryTable();
       
        alert('Product assigned and inventory updated!');
    } else {
        alert("No suitable category found for this weight.");
    }
}


  

// Stok seviyeleri kontrolü
export function checkStockLevels(category) {
    if (category.stockLevel <= category.minStockLevel) {
        alert(`${category.name} category has low stock! Please restock.`);
    }
}


// Form gönderimi
document.getElementById("productForm").addEventListener("submit", function (event) {
    event.preventDefault();
    
    const productWeight = parseInt(document.getElementById("productWeight").value, 10);
    const productQuantity = parseInt(document.getElementById("productQuantity").value, 10);

    
    if (isNaN(productQuantity) || productQuantity <= 0) {
        alert("Please enter a valid quantity greater than 0.");
        return; // İşlemi sonlandır
    }
    // Find category and calculate total cost
    const category = categories.find(cat => {
        if (cat.weight === "Custom") return true;
        return productWeight <= cat.weight;
    });

    if (category) {
        const totalPrice = (productWeight / 1000) * category.pricePerKg * productQuantity;
        alert(`${productQuantity} units of product added to ${category.name} category. Total price: $${totalPrice.toFixed(2)}`);
        assignProductToCategory(productWeight, productQuantity);
    } else {
        alert("No suitable category found for this weight.");
    }
});



//********************************************* */
//  raporlar için fonksiyonlar

// Stok kullanımı 
function generateStockUsageReport() {
    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    let report = 'Stok Kullanımı Raporu:<br>';
    categories.forEach(category => {
        report += `${category.name}: ${category.stockLevel} adet<br>`;
    });
    return report;
}

function calculateStockTrend(stockHistory) {
    // Eğer stok geçmişi yoksa trend 0 olarak kabul edilir
    if (!Array.isArray(stockHistory) || stockHistory.length < 2) {
        console.log("Not enough data to calculate trend.");
        return 0; // Geçerli bir geçmiş yoksa veya yalnızca bir kayıt varsa, trend yoktur
    }

    // İlk ve son kayıtlar
    const firstRecord = stockHistory[0].newStock; // İlk kaydın yeni stok değeri
    const lastRecord = stockHistory[stockHistory.length - 1].newStock; // Son kaydın yeni stok değeri

    // Değişim miktarı: Son stok - İlk stok
    const change = lastRecord - firstRecord;

    // Değişim miktarına göre durumu belirle
    console.log(`First Stock: ${firstRecord}, Last Stock: ${lastRecord}, Change: ${change}`);
    return change;
}


function generateStockTrendReport() {
    let report = 'Stok Trend Raporu:<br>';

    categories.forEach(category => {
        //  trendi hesapla
        if (category.stockHistory && category.stockHistory.length > 0) {
            const trend = calculateStockTrend(category.stockHistory);  // Trend hesaplama
            const trendStatus = trend >= 0 ? 'Artmış' : 'Azalmış';   // Trend durumu
            const trendAmount = Math.abs(trend);  // Mutlak değeri alarak miktar
            report += `${category.name}: ${trendStatus} (${trendAmount} adet)<br>`;
        } else {
            report += `${category.name}: Yetersiz veri (geçmiş yok)<br>`;
        }
    });

    return report;
}


// Gelecek ay stok tahmini raporu
function generateStockForecastReport() {
    let report = 'Gelecek Ay Stok Tahmini:<br>';
    categories.forEach(category => {
        const forecast = calculateStockNeeds(category);
        report += `${category.name}: ${forecast} adet<br>`;
    });
    return report;
}

// Raporları ekranda gösteren fonksiyon
function displayReport(report) {
    document.getElementById('reportOutput').innerHTML = report;
}

// Butonlara tıklama olayları ekle
document.getElementById('stockUsageReportBtn').addEventListener('click', function () {
    const report = generateStockUsageReport();
    displayReport(report);
});

document.getElementById('stockTrendReportBtn').addEventListener('click', function () {
    const report = generateStockTrendReport();
    console.log("trend report");

    displayReport(report);
});

document.getElementById('stockForecastReportBtn').addEventListener('click', function () {
    const report = generateStockForecastReport();
    displayReport(report);
});
