const SUPABASE_URL = "https://glaeuevvtsavesqrdhcr.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYWV1ZXZ2dHNhdmVzcXJkaGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzkzODcsImV4cCI6MjA1NTU1NTM4N30.01lbnToxXsAbGi6JQmv4HkcDnxIOF_HLcJcYAzHyoh8";

let currentMember = null;
let currentPopup = null;
let isLoadProductsPurchased = false;

// Khởi tạo services và controllers
const membersController = new MembersController();
const scheduleController = new ScheduleController();
const expensesController = new ExpensesController();
const rentController = new RentController();

// Init--------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  membersController.init();
  scheduleController.init();
  expensesController.init();
  rentController.init();
  showNav();
});
// Init end

// Event start--------------------------------------------------------------------
// Popup start---------------------------
function openForm(popupId, edit) {
  if (popupId === "addExpensePopup") {
    // Gán select member
    if (currentMember) {
      const selectElement = document.getElementById("expensesMemberId");
      const optionToSelect = selectElement.querySelector(
        `option[value="${currentMember.id}"]`
      );
      if (optionToSelect) {
        optionToSelect.selected = true;
      }
    }

    // Gán ngày hiện tại
    const expensesPurchaseDate = document.getElementById(
      "expensesPurchaseDate"
    );
    if (!expensesPurchaseDate.value) {
      expensesPurchaseDate.value = getInputTypeDateDefaultValue();
    }
  }

  currentPopup = document.getElementById(popupId);
  const submitButton = currentPopup.querySelector("button[type='submit']");

  // Hiển thị tên button
  if (submitButton) {
    if (edit) {
      submitButton.textContent = "Cập nhật";
    } else {
      submitButton.textContent = "Thêm";
    }
  }
  // Hiển thị popup
  currentPopup.classList.add("active");
  // Active orverlay
  document.querySelector(".overlay").classList.add("active");
}

function closeForm() {
  if (currentPopup) {
    currentPopup.classList.remove("active");
    resetForm(currentPopup);
  }
  document.querySelector(".overlay").classList.remove("active");
}

function resetForm(currentPopup) {
  if (currentPopup) {
    const form = currentPopup.querySelector("form");
    if (form) {
      // Reset các input text, number, date, email, v.v.
      form
        .querySelectorAll(
          'input[type="text"], input[type="number"], input[type="date"], input[type="email"], input[type="hidden"]'
        )
        .forEach((input) => {
          input.value = "";
        });

      // Reset các input file
      form.querySelectorAll('input[type="file"]').forEach((input) => {
        input.value = ""; // Đặt lại giá trị của input file
      });

      // MemberPopup
      if (currentPopup.id === "addMemberPopup") {
        // Đặt lại ảnh mặc định
        const avatarPreview = form.querySelector("#memberAvatarPreview");
        if (avatarPreview) {
          avatarPreview.src = "assets/avatarDefault.png";
        }
      }
    }
  }
}

function showMessageConfirm(message) {
  return new Promise((resolve) => {
    currentPopup = document.getElementById("messageConfirmPopup");
    const confirmMessage = document.getElementById("confirmMessage");
    const confirmYes = document.getElementById("confirmYes");
    const confirmNo = document.getElementById("confirmNo");
    const overlay = document.querySelector(".overlay");

    confirmMessage.textContent = message;

    confirmYes.onclick = () => {
      resolve(true);
      closeConfirmPopup();
    };

    confirmNo.onclick = () => {
      resolve(false);
      closeConfirmPopup();
    };

    overlay.onclick = () => {
      resolve(false);
      closeConfirmPopup();
    };

    currentPopup.classList.add("active");
    overlay.classList.add("active");

    function closeConfirmPopup() {
      currentPopup.classList.remove("active");
      document.querySelector(".overlay").classList.remove("active");
      confirmYes.onclick = null;
      confirmNo.onclick = null;
    }
  });
}

function selectHeaderMember(member) {
  const selectBuyerBtn = document.querySelector(".select-buyer-btn");
  const profileImg = document.querySelector(".profile img");
  currentMember = member;
  if (member.image) {
    profileImg.src = member.image;
  } else {
    profileImg.src = "assets/avatarDefault.png";
  }
  selectBuyerBtn.textContent = member.name;

  closeForm();
}

