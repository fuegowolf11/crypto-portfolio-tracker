let portfolio = JSON.parse(localStorage.getItem('cryptoPortfolio')) || [];
const coins = ['bitcoin', 'ethereum', 'solana', 'cardano', 'ripple', 'dogecoin'];

const select = document.getElementById('coin-select');
const form = document.getElementById('add-form');
const portfolioList = document.getElementById('portfolio-list');
const valueBox = document.getElementById('portfolio-value');

coins.forEach(coin => {
  const option = document.createElement('option');
  option.value = coin;
  option.textContent = coin.charAt(0).toUpperCase() + coin.slice(1);
  select.appendChild(option);
});

async function fetchCurrentPrices() {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd`);
    return await response.json();
  } catch (e) {
    console.error(e);
    return {};
  }
}

async function renderPortfolio() {
  const prices = await fetchCurrentPrices();
  let totalValue = 0;
  portfolioList.innerHTML = '';

  portfolio.forEach((item, index) => {
    const price = prices[item.coin] ? prices[item.coin].usd : 0;
    const value = (item.amount * price).toFixed(2);
    totalValue += parseFloat(value);

    const div = document.createElement('div');
    div.className = 'portfolio-item';
    div.innerHTML = `
      <div>
        <strong>${item.coin.charAt(0).toUpperCase() + item.coin.slice(1)}</strong><br>
        ${item.amount} coins
      </div>
      <div style="text-align:right">
        $${parseFloat(value).toLocaleString()}<br>
        <button onclick="removeItem(${index})" style="background:none;color:#ff4500;border:none;cursor:pointer;">Remove</button>
      </div>
    `;
    portfolioList.appendChild(div);
  });

  valueBox.innerHTML = `Total Portfolio Value: <strong>$${totalValue.toLocaleString()}</strong>`;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const coin = select.value;
  const amount = parseFloat(document.getElementById('amount').value);

  if (amount > 0) {
    portfolio.push({ coin, amount });
    localStorage.setItem('cryptoPortfolio', JSON.stringify(portfolio));
    renderPortfolio();
    form.reset();
  }
});

window.removeItem = function(index) {
  portfolio.splice(index, 1);
  localStorage.setItem('cryptoPortfolio', JSON.stringify(portfolio));
  renderPortfolio();
};

document.getElementById('clear-portfolio').addEventListener('click', () => {
  if (confirm('Clear entire portfolio?')) {
    portfolio = [];
    localStorage.removeItem('cryptoPortfolio');
    renderPortfolio();
  }
});

renderPortfolio();
setInterval(renderPortfolio, 60000); // refresh every minute
