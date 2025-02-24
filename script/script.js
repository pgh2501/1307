const SUPABASE_URL = "https://glaeuevvtsavesqrdhcr.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYWV1ZXZ2dHNhdmVzcXJkaGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzkzODcsImV4cCI6MjA1NTU1NTM4N30.01lbnToxXsAbGi6JQmv4HkcDnxIOF_HLcJcYAzHyoh8";

let selectedBuyer = null;
let currentPopup = null;
let isLoadProductsPurchased = false;

// Khởi tạo services và controllers
const membersController = new MembersController();
const scheduleController = new ScheduleController();
const expensesController = new ExpensesController();

// Init--------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  membersController.init();
  scheduleController.init();
  // expensesController.showExpenses();
  showNav();
});
// Init end

// Event start--------------------------------------------------------------------
// Popup start---------------------------
function openForm(popupId) {
  currentPopup = document.getElementById(popupId);
  currentPopup.classList.add("active");
  document.querySelector(".overlay").classList.add("active");
}

function closeForm() {
  currentPopup.classList.remove("active");
  document.querySelector(".overlay").classList.remove("active");
  resetForm(currentPopup);
}

function resetForm(currentPopup) {
  if (currentPopup) {
    const form = currentPopup.querySelector("form");
    if (form) {
      // Reset các input text, number, date, email, v.v.
      form
        .querySelectorAll(
          'input[type="text"], input[type="number"], input[type="date"], input[type="email"]'
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

        // Đặt lại memberId
        form.querySelectorAll('input[type="hidden"]').forEach((input) => {
          input.value = 0;
        });
      }
    }
  }
}

function showMessageConfirm(message) {
  return new Promise((resolve) => {
    const confirmPopup = document.getElementById("messageConfirmPopup");
    const confirmMessage = document.getElementById("confirmMessage");
    const confirmYes = document.getElementById("confirmYes");
    const confirmNo = document.getElementById("confirmNo");

    confirmMessage.textContent = message;

    confirmYes.onclick = () => {
      resolve(true);
      closeConfirmPopup();
    };

    confirmNo.onclick = () => {
      resolve(false);
      closeConfirmPopup();
    };

    confirmPopup.classList.add("active");
    document.querySelector(".overlay").classList.add("active");

    function closeConfirmPopup() {
      confirmPopup.classList.remove("active");
      document.querySelector(".overlay").classList.remove("active");
      confirmYes.onclick = null;
      confirmNo.onclick = null;
    }
  });
}

function openFormUpdateMember(popupId, member) {
  // Hiển thị thông tin member
  if (member) {
    document.getElementById("memberId").value = member.id;
    document.getElementById("memberOldImageUrl").value = member.image;
    document.getElementById("memberName").value = member.name;
    document.getElementById("memberAvatarPreview").src =
      member.image || "assets/avatarDefault.png";
    document.getElementById("memberBtnSubmit").textContent = "Lưu";
  }
  openForm(popupId);
}

function selectHeaderMember(buyer) {
  const selectBuyerBtn = document.querySelector(".select-buyer-btn");
  const profileImg = document.querySelector(".profile img");

  selectedBuyer = buyer;

  if (buyer.image) {
    profileImg.src = buyer.image;
  } else {
    profileImg.src = "assets/avatarDefault.png";
  }
  selectBuyerBtn.textContent = buyer.name;

  closeForm();
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

function upsertMember(event) {
  event.preventDefault();
  const form = document.getElementById("upsertMemberForm");
  const formData = new FormData(form);

  // Get input
  const memberName = formData.get("memberName");
  const memberAvatar = formData.get("memberAvatar");
  const memberId = formData.get("memberId");

  if (parseInt(memberId) === 0) {
    membersController.addMember(memberName.trim(), memberAvatar);
  } else {
    const memberOldImageUrl = formData.get("memberOldImageUrl");
    membersController.updateMember(
      memberId,
      memberName.trim(),
      memberAvatar,
      memberOldImageUrl
    );
  }
  closeForm();
}

async function removeMember(memberId) {
  const confirmed = await showMessageConfirm("M chắc chưa?");
  if (confirmed) {
    // Xử lý xóa thành viên
    membersController.removeMember(memberId);
  }
}

// Popup end---------------------------
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

// test dragging
// function getDragAfterElement(scheduleList, y) {
//   const draggableElements = [
//     ...scheduleList.querySelectorAll("li:not(.dragging)"),
//   ];

//   return draggableElements.reduce(
//     (closest, child) => {
//       const box = child.getBoundingClientRect();
//       const offset = y - box.top - box.height / 2;
//       if (offset < 0 && offset > closest.offset) {
//         return { offset: offset, element: child };
//       } else {
//         return closest;
//       }
//     },
//     { offset: Number.NEGATIVE_INFINITY }
//   ).element;
// }
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