// Expense start---------------------------
function upsertExpense(event) {
  event.preventDefault();
  const form = document.getElementById("upsertExpenseForm");
  const formData = new FormData(form);

  // Get input
  const itemName = formData.get("expensesItemName");
  const price = formData.get("expensesPrice");
  const memberId = formData.get("expensesMemberId");
  const purchaseDate = formData.get("expensesPurchaseDate");
  const id = formData.get("expensesId");

  if (id) {
    expensesController.updateExpense(
      id,
      itemName,
      price,
      memberId,
      purchaseDate
    );
  } else {
    expensesController.addExpense(itemName, price, memberId, purchaseDate);
  }
  closeForm();
}

function openFormUpdateExpense(expense) {
  document.getElementById("expensesItemName").value = expense.item_name;
  document.getElementById("expensesPrice").value = expense.price;
  document.getElementById("expensesMemberId").value = expense.member_id;
  document.getElementById("expensesPurchaseDate").value = expense.purchase_date;
  document.getElementById("expensesId").value = expense.id;

  openForm("addExpensePopup", true);
}

async function removeExpense(id) {
  const confirmed = await showMessageConfirm("Chắc chưa bro?");
  if (confirmed) {
    // Xử lý xóa chi tiêu
    expensesController.removeExpense(id);
  }
}

// Member start---------------------------
function upsertMember(event) {
  event.preventDefault();
  const form = document.getElementById("upsertMemberForm");
  const formData = new FormData(form);

  // Get input
  const memberName = formData.get("memberName");
  const memberDefaultParkingFee = formData.get("memberDefaultParkingFee");
  const memberDefaultOtherFee = formData.get("memberDefaultOtherFee");
  const memberAvatar = formData.get("memberAvatar");
  const memberId = formData.get("memberId");

  if (memberId) {
    const memberOldImageUrl = formData.get("memberOldImageUrl");
    membersController.updateMember(
      memberId,
      memberName.trim(),
      memberDefaultParkingFee,
      memberDefaultOtherFee,
      memberAvatar,
      memberOldImageUrl
    );
  } else {
    membersController.addMember(
      memberName.trim(),
      memberDefaultParkingFee,
      memberDefaultOtherFee,
      memberAvatar
    );
  }
  closeForm();
}

function openFormUpdateMember(member) {
  // Hiển thị thông tin member
  if (member) {
    document.getElementById("memberId").value = member.id;
    document.getElementById("memberOldImageUrl").value = member.image;
    document.getElementById("memberName").value = member.name;
    document.getElementById("memberDefaultParkingFee").value =
      member.default_parking_fee;
    document.getElementById("memberDefaultOtherFee").value =
      member.default_other_fee;
    document.getElementById("memberAvatarPreview").src =
      member.image || "assets/avatarDefault.png";
  }
  openForm("addMemberPopup", true);
}

async function removeMember(memberId) {
  const confirmed = await showMessageConfirm("Chắc xóa chưa?");
  if (confirmed) {
    // Xử lý xóa thành viên
    membersController.removeMember(memberId);
  }
}

function getInputTypeDateDefaultValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Thêm 1 vì tháng bắt đầu từ 0
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
// Popup end---------------------------
function toggleDetails(button) {
  const details = button.parentElement.nextElementSibling;
  details.classList.toggle("show");
  if (details.classList.contains("show")) {
    button.textContent = "Ẩn";
  } else {
    button.textContent = "Chi tiết";
  }
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
        section.classList.remove("active");
      });

      // Hiển thị phần tương ứng
      if (targetSection) {
        targetSection.classList.add("active");
      }
    });
  });

  // Khởi tạo: chọn liên kết đầu tiên và hiển thị phần tương ứng
  navItems[0].classList.add("active");
  document.getElementById("schedule").classList.add("active");
}
// Event end
// Card start--------------------------------------------------------------------
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

// Tooltip start--------------------------------------------------------------------
const tooltip = document.getElementById("tooltip");
document.addEventListener("focusin", (event) => {
  const target = event.target;
  if (target.matches("input[data-tooltip]")) {
    tooltip.textContent = target.getAttribute("data-tooltip");
    tooltip.classList.add("active");
  }
});

document.addEventListener("focusout", () => {
  tooltip.classList.remove("active");
});
