class ExpensesController {
  constructor(supabaseService) {
    this.supabaseService = supabaseService;
  }

  async showExpenses() {
    try {
      const purchases = await supabaseService.getProductsPurchased();
      console.log("ProductsPurchased:", purchases);
      this.renderPurchases(purchases);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  renderPurchases(purchases) {
    const ul = document.querySelector(".purchases ul");
    ul.innerHTML = "";

    const groupedPurchases = purchases.reduce((acc, purchase) => {
      if (!acc[purchase.buyer]) {
        acc[purchase.buyer] = { total: 0, items: [] };
      }
      acc[purchase.buyer].total += purchase.price;
      acc[purchase.buyer].items.push(purchase);
      return acc;
    }, {});

    for (const buyer in groupedPurchases) {
      const li = document.createElement("li");
      li.innerHTML = `
                <span>${buyer}</span>
                <span>Total Price: $${groupedPurchases[buyer].total}</span>
                <button class="details-btn" onclick="toggleDetails(this)">Chi Tiết</button>
                <div class="details">
                  ${groupedPurchases[buyer].items
                    .map(
                      (item) => `
                      <div class="details-item">
                      <p>Product Name: ${item.product}</p>
                      <p>Price: $${item.price}</p>
                      <p>Purchase Date: ${item.date}</p>
                      <button class="edit-btn">Edit</button>
                      </div>
                  `
                    )
                    .join("")}
                </div>
          `;
      ul.appendChild(li);
    }
  }
}
