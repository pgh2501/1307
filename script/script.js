let selectedBuyer = null;
let isLoadProductsPurchased = false;
const supabaseService = new SupabaseService(SUPABASE_URL, SUPABASE_KEY);

// Init
document.addEventListener("DOMContentLoaded", () => {
  const membersController = new MembersController(supabaseService);
  const scheduleController = new ScheduleController(supabaseService);
  const expensesController = new ExpensesController(supabaseService);

  membersController.showMember();
  scheduleController.showCleaningSchedule();
  expensesController.showExpenses();
  showNav();
});

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

function showNav() {
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

  // Card start
  let startX;
  let currentCard;

  function handleTouchStart(event) {
    startX = event.touches[0].clientX;
    currentCard = event.currentTarget;
  }

  function handleTouchMove(event) {
    if (!startX) return;
    const currentX = event.touches[0].clientX;
    const diffX = startX - currentX;

    if (diffX > 0) {
      currentCard.classList.add("swiped");
    } else {
      currentCard.classList.remove("swiped");
    }
  }

  function handleTouchEnd(event) {
    startX = null;
    currentCard = null;
  }
  // Card end
