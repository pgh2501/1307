class SupabaseService {
  static instance;
  static TABLE_MEMBERS = Object.freeze("members");
  static TABLE_SCHEDULE = Object.freeze("schedule");
  static TABLE_EXPENSES = Object.freeze("expenses");
  static TABLE_RENT = Object.freeze("rent");
  static TABLE_RENT_MEMBERS = Object.freeze("rent_members");

  constructor(supabaseUrl, supabaseKey) {
    if (SupabaseService.instance) {
      return SupabaseService.instance; // Trả về instance đã tồn tại
    }

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase URL and Key are required to initialize!");
    }

    this.supabase = supabase.createClient(supabaseUrl, supabaseKey);
    SupabaseService.instance = this; // Lưu instance vào static property
  }

  /**
   * Thêm một bản ghi mới vào bảng.
   * @param {string} table - Tên bảng.
   * @param {object} data - Dữ liệu cần thêm vào bảng (object).
   * @returns {Promise<Array>} - Promise trả về mảng dữ liệu đã thêm.
   */
  async insert(table, data) {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert([data])
      .select();

    if (error) {
      throw new Error(`Lỗi insert vào bảng ${table}: ${error.message}`);
    }
    return result;
  }

  /**
   * Cập nhật một bản ghi trong bảng dựa trên điều kiện lọc.
   * @param {string} table - Tên bảng.
   * @param {object} filter - Điều kiện lọc (object).
   * @param {object} data - Dữ liệu cần cập nhật (object).
   * @returns {Promise<Array>} - Promise trả về mảng dữ liệu đã cập nhật.
   */
  async update(table, filter, data) {
    let query = this.supabase.from(table).update(data);

    for (const key in filter) {
      query = query.eq(key, filter[key]);
    }

    const { data: result, error } = await query.select();

    if (error) {
      throw new Error(`Lỗi update bảng ${table}: ${error.message}`);
    }
    return result;
  }

  /**
   * Xóa các bản ghi khỏi bảng dựa trên điều kiện lọc.
   * @param {string} table - Tên bảng.
   * @param {object} filter - Điều kiện lọc (object).
   * @returns {Promise<Array>} - Promise trả về mảng dữ liệu đã xóa.
   */
  async delete(table, filter) {
    let query = this.supabase.from(table).delete();

    for (const key in filter) {
      query = query.eq(key, filter[key]);
    }

    const { data: result, error } = await query.select();

    if (error) {
      throw new Error(`Lỗi delete từ bảng ${table}: ${error.message}`);
    }
    return result;
  }

  /**
   * Lấy dữ liệu từ bảng với điều kiện lọc, cột cụ thể và sắp xếp.
   * @param {string} table - Tên bảng.
   * @param {object} [filters={}] - Điều kiện lọc (object).
   * @param {string} [columns='*'] - Các cột cần lấy (chuỗi, mặc định là '*').
   * @param {object|string} [orderBy={ column: 'id', ascending: true }] - Điều kiện sắp xếp (object hoặc chuỗi).
   * @returns {Promise<Array>} - Promise trả về mảng dữ liệu.
   */
  async select(
    table,
    filters = {},
    columns = "*",
    orderBy = { column: "id", ascending: true }
  ) {
    let query = this.supabase.from(table).select(columns);

    // Áp dụng điều kiện lọc
    for (const key in filters) {
      const value = filters[key];
      if (typeof value === "object" && value !== null) {
        // Xử lý các toán tử so sánh
        for (const operator in value) {
          switch (operator) {
            case "gt":
              query = query.gt(key, value[operator]);
              break;
            case "lt":
              query = query.lt(key, value[operator]);
              break;
            case "gte":
              query = query.gte(key, value[operator]);
              break;
            case "lte":
              query = query.lte(key, value[operator]);
              break;
            case "like":
              query = query.like(key, value[operator]);
              break;
            case "ilike":
              query = query.ilike(key, value[operator]);
              break;
            case "is":
              query = query.is(key, value[operator]);
              break;
            case "in":
              query = query.in(key, value[operator]);
              break;
            case "neq":
              query = query.neq(key, value[operator]);
              break;
            case "contains":
              query = query.contains(key, value[operator]);
              break;
            case "containedBy":
              query = query.containedBy(key, value[operator]);
              break;
            default:
              console.warn(`Toán tử không được hỗ trợ: ${operator}`);
              break;
          }
        }
      } else {
        // Xử lý điều kiện eq (equal)
        query = query.eq(key, value);
      }
    }

    // Áp dụng sắp xếp
    if (typeof orderBy === "string") {
      // Sắp xếp theo một cột, mặc định tăng dần
      query = query.order(orderBy);
    } else if (typeof orderBy === "object" && orderBy !== null) {
      // Sắp xếp theo cột và hướng (tăng dần hoặc giảm dần)
      query = query.order(orderBy.column, { ascending: orderBy.ascending });
    }

    const { data: result, error } = await query;

    if (error) {
      throw new Error(`Lỗi select từ bảng ${table}: ${error.message}`);
    }
    return result;
  }

  /**
   * Lấy một bản ghi từ bảng theo ID.
   * @param {string} table - Tên bảng.
   * @param {number|string} id - ID của bản ghi cần lấy.
   * @returns {Promise<object>} - Promise trả về object dữ liệu.
   */
  async getById(table, id) {
    const { data, error } = await this.supabase
      .from(table)
      .select()
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(
        `Lỗi lấy dữ liệu từ bảng ${table} với id ${id}: ${error.message}`
      );
    }
    return data;
  }

  /**
   * Truy vấn dữ liệu từ một view trong Supabase.
   * @param {string} viewName - Tên view cần truy vấn.
   * @returns {Promise<Array>} - Promise trả về mảng dữ liệu từ view.
   * @throws {Error} - Ném lỗi nếu truy vấn thất bại.
   */
  async getViewData(viewName) {
    try {
      const { data, error } = await this.supabase.from(viewName).select("*");

      if (error) {
        throw new Error(
          `Failed to fetch data from view ${viewName}: ${error.message}`
        );
      }
      return data;
    } catch (error) {
      console.error("Error in getViewData:", error);
      throw error; // Re-throw the error to be handled by the caller.
    }
  }

  /**
   * Upload một file lên Supabase Storage.
   * @param {string} bucket - Tên bucket.
   * @param {string} path - Đường dẫn đến file.
   * @param {File} file - File cần upload.
   * @returns {Promise<object>} - Promise trả về object dữ liệu.
   */
  async uploadFile(bucket, path, file) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) {
      throw new Error(`Lỗi upload file lên bucket ${bucket}: ${error.message}`);
    }
    return data;
  }

  /**
   * Lấy public URL của một file trong Supabase Storage.
   * @param {string} bucket - Tên bucket.
   * @param {string} path - Đường dẫn đến file.
   * @returns {Promise<string>} - Promise trả về public URL.
   */
  async getFilePublicUrl(bucket, path) {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Xóa một file khỏi Supabase Storage.
   * @param {string} bucket - Tên bucket.
   * @param {string} path - Đường dẫn đến file.
   * @returns {Promise<void>} - Promise không trả về giá trị.
   */
  async deleteFile(bucket, path) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);
    if (error) {
      throw new Error(`Lỗi xóa file từ bucket ${bucket}: ${error.message}`);
    }
    return data;
  }

  //TABLE_MEMBERS--------------------------------------------------------------------------
  async getMembers() {
    const members = await this.select(SupabaseService.TABLE_MEMBERS, {
      active: true,
    });
    return members;
  }

  async addMember(sName, defaultParkingFee, defaultOtherFee, sImageUrl) {
    let insertData = {
      name: sName,
    };
    if (sImageUrl) {
      updateData.image_url = sImageUrl;
    }
    if (defaultParkingFee) {
      updateData.default_parking_fee = defaultParkingFee;
    }
    if (defaultOtherFee) {
      updateData.default_other_fee = defaultOtherFee;
    }
    const member = this.insert(SupabaseService.TABLE_MEMBERS, insertData);
    return member;
  }

  async updateMember(id, sName, defaultParkingFee, defaultOtherFee, sImageUrl) {
    let updateData = {
      name: sName,
    };
    if (sImageUrl) {
      updateData.image_url = sImageUrl;
    }
    if (defaultParkingFee) {
      updateData.default_parking_fee = defaultParkingFee;
    } else {
      updateData.default_parking_fee = 0;
    }
    if (defaultOtherFee) {
      updateData.default_other_fee = defaultOtherFee;
    } else {
      updateData.default_other_fee = 0;
    }
    const data = this.update(
      SupabaseService.TABLE_MEMBERS,
      { id: id },
      updateData
    );
    return data;
  }

  async deleteMember(id) {
    const data = this.update(
      SupabaseService.TABLE_MEMBERS,
      { id: id },
      { active: false }
    );
    return data;
  }
  //--------------------------------------------------------------------------

  //TABLE_SCHEDULE------------------------------------------------------------
  async getSchedule() {
    const data = await this.getViewData("schedule_with_members_name");
    return data;
  }
  //--------------------------------------------------------------------------

  //TABLE_EXPENSES------------------------------------------------------------
  async getExpenses() {
    const expenses = await this.select(
      SupabaseService.TABLE_EXPENSES,
      {},
      "*, members(name)",
      "member_id"
    );
    return expenses;
  }

  async getExpensesByMemberId(memberId) {
    const expenses = await this.select(
      SupabaseService.TABLE_EXPENSES,
      { member_id: memberId },
      "*, members(name)"
    );
    return expenses;
  }

  async addExpense(itemName, price, memberId, purchaseDate) {
    const expense = this.insert(SupabaseService.TABLE_EXPENSES, {
      item_name: itemName,
      price: price,
      member_id: memberId,
      purchase_date: purchaseDate,
    });
    return expense;
  }

  async updateExpense(id, itemName, price, memberId, purchaseDate) {
    const expense = this.update(
      SupabaseService.TABLE_EXPENSES,
      { id: id },
      {
        item_name: itemName,
        price: price,
        member_id: memberId,
        purchase_date: purchaseDate,
      }
    );
    return expense;
  }

  async deleteExpense(id) {
    const expense = this.delete(SupabaseService.TABLE_EXPENSES, { id: id });
    return expense;
  }
  //--------------------------------------------------------------------------

  //TABLE_RENT----------------------------------------------------------------
  //--------------------------------------------------------------------------

  //TABLE_RENT_MEMBERS--------------------------------------------------------
  //--------------------------------------------------------------------------
}
