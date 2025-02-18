let selectedBuyer = null;
let isLoadProductsPurchased = false;

document.addEventListener("DOMContentLoaded", () => {
  fetchBuyers();
  fetchCleaningSchedule();
  fetchProductsPurchased();
  HandelNav();
});

// Buyers
async function fetchBuyers() {
  try {
    const buyers = await supabaseService.getUsers();
    if (buyers.length > 0) {
      populateBuyersList(buyers);
    }
    console.log("Users:", buyers);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

function populateBuyersList(buyers) {
  const buyersList = document.querySelector(".popup-buyers ul");
  buyersList.innerHTML = buyers
    .map(
      (buyer) => `
    <li>
      <button onclick="selectBuyer({name: '${buyer.name}', image: '${buyer.image_url}'})">${buyer.name}</button>
      </li>
    `
    )
    .join("");
}

// CleaningSchedule
async function fetchCleaningSchedule() {
  try {
    const cleaningSchedule = await supabaseService.getCleaningSchedule();
    console.log("CleaningSchedule:", cleaningSchedule);
    populateCleaningSchedule(cleaningSchedule);
    highlightCurrentDay();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

function populateCleaningSchedule(schedule) {
  const scheduleList = document.querySelector(".schedule ul");
  scheduleList.innerHTML = schedule
    .map(
      (item) => `
      <li>
        <span>${item.day_of_week}: ${item.name}</span>
      </li>
    `
    )
    .join("");
}

function highlightCurrentDay() {
  const days = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  const currentDay = days[new Date().getDay()];
  const scheduleItems = document.querySelectorAll(".schedule li");
  scheduleItems.forEach((item) => {
    if (item.textContent.includes(currentDay)) {
      item.classList.add("current-day");
    }
  });
}

// Products Purchased
async function fetchProductsPurchased() {
  try {
    const purchases = await supabaseService.getProductsPurchased();
    console.log("ProductsPurchased:", purchases);
    renderPurchases(purchases);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

function renderPurchases(purchases) {
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

// Event
function selectBuyer(buyer) {
  const selectBuyerBtn = document.querySelector(".select-buyer-btn");
  const profileImg = document.querySelector(".profile img");

  profileImg.src = buyer.image;
  selectedBuyer = buyer;

  selectBuyerBtn.textContent = buyer.name;

  closeBuyersPopup();
}

function openBuyersPopup() {
  document.querySelector(".popup-buyers").style.display = "block";
  document.querySelector(".overlay").style.display = "block";
}

function closeBuyersPopup() {
  document.querySelector(".popup-buyers").style.display = "none";
  document.querySelector(".overlay").style.display = "none";
}

function toggleDetails(button) {
  const details = button.nextElementSibling;
  if (details.style.display === "none" || details.style.display === "") {
    details.style.display = "block";
    button.textContent = "Ẩn";
  } else {
    details.style.display = "none";
    button.textContent = "Chi Tiết";
  }
}

function openForm() {
  const buyerInput = document.querySelector("#buyer");
  if (selectedBuyer) {
    buyerInput.value = selectedBuyer.name;
    buyerInput.readOnly = true;
  } else {
    buyerInput.value = "";
  }
  document.querySelector(".popup-form").style.display = "block";
  document.querySelector(".overlay").style.display = "block";
}

function closeForm() {
  document.querySelector(".popup-form").style.display = "none";
  document.querySelector(".overlay").style.display = "none";
}

function addProduct(event) {
  event.preventDefault();
  const buyer = document.querySelector("#buyer").value;
  const product = document.querySelector("#product").value;
  const price = parseFloat(document.querySelector("#price").value);
  const date = document.querySelector("#date").value;

  purchases.push({ buyer, product, price, date });
  renderPurchases();
  closeForm();
}

function changePage(page) {
  const schedule = document.querySelector(".schedule");
  const purchases = document.querySelector(".purchases");
  switch (page) {
    case 1:
      schedule.style.display = "block";
      purchases.style.display = "none";
      break;
    case 2:
      if (!isLoadProductsPurchased) {
        fetchProductsPurchased();
      }
      schedule.style.display = "none";
      purchases.style.display = "block";
      break;

    default:
      break;
  }
}

function HandelNav() {
  const navItems = document.querySelectorAll(".nav-item");

  // Thêm sự kiện click cho mỗi liên kết
  navItems.forEach((item) => {
    item.addEventListener("click", function (event) {
      // Ngăn chặn hành vi mặc định của liên kết
      event.preventDefault();

      // Xóa lớp 'active' khỏi tất cả các liên kết
      navItems.forEach((navItem) => navItem.classList.remove("active"));

      // Thêm lớp 'active' vào liên kết được nhấp
      this.classList.add("active");

      // Lấy id của phần tương ứng với liên kết
      const targetId = this.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      // Ẩn tất cả các phần
      document.querySelectorAll("section").forEach((section) => {
        section.style.display = "none";
      });

      // Hiển thị phần tương ứng
      if (targetSection) {
        targetSection.style.display = "block";
      }
    });
  });

  // Khởi tạo: chọn liên kết đầu tiên và hiển thị phần tương ứng
  navItems[0].classList.add("active");
  document.getElementById("schedule").style.display = "block";
}
