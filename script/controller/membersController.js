class MembersController {
  constructor() {
    this.supabaseService = new SupabaseService(SUPABASE_URL, SUPABASE_KEY);
  }

  init() {
    this.showMember();
    this.setEvent();
  }
  // Show members
  async showMember() {
    try {
      const members = await this.supabaseService.getMembers();
      this.setHeaderPopup(members); // Header
      this.setMembersSection(members); // Members Section
      expensesController.setSelectOptions(members); // Add Expense Popup
      rentController.displayRentMembers(members); // Rent fucntion
      console.log("Show member: ", members);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  setEvent() {
    // click avatar in header
    document
      .getElementById("memberAvatarPreview")
      .addEventListener("click", function () {
        document.getElementById("memberAvatar").click();
      });

    // change avatar
    document
      .getElementById("memberAvatar")
      .addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            document.getElementById("memberAvatarPreview").src =
              e.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
  }

  setHeaderPopup(members) {
    const membersList = document.querySelector("#headerMemberPopup ul");

    if (members.length === 0) {
      // Xóa các phần tử hiện tại
      membersList.innerHTML = "";
      return;
    }
    membersList.innerHTML = members
      .filter((member) => member.id !== 0)
      .map(
        (member) => `
        <li>
          <button onclick="selectHeaderMember({id: '${member.id}', name: '${member.name}', image: '${member.image_url}'})">
            ${member.name}
          </button>
        </li>
      `
      )
      .join("");
  }

  setMembersSection(members) {
    const membersList = document.querySelector("#members ul");

    if (members.length === 0) {
      membersList.innerHTML = "";
      return;
    }
    const sortedMembers = [...members].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    membersList.innerHTML = sortedMembers
      .map(
        ({ id, name, image_url, default_parking_fee, default_other_fee }) => `
    <li class="card"
        data-id="${id}"
        data-name="${name}"
        data-image="${image_url}"
        data-default-parking-fee="${default_parking_fee}"
        data-default-other-fee="${default_other_fee}"
        ontouchstart="handleTouchStart(event)" 
        ontouchmove="handleTouchMove(event)" 
        ontouchend="handleTouchEnd(event)">
      <span class="card-content">
        ${name}
      </span>
      <img class="card-image" alt="User profile picture" src="${
        image_url || "assets/avatarDefault.png"
      }" />
      <div onclick="removeMember(${id})" class="card-remove">
        Remove
      </div>
    </li>
  `
      )
      .join("");

    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", this.handleCardClick);
    });
  }

  handleCardClick(event) {
    const target = event.target;
    const card = this;
    if (
      target.classList.contains("card-image") ||
      target.classList.contains("card-remove")
    ) {
      return;
    }

    const member = {
      id: card.dataset.id,
      name: card.dataset.name,
      image: card.dataset.image,
      default_parking_fee: card.dataset["defaultParkingFee"],
      default_other_fee: card.dataset["defaultOtherFee"],
    };

    openFormUpdateMember(member);
  }

  // Add members
  async addMember(
    sName,
    memberDefaultParkingFee,
    memberDefaultOtherFee,
    fAvatar
  ) {
    // Upload avatar
    const { publicUrl, avatarPath } = await this.uploadAvatar(fAvatar);

    // Thêm thành viên
    try {
      const members = await this.supabaseService.addMember(
        sName,
        memberDefaultParkingFee,
        memberDefaultOtherFee,
        publicUrl
      );
      console.log("Đã thêm thành viên: ", members);
    } catch (error) {
      console.error("Error:", error.message);
      // Nếu tải avatar thành công mà đăng ký lỗi thì xóa avatar
      if (publicUrl) {
        this.deleteAvatars(avatarPath);
      }
      return;
    }
    // Sau khi thêm, hiển thị lại danh sách thành viên
    this.showMember();
  }

  // Update member
  async updateMember(
    memberId,
    sName,
    defaultParkingFee,
    defaultOtherFee,
    fAvatar,
    oldImageUrl
  ) {
    // Upload avatar mới
    const { publicUrl, avatarPath } = await this.uploadAvatar(fAvatar);

    // Cập nhật thành viên
    try {
      const members = await this.supabaseService.updateMember(
        memberId,
        sName,
        defaultParkingFee,
        defaultOtherFee,
        publicUrl
      );
      console.log("Đã cập nhật thành viên: ", members);

      if (oldImageUrl && publicUrl && oldImageUrl !== publicUrl) {
        const oldAvatarPath = this.getFilePathFormPublicUrl(oldImageUrl);
        if (oldAvatarPath) {
          this.deleteAvatars(oldAvatarPath);
        }
      }
    } catch (error) {
      console.error("Lỗi cập nhật thành viên:", error.message);
      if (publicUrl) {
        this.deleteAvatars(avatarPath);
      }
      return;
    }
    // Sau khi cập nhật, hiển thị lại danh sách thành viên
    this.showMember();
  }

  // Delete member
  async removeMember(memberId) {
    try {
      const member = await this.supabaseService.deleteMember(memberId);

      console.log("Đã xóa thành viên: ", member);
    } catch (error) {
      console.error("Lỗi xóa thành viên:", error.message);
      return;
    }
    // Sau khi xóa, hiển thị lại danh sách thành viên
    this.showMember();
  }

  async uploadAvatar(fAvatar) {
    // Nếu không có avatar thì trả về
    if (!fAvatar || !fAvatar.name) return { publicUrl: "", avatarPath: "" };

    // Nếu có avatar thì upload
    try {
      const avatarPath = `avatars/${Date.now()}-${fAvatar.name}`;
      const avatar = await this.supabaseService.uploadFile(avatarPath, fAvatar);

      // Thành công
      if (avatar) {
        console.log("Tải lên avatar: ", avatar);
        // Lấy public url của avatar vừa upload
        const avatarPublicUrl = await this.supabaseService.getFilePublicUrl(
          avatarPath
        );

        // Nếu lấy được public url thì trả về
        // avatarPublicUrl: https://glaeuevvtsavesqrdhcr.supabase.co/storage/v1/object/public/1307/avatars/fileName.png
        // avatarPath: avatars/fileName.png
        if (avatarPublicUrl) {
          return { publicUrl: avatarPublicUrl, avatarPath: avatarPath };
        }
      }
    } catch (error) {
      console.error("Lỗi tải lên avatar:", error.message);
      return { publicUrl: "", avatarPath: "" };
    }
    return { publicUrl: "", avatarPath: "" };
  }

  async deleteAvatars(avatarPathForDelete) {
    try {
      const avatarDeleted =
        this.supabaseService.deleteFile(avatarPathForDelete);
      console.log("Đã xóa avatar: ", avatarDeleted);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  getFilePathFormPublicUrl(oldImageUrl) {
    if (!oldImageUrl) return;
    const oldAvatarPath = oldImageUrl.split("/avatars/")[1];
    if (oldAvatarPath) {
      return `avatars/${oldAvatarPath}`;
    }
    return;
  }
}
