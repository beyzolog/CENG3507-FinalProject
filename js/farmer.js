// Default çiftçi verisi
const defaultFarmers = [
  { farmerId: 'F001', name: 'Ahmet Yılmaz', contact: '555-1234', location: 'İstanbul, Türkiye' },
  { farmerId: 'F002', name: 'Mehmet Özdemir', contact: '555-2345', location: 'Ankara, Türkiye' },
  { farmerId: 'F003', name: 'Ali Can', contact: '555-3456', location: 'İzmir, Türkiye' },
  { farmerId: 'F004', name: 'Ayşe Yıldız', contact: '555-4567', location: 'Bursa, Türkiye' },
  { farmerId: 'F005', name: 'Veli Kara', contact: '555-5678', location: 'Antalya, Türkiye' },
  { farmerId: 'F006', name: 'Fatma Çelik', contact: '555-6789', location: 'Konya, Türkiye' },

];

// `farmers` dizisini `localStorage`'a kaydetmek
localStorage.setItem('farmers', JSON.stringify(defaultFarmers));

let farmers = JSON.parse(localStorage.getItem('farmers')) || [];
let currentFarmerId = null; // Güncellenecek çiftçinin ID'sini saklamak için


console.log(farmers);
// Farmer ekleme/güncelleme fonksiyonu
export function saveFarmer(farmer) {
  if (currentFarmerId) {
      const existingFarmerIndex = farmers.findIndex(f => f.farmerId === currentFarmerId);
      if (existingFarmerIndex !== -1) {
          farmers[existingFarmerIndex] = farmer;
      }
  } else {
      const existingFarmer = farmers.find(f => f.farmerId === farmer.farmerId);
      if (existingFarmer) {
          alert('Farmer ID must be unique.');
          return;
      }
      farmers.push(farmer);
  }

  localStorage.setItem('farmers', JSON.stringify(farmers));
  renderFarmerList();
  populateFarmerDropdown(); // Dropdown'u güncelleme
  currentFarmerId = null; 
}
export function populateFarmerDropdown() {
  const farmerDropdown = document.getElementById('farmerIdSelect');
  farmerDropdown.innerHTML = '<option value="">Select a Farmer</option>';

  farmers.forEach(farmer => {
      const option = document.createElement('option');
      option.value = farmer.farmerId;
      option.textContent = `${farmer.farmerId} - ${farmer.name}`;
      farmerDropdown.appendChild(option);
  });
}

// Çiftçi bilgilerini silme fonsiyonu (çiftçiye ait satın alma verilerini de siler)
export function deleteFarmer(farmerId) {
  
  farmers = farmers.filter(f => f.farmerId !== farmerId);
  localStorage.setItem('farmers', JSON.stringify(farmers));
  
  import('./purchase.js').then(module => {
      module.deletePurchasesByFarmerId(farmerId);
  });

  renderFarmerList(); // Listeyi güncelle
  populateFarmerDropdown(); 
}

// Çiftçi bilgilerini formda düzenlemek için doldurma
export function editFarmer(farmerId) {
  const farmer = farmers.find(f => f.farmerId === farmerId);
  if (farmer) {
      // Formu çiftçi bilgileriyle doldur
      document.getElementById('farmerId').value = farmer.farmerId;
      document.getElementById('farmerName').value = farmer.name;
      document.getElementById('farmerContact').value = farmer.contact;
      document.getElementById('farmerLocation').value = farmer.location;

      document.getElementById('farmerId').disabled = true; // ID alanı
      currentFarmerId = farmerId; // Güncellenecek çiftçinin ID'si
  }
}

// Çiftçi listesi 
export function renderFarmerList() {
  const searchQuery = document.getElementById('searchBox').value.toLowerCase();
  const farmerList = document.getElementById('farmerList');
  farmerList.innerHTML = '';

  const filteredFarmers = farmers.filter(farmer => {
      const name = farmer.name ? farmer.name.toLowerCase() : '';
      const location = farmer.location ? farmer.location.toLowerCase() : '';
      return name.includes(searchQuery) || location.includes(searchQuery);
  });

  filteredFarmers.forEach(farmer => {
      const tr = document.createElement('tr');

      const tdId = document.createElement('td');
      tdId.textContent = farmer.farmerId;

      const tdName = document.createElement('td');
      tdName.textContent = farmer.name;

      const tdContact = document.createElement('td');
      tdContact.textContent = farmer.contact;

      const tdLocation = document.createElement('td');
      tdLocation.textContent = farmer.location;

      const tdActions = document.createElement('td');
      
      // Silme butonu
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = () => deleteFarmer(farmer.farmerId);
      
      // Güncellemek için  buton
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.onclick = () => editFarmer(farmer.farmerId);

      tdActions.appendChild(editBtn);
      tdActions.appendChild(deleteBtn);

      tr.appendChild(tdId);
      tr.appendChild(tdName);
      tr.appendChild(tdContact);
      tr.appendChild(tdLocation);
      tr.appendChild(tdActions);

      farmerList.appendChild(tr);
  });
}

// farmer ekleme/güncelleme
document.getElementById('farmerForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const farmerId = document.getElementById('farmerId').value.trim();
  const name = document.getElementById('farmerName').value.trim();
  const contact = document.getElementById('farmerContact').value.trim();
  const location = document.getElementById('farmerLocation').value.trim();

  if (!farmerId || !name || !contact || !location) {
      alert("Please fill all fields");
      return;
  }

  const farmer = { farmerId, name, contact, location };
  saveFarmer(farmer);

  this.reset(); // Formu temizle
  document.getElementById('farmerId').disabled = false; 
});

// Arama kutusunda değişiklik olursa listeyi güncelleme
document.getElementById('searchBox').addEventListener('input', renderFarmerList);


window.addEventListener('load', () => {
  renderFarmerList();
  populateFarmerDropdown();
});

// Farmer verileri CSV formatında
export function exportFarmerData() {
  const csvRows = [];

  const headers = ['Farmer ID', 'Name', 'Contact', 'Location'];
  csvRows.push(headers.join(',')); // Başlıkları virgülle ayırarak ekliyoruz

  farmers.forEach(farmer => {
      const values = [farmer.farmerId, farmer.name, farmer.contact, farmer.location];
      csvRows.push(values.join(',')); 
  });

  // CSV verisini oluşturmak
  const csvString = csvRows.join('\n'); 
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  // İndirme işlemini başlatma
  const a = document.createElement('a');
  a.href = url;
  a.download = 'farmers_data.csv'; // İndirilecek dosyanın adı
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Export butonuna tıklama olayını dinleme
document.getElementById('exportButton').addEventListener('click', exportFarmerData);

//purchase.js dosyası ile kullanmak için farmers dizisini dışa aktarma
export { farmers };