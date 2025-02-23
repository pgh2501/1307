# SupabaseService

`SupabaseService` là một class JavaScript cung cấp các phương thức để tương tác với Supabase, bao gồm truy vấn cơ sở dữ liệu và quản lý file trong Supabase Storage.

## Tính năng

- Singleton pattern: Đảm bảo chỉ có một instance của Supabase client được tạo.
- Truy vấn cơ sở dữ liệu:
  - Thêm, cập nhật, xóa và lấy dữ liệu từ bảng.
  - Hỗ trợ điều kiện lọc, sắp xếp và chọn cột.
  - Lấy dữ liệu theo ID.
- Quản lý file trong Supabase Storage:
  - Upload, lấy public URL và xóa file.

## Cài đặt

1.  Cài đặt thư viện Supabase JavaScript client:

    ```bash
    npm install @supabase/supabase-js
    ```

2.  Tạo một instance của `SupabaseService` với URL và key của Supabase:

    ```javascript
    const SUPABASE_URL = "your_supabase_url";
    const SUPABASE_KEY = "your_supabase_anon_key";

    const supabaseService = new SupabaseService(SUPABASE_URL, SUPABASE_KEY);
    ```

## Sử dụng

### Truy vấn cơ sở dữ liệu

#### Thêm bản ghi

```javascript
const data = { name: "John Doe", age: 30 };
supabaseService.insert("users", data).then(result => {
    console.log(result);
}).catch(error => {
    console.error(error);
});
Cập nhật bản ghi
JavaScript

const filter = { id: 1 };
const data = { age: 31 };
supabaseService.update("users", filter, data).then(result => {
    console.log(result);
}).catch(error => {
    console.error(error);
});
Xóa bản ghi
JavaScript

const filter = { id: 1 };
supabaseService.delete("users", filter).then(result => {
    console.log(result);
}).catch(error => {
    console.error(error);
});
Lấy dữ liệu
JavaScript

const filters = { age: { gt: 25 } };
const columns = "name, age";
const orderBy = { column: "age", ascending: false };
supabaseService.select("users", filters, columns, orderBy).then(result => {
    console.log(result);
}).catch(error => {
    console.error(error);
});
Lấy dữ liệu theo ID
JavaScript

supabaseService.getById("users", 1).then(result => {
    console.log(result);
}).catch(error => {
    console.error(error);
});
Quản lý file trong Supabase Storage
Upload file
JavaScript

const bucket = "avatars";
const path = "profile.jpg";
const file = new File(["content"], "profile.jpg", { type: "image/jpeg" });
supabaseService.uploadFile(bucket, path, file).then(result => {
    console.log(result);
}).catch(error => {
    console.error(error);
});
Lấy public URL
JavaScript

const bucket = "avatars";
const path = "profile.jpg";
supabaseService.getFilePublicUrl(bucket, path).then(url => {
    console.log(url);
}).catch(error => {
    console.error(error);
});
Xóa file
JavaScript

const bucket = "avatars";
const path = "profile.jpg";
supabaseService.deleteFile(bucket, path).then(result => {
    console.log(result);
}).catch(error => {
    console.error(error);
});
API
constructor(supabaseUrl, supabaseKey)
Khởi tạo một instance của SupabaseService.

supabaseUrl: URL của dự án Supabase.
supabaseKey: Key anon của dự án Supabase.
async insert(table, data)
Thêm một bản ghi mới vào bảng.

async update(table, filter, data)
Cập nhật một bản ghi trong bảng.

async delete(table, filter)
Xóa các bản ghi khỏi bảng.

async select(table, filters, columns, orderBy)
Lấy dữ liệu từ bảng.

async getById(table, id)
Lấy một bản ghi từ bảng theo ID.

async uploadFile(bucket, path, file)
Upload một file lên Supabase Storage.

async getFilePublicUrl(bucket, path)
Lấy public URL của một file trong Supabase Storage.

async deleteFile(bucket, path)
Xóa một file khỏi Supabase Storage.

Lưu ý
Thay "your_supabase_url" và "your_supabase_anon_key" bằng URL và key thực tế của dự án Supabase của bạn.
Xử lý lỗi cẩn thận để đảm bảo tính ổn định của ứng dụng.
Kiểm tra policy RLS trên Supabase để đảm bảo các thao tác được cho phép.
```
