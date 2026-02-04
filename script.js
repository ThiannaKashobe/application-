// Formater les montants en XAF
function formatCurrency(amount){
  return amount.toLocaleString('fr-FR', {style:'currency', currency:'XAF'});
}

// Données de secours si data.json ne répond pas
const FALLBACK_DATA = {
  company: {name: 'Café Congo SARL', activity: 'Torréfaction & vente de café', cash: 125000},
  stocks: [
    {product: 'Arabica Kivu 250g', quantity: 120, threshold: 20},
    {product: 'Robusta Nord 250g', quantity: 2, threshold: 20},
    {product: 'Mélange Maison 250g', quantity: 45, threshold: 15},
    {product: 'Capsules Espresso (10 pcs)', quantity: 25, threshold: 10}
  ],
  sales: [
    {product: 'Arabica Kivu 250g', quantity: 10, price: 2500},
    {product: 'Mélange Maison 250g', quantity: 5, price: 2200},
    {product: 'Capsules Espresso (10 pcs)', quantity: 3, price: 3500}
  ],
  history: [
    {date: '2026-01-28', revenue: 85000},
    {date: '2026-01-29', revenue: 92000},
    {date: '2026-01-30', revenue: 76000},
    {date: '2026-01-31', revenue: 104000},
    {date: '2026-02-01', revenue: 98000},
    {date: '2026-02-02', revenue: 112000},
    {date: '2026-02-03', revenue: 96000}
  ],
  expenses: [
    {date: '2026-02-01', description: 'Achat grains', amount: 25000},
    {date: '2026-02-02', description: 'Emballages', amount: 6000},
    {date: '2026-02-03', description: 'Loyer', amount: 30000}
  ],
  clients: [
    {name: 'Boutique Kin', contact: 'contact@boutiquekin.ci'},
    {name: 'Restaurant Le Marché', contact: '07 89 12 34'}
  ]
};

// Affichage des notifications
function showNotice(msg){
  const n = document.getElementById('notice');
  if(n){ n.textContent = msg; n.style.display = 'block'; }
}

