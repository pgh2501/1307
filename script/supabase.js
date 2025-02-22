// const SUPABASE_URL = "https://xlymqphhcstxyogutnvm.supabase.co";
// const SUPABASE_KEY =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhseW1xcGhoY3N0eHlvZ3V0bnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1MTA0MzcsImV4cCI6MjA1MjA4NjQzN30.6osZdbJCDKfqupnJe-APntn2F2KvGaDX_azXaDXNwZc";

// V2
const SUPABASE_URL = "https://glaeuevvtsavesqrdhcr.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYWV1ZXZ2dHNhdmVzcXJkaGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzkzODcsImV4cCI6MjA1NTU1NTM4N30.01lbnToxXsAbGi6JQmv4HkcDnxIOF_HLcJcYAzHyoh8";

class SupabaseService {
  static instance;
  bucketName = "1307";
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

  // Common
  async uploadFile(filePath, file) {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, file);
    if (error) {
      throw new Error(`Lỗi tải lên file: ${error.message}`);
    }
    return data;
  }

  async deleteFile(filePath) {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([filePath]);
    if (error) {
      throw new Error(`Failed to fetch member: ${error.message}`);
    }
    return { data };
  }

  async getFilePublicUrl(filePath) {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  // Users
  async getMembers() {
    const { data, error } = await this.supabase
      .from("members")
      .select("*")
      .eq("active", true)
      .order("id", { ascending: true });
    if (error) {
      throw new Error(`Failed to fetch member: ${error.message}`);
    }
    return data;
  }

  async addMember(sName, sImageUrl) {
    const { data, error } = await this.supabase
      .from("members")
      .insert([
        {
          name: sName,
          image_url: sImageUrl,
        },
      ])
      .select();
    if (error) {
      throw new Error(`Failed to add members: ${error.message}`);
    }
    return data;
  }

  async updateMember(iMemberId, sName, sImageUrl) {
    let updateData = { name: sName };
    if (sImageUrl) {
      updateData.image_url = sImageUrl;
    }
    const { data, error } = await this.supabase
      .from("members")
      .update(updateData)
      .eq("id", iMemberId)
      .select();
    if (error) {
      throw new Error(`Failed to update members: ${error.message}`);
    }
    return data;
  }

  async deleteMember(iMemberId) {
    const { data, error } = await this.supabase
      .from("members")
      .update({ active: "false" })
      .eq("id", iMemberId)
      .select();
    if (error) {
      throw new Error(`Failed to delete members: ${error.message}`);
    }
    return data;
  }

  // Cleaning Schedule
  async getCleaningSchedule() {
    const { data, error } = await this.supabase
      .from("CleaningSchedule")
      .select("id, user_id, day_of_week, Users(name)")
      .order("id", { ascending: true });
    if (error) {
      throw new Error(`Failed to fetch cleaning schedule: ${error.message}`);
    }
    const result = data.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      day_of_week: item.day_of_week,
      name: item.Users.name, // Lấy name từ Users
    }));
    return result;
  }

  // Product Purchase
  async addProductPurchase(userId, productName, price, purchaseDate) {
    const { data, error } = await this.supabase
      .from("ProductsPurchased")
      .insert([
        {
          user_id: userId,
          product_name: productName,
          price,
          purchase_date: purchaseDate,
        },
      ]);
    if (error) {
      throw new Error(`Failed to add product purchase: ${error.message}`);
    }
    return data;
  }

  async getProductsPurchased() {
    const { data, error } = await this.supabase
      .from("ProductsPurchased")
      .select("*, Users(name)");
    if (error) {
      throw new Error(`Failed to fetch purchased products: ${error.message}`);
    }
    const result = data.map((item) => ({
      buyer: item.Users.name, // Lấy name từ Users
      product: item.product_name,
      price: item.price,
      date: item.purchase_date,
    }));
    return result;
  }
}
