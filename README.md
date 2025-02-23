# SupabaseService

## Giới thiệu

SupabaseService là một lớp JavaScript giúp quản lý các thao tác CRUD (Create, Read, Update, Delete) với Supabase, đồng thời hỗ trợ upload và quản lý tệp trong Supabase Storage. Lớp này được thiết kế theo mẫu Singleton để đảm bảo chỉ có một instance duy nhất được khởi tạo.

## Cài đặt

```sh
npm install @supabase/supabase-js
```

## Sử dụng

### Khởi tạo instance

```javascript
import { SupabaseService } from "./SupabaseService";

const supabaseUrl = "https://your-supabase-url.supabase.co";
const supabaseKey = "your-supabase-key";

const supabaseService = new SupabaseService(supabaseUrl, supabaseKey);
```

### Các phương thức

#### 1. Thêm bản ghi vào bảng

```javascript
await supabaseService.insert("members", { name: "John Doe", age: 25 });
```

#### 2. Cập nhật bản ghi

```javascript
await supabaseService.update("members", { id: 1 }, { age: 26 });
```

#### 3. Xóa bản ghi

```javascript
await supabaseService.delete("members", { id: 1 });
```

#### 4. Lấy danh sách bản ghi

```javascript
await supabaseService.select("members", { age: { gte: 18 } });
```

#### 5. Lấy một bản ghi theo ID

```javascript
await supabaseService.getById("members", 1);
```

#### 6. Upload file lên Supabase Storage

```javascript
const file = document.querySelector("input[type=file]").files[0];
await supabaseService.uploadFile("my-bucket", "path/to/file.png", file);
```

#### 7. Lấy public URL của file

```javascript
const url = await supabaseService.getFilePublicUrl(
  "my-bucket",
  "path/to/file.png"
);
```

#### 8. Xóa file khỏi Supabase Storage

```javascript
await supabaseService.deleteFile("my-bucket", "path/to/file.png");
```

## Ghi chú

- Đảm bảo bạn đã cấu hình Supabase phù hợp với dự án của mình.
- Lớp này áp dụng mô hình Singleton để tối ưu tài nguyên.

## Tác giả

- **Nguyen-HH**