// Animation des chiffres
function animateValue(el, start, end, duration = 800){
  let startTime = null;
  function animate(time){
    if(!startTime) startTime = time;
    const progress = Math.min((time - startTime)/duration, 1);
    el.textContent = formatCurrency(Math.round(start + (end - start)*progress));
    if(progress < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

// Calcul du pourcentage de variation
function percentageChange(prev, curr){
  if(prev === 0) return null;
  return Math.round(((curr - prev)/prev) * 100);
}

// Intervalle de rafraîchissement et instance du graphique
const REFRESH_MS = 60_000; // 1 minute
let chartInstance = null;

// Récupération des données
function fetchData(){
  fetch('data.json')
    .then(res => {
      if(!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(data => {
      showNotice('Données chargées depuis data.json');
      renderPage(data);
    })
    .catch(err => {
      console.error('Impossible de charger les données', err);
      showNotice('Données externes indisponibles — affichage en mode démonstration');
      renderPage(FALLBACK_DATA);
    });
}

// Affichage de la page
function renderPage(data){
  // Header
  document.getElementById('company-name').textContent = data.company?.name || 'Mon Entreprise';
  document.getElementById('company-activity').textContent = data.company?.activity || '';
  document.getElementById('last-update').textContent = 'Dernière mise à jour : ' + new Date().toLocaleString();

  // KPI
  const totalRevenue = (data.sales || []).reduce((s,x)=>s + (x.price * x.quantity),0);
  const totalUnits = (data.sales || []).reduce((s,x)=>s + x.quantity,0);
  const cash = data.company?.cash || 0;
  const persistedExpenses = JSON.parse(localStorage.getItem('expenses') || 'null');
  if(persistedExpenses && Array.isArray(persistedExpenses)) data.expenses = (data.expenses || []).concat(persistedExpenses);
  const totalExpenses = (data.expenses || []).reduce((s,x)=>s + (x.amount || 0),0);
  const netIncome = totalRevenue - totalExpenses;

  animateValue(document.getElementById('kpi-revenue'),0,totalRevenue);
  document.getElementById('kpi-units').textContent = totalUnits;
  animateValue(document.getElementById('kpi-cash'),0,cash);
  animateValue(document.getElementById('kpi-expenses'),0,totalExpenses);
  animateValue(document.getElementById('kpi-net'),0,netIncome);

  // Stocks
  const stockBody = document.querySelector('#stock-table tbody');
  stockBody.innerHTML = '';
  const lowStock = [];
  data.stocks.forEach(s => {
    const tr = document.createElement('tr');
    if(s.quantity <= (s.threshold || 3)) { tr.classList.add('low-stock'); lowStock.push(s); }
    tr.innerHTML = `<td>${s.product}</td><td>${s.quantity}</td>`;
    stockBody.appendChild(tr);
  });

  document.getElementById('kpi-alerts').textContent = lowStock.length;
  document.getElementById('alerts').textContent = lowStock.length ? 
    `${lowStock.length} produit(s) faible(s) : ${lowStock.map(x=>x.product).join(', ')}` : '';

  // Ventes
  const salesBody = document.querySelector('#sales-table tbody');
  salesBody.innerHTML = '';
  (data.sales || []).forEach(s=>{
    const montant = s.price*s.quantity;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.product}</td><td>${s.quantity}</td><td>${formatCurrency(s.price)}</td><td>${formatCurrency(montant)}</td>`;
    salesBody.appendChild(tr);
  });

  // Dépenses
  const expensesBody = document.querySelector('#expenses-table tbody');
  expensesBody.innerHTML = '';
  (data.expenses || []).forEach(e=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${e.date}</td><td>${e.description}</td><td>${formatCurrency(e.amount)}</td>`;
    expensesBody.appendChild(tr);
  });

  // Clients
  const clientsList = document.getElementById('clients-list');
  clientsList.innerHTML = '';
  const persistedClients = JSON.parse(localStorage.getItem('clients') || 'null');
  const clients = (persistedClients && Array.isArray(persistedClients)) ? persistedClients : (data.clients || []);
  clients.forEach(c=>{
    const li = document.createElement('li');
    li.textContent = `${c.name}${c.contact ? ' — ' + c.contact : ''}`;
    clientsList.appendChild(li);
  });
  document.getElementById('clients-count').textContent = `(${clients.length})`;

  // Graphique
  const ctx = document.getElementById('sales-chart').getContext('2d');
  const hasHistory = Array.isArray(data.history) && data.history.length;
  // Synchroniser le jour courant avec le total des ventes
  const today = new Date().toISOString().slice(0,10);
  if (!Array.isArray(data.history)) data.history = [];
  const last = data.history[data.history.length - 1];
  if (last && last.date === today) last.revenue = totalRevenue;
  else data.history.push({date: today, revenue: totalRevenue});

  const chartData = hasHistory ? {
    labels: data.history.map(h=>h.date),
    datasets:[{label:'CA (jour)', data:data.history.map(h=>h.revenue), borderColor:'#7c3aed', backgroundColor:'rgba(124,58,237,0.12)', fill:true, tension:0.25}]
  } : {
    labels: data.sales.map(s=>s.product),
    datasets:[{label:'Ventes (quantité)', data:data.sales.map(s=>s.quantity), backgroundColor:'rgba(54,162,235,0.7)'}]
  };

  if(chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx,{
    type: hasHistory ? 'line' : 'bar',
    data: chartData,
    options:{
      responsive:true,
      plugins:{legend:{display:false}},
      scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(15,23,42,0.04)'}}}
    }
  });

  // Notifications : alerte stocks faibles
  if (lowStock.length) notify(`Stock faible (${lowStock.length})`, `${lowStock.map(x=>x.product).join(', ')}`);
  // Notification si résultat négatif
  if (netIncome < 0) notify('Résultat négatif', `Résultat net : ${formatCurrency(netIncome)}`);

  // Setup event handlers for add forms
  const addExpenseBtn = document.getElementById('add-expense-btn');
  const addExpenseForm = document.getElementById('add-expense-form');
  addExpenseBtn?.addEventListener('click',()=> addExpenseForm.style.display = addExpenseForm.style.display === 'none' ? 'block' : 'none');

  addExpenseForm?.addEventListener('submit',(e)=>{
    e.preventDefault();
    const date = document.getElementById('expense-date').value;
    const desc = document.getElementById('expense-desc').value;
    const amount = Number(document.getElementById('expense-amount').value || 0);
    const newExp = {date, description: desc, amount};
    const persisted = JSON.parse(localStorage.getItem('expenses') || '[]');
    persisted.push(newExp);
    localStorage.setItem('expenses', JSON.stringify(persisted));
    showNotice('Dépense ajoutée');
    if (amount > 50000) notify('Dépense importante', `${desc} : ${formatCurrency(amount)}`);
    renderPage(data);
  });

  const addClientBtn = document.getElementById('add-client-btn');
  const addClientForm = document.getElementById('add-client-form');
  addClientBtn?.addEventListener('click',()=> addClientForm.style.display = addClientForm.style.display === 'none' ? 'block' : 'none');
  addClientForm?.addEventListener('submit',(e)=>{
    e.preventDefault();
    const name = document.getElementById('client-name').value;
    const contact = document.getElementById('client-contact').value;
    const persisted = JSON.parse(localStorage.getItem('clients') || '[]');
    persisted.push({name, contact});
    localStorage.setItem('clients', JSON.stringify(persisted));
    showNotice('Client ajouté');
    renderPage(data);
  });
}

// Notification helper
function notify(title, body){
  if ('Notification' in window && Notification.permission === 'granted'){
    try{ new Notification(title, {body}); }catch(e){ console.warn('Notification échouée', e); showNotice(body);} 
  } else {
    // fallback: afficher en bannière
    showNotice(body);
  }
}

// Export PDF
document.getElementById('export-btn').addEventListener('click',()=> window.print());

// Partage URL
document.getElementById('share-btn').addEventListener('click',()=>{
  navigator.clipboard?.writeText(location.href).then(()=> alert('Lien copié dans le presse-papiers'));
});

// Modal d'introduction
const introModal = document.getElementById('intro-modal');
const closeIntro = document.getElementById('close-intro');
const dontShow = document.getElementById('dont-show');
const helpBtn = document.getElementById('help-btn');

if(introModal){
  if(localStorage.getItem('seenIntro') !== 'true') introModal.style.display = 'flex';
  closeIntro?.addEventListener('click',()=> introModal.style.display='none');
  dontShow?.addEventListener('click',()=>{
    localStorage.setItem('seenIntro','true');
    introModal.style.display='none';
  });
  // Le lien 'À propos' est maintenant un <a href="about.html" target="_blank"> dans le DOM; pas besoin d'un gestionnaire JS ici.
}

// Footer "En savoir plus" : lien direct vers about.html (géré par l'anchor target="_blank")

// Initial load et refresh périodique
// Demander la permission pour les notifications (si supportées)
if ('Notification' in window && Notification.permission !== 'granted'){
  try{ Notification.requestPermission(); }catch(e){ console.warn('Permission notification non supportée', e); }
}

fetchData();
setInterval(fetchData, REFRESH_MS);
