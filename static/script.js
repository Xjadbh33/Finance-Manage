const form = document.getElementById('transactionForm');
const pieCtx = document.getElementById('pieChart').getContext('2d');
const barCtx = document.getElementById('barChart').getContext('2d');
const popup = document.getElementById('popup');
const summaryText = document.getElementById('summaryText');
const closePopup = document.getElementById('closePopup');
const themeToggle = document.getElementById('themeToggle');

let transactions = [];
let pieChartInstance = null;
let barChartInstance = null;

async function fetchData() {
  const res = await fetch('/data');
  transactions = await res.json();
  updateCharts();
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    date: document.getElementById('date').value,
    category: document.getElementById('category').value,
    amount: parseFloat(document.getElementById('amount').value),
    type: document.getElementById('type').value
  };

  await fetch('/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  await fetchData();
  showSummary();
  form.reset();
});

function updateCharts() {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

  const categories = {};
  transactions.forEach(t => {
    if (!categories[t.category]) categories[t.category] = 0;
    categories[t.category] += t.amount * (t.type === 'expense' ? -1 : 1);
  });

  // Destroy previous charts to prevent overlay when re-rendering
  if (pieChartInstance) pieChartInstance.destroy();
  if (barChartInstance) barChartInstance.destroy();

  pieChartInstance = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: ['Pemasukan', 'Pengeluaran'],
      datasets: [{
        data: [totalIncome, totalExpense],
        backgroundColor: ['#0f4c81', '#dc3545']
      }]
    },
    options: { responsive: true }
  });

  barChartInstance = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: Object.keys(categories),
      datasets: [{
        label: 'Saldo per Kategori',
        data: Object.values(categories),
        backgroundColor: '#0a2540'
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}

function showSummary() {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const balance = totalIncome - totalExpense;

  // Calculate weekly and monthly summaries
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1);

  const weekly = transactions.filter(t => new Date(t.date) >= oneWeekAgo);
  const monthly = transactions.filter(t => new Date(t.date) >= oneMonthAgo);

  const weeklyIncome = weekly.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const weeklyExpense = weekly.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

  const monthlyIncome = monthly.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const monthlyExpense = monthly.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

  const summary = `Pemasukan: Rp${totalIncome.toLocaleString()} | Pengeluaran: Rp${totalExpense.toLocaleString()} | Saldo: Rp${balance.toLocaleString()}
` +
                  `Minggu ini — Pemasukan: Rp${weeklyIncome.toLocaleString()}, Pengeluaran: Rp${weeklyExpense.toLocaleString()}
` +
                  `Bulan ini — Pemasukan: Rp${monthlyIncome.toLocaleString()}, Pengeluaran: Rp${monthlyExpense.toLocaleString()}`;

  summaryText.textContent = summary;
  popup.classList.remove('hidden');
}

closePopup.addEventListener('click', () => popup.classList.add('hidden'));

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

fetchData();

