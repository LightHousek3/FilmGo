# FilmGo Cinema API Guide - Movie & Showtime

## 📋 Mục Lục
- [Movie API](#movie-api)
- [Showtime API](#showtime-api)
- [Business Logic](#business-logic)
- [Error Codes](#error-codes)
- [Enums](#enums)

---

## Movie API

### 1. List Movies (with filters & pagination)

**Description:** Lấy danh sách phim với hỗ trợ lọc, sắp xếp, phân trang  
**Method:** `GET`  
**Endpoint:** `/api/v1/movies`  
**Authentication:** No (Public)

#### Query Parameters:
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `title` | string | Tìm kiếm theo tên phim | `The Avengers` |
| `genres` | string | ObjectId các thể loại | `507f1f77bcf86cd799439011` |
| `type` | string | Loại phim (2D, 3D) | `2D` |
| `origin` | string | Quốc gia sản xuất | `USA` |
| `ageRating` | string | Chứng chỉ phân loại (P, K, T13, T16, T18, C) | `T16` |
| `releaseDate` | date | Ngày phát hành (ISO 8601) | `2024-01-01` |
| `endDate` | date | Ngày kết thúc chiếu | `2024-12-31` |
| `location` | string | Địa điểm rạp chiếu | `Hà Nội` |
| `sortBy` | string | Sắp xếp (format: `field:asc` or `field:desc`) | `title:asc` |
| `limit` | number | Số bản ghi/trang (1-100, default: 10) | `20` |
| `page` | number | Số trang (default: 1) | `2` |
| `populate` | string | Populate relation (comma-separated) | `genres` |

#### Response: 200 OK
```json
{
  "status": "success",
  "message": "Movies list fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "The Avengers",
      "genres": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Action"
        }
      ],
      "description": "...",
      "author": "Joss Whedon",
      "image": {
        "url": "https://...",
        "publicId": "filmgo/..."
      },
      "trailer": {
        "url": "https://...",
        "publicId": "filmgo/..."
      },
      "type": "2D",
      "duration": 143,
      "origin": "USA",
      "releaseDate": "2012-05-04T00:00:00.000Z",
      "endDate": "2012-08-31T23:59:59.999Z",
      "ageRating": "T13",
      "actors": ["Robert Downey Jr.", "Chris Evans"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalResults": 150,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Error Cases:
| Status | Error | Description |
|--------|-------|-------------|
| 400 | Validation failed | Parameters không hợp lệ |

---

### 2. Get Movie by ID

**Description:** Lấy chi tiết một bộ phim theo ID  
**Method:** `GET`  
**Endpoint:** `/api/v1/movies/:id`  
**Authentication:** No (Public)

#### URL Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | ObjectId | Yes | ID của bộ phim (24-char hex string) |

#### Response: 200 OK
```json
{
  "status": "success",
  "message": "Movie fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "The Avengers",
    "genres": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Action"
      }
    ],
    "description": "...",
    "author": "Joss Whedon",
    "image": { "url": "...", "publicId": "..." },
    "trailer": { "url": "...", "publicId": "..." },
    "type": "2D",
    "duration": 143,
    "origin": "USA",
    "releaseDate": "2012-05-04T00:00:00.000Z",
    "endDate": "2012-08-31T23:59:59.999Z",
    "ageRating": "T13",
    "actors": ["Robert Downey Jr.", "Chris Evans"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Error Cases:
| Status | Error | Description |
|--------|-------|-------------|
| 404 | Movie not found | ID không tồn tại |
| 400 | Invalid ID format | ID không phải ObjectId hợp lệ |

---

### 3. Get Now-Showing Movies

**Description:** Lấy danh sách phim đang chiếu (releaseDate ≤ now ≤ endDate)  
**Method:** `GET`  
**Endpoint:** `/api/v1/movies/now-showing`  
**Authentication:** No (Public)

#### Query Parameters:
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `location` | string | Địa điểm rạp chiếu | `Hà Nội` |
| `sortBy` | string | Sắp xếp | `title:asc` |
| `limit` | number | Số bản ghi/trang | `20` |
| `page` | number | Số trang | `1` |
| `populate` | string | Populate relation | `genres` |

#### Response: 200 OK
Cấu trúc giống với List Movies endpoint

#### Error Cases:
| Status | Error | Description |
|--------|-------|-------------|
| 400 | Validation failed | Query params không hợp lệ |

---

### 4. Get Upcoming Movies

**Description:** Lấy danh sách phim sắp chiếu (releaseDate > now)  
**Method:** `GET`  
**Endpoint:** `/api/v1/movies/coming-soon`  
**Authentication:** No (Public)

#### Query Parameters:
Giống với Now-Showing Movies endpoint

#### Response: 200 OK
Cấu trúc giống với List Movies endpoint

---

### 5. Create Movie ⭐ ADMIN ONLY

**Description:** Tạo bộ phim mới  
**Method:** `POST`  
**Endpoint:** `/api/v1/movies`  
**Authentication:** Required (Admin)

#### Headers:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body:
```json
{
  "title": "The Avengers",
  "genres": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
  "description": "Earth's mightiest heroes",
  "author": "Joss Whedon",
  "image": {
    "url": "https://example.com/poster.jpg",
    "publicId": "filmgo/movie1"
  },
  "trailer": {
    "url": "https://example.com/trailer.mp4",
    "publicId": "filmgo/trailer1"
  },
  "type": "2D",
  "duration": 143,
  "origin": "USA",
  "releaseDate": "2024-05-04T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "ageRating": "T13",
  "actors": ["Robert Downey Jr.", "Chris Evans"]
}
```

#### Required Fields:
- `title` (string)
- `releaseDate` (ISO 8601 date)
- `endDate` (ISO 8601 date, must be > releaseDate)

#### Optional Fields:
- `genres` (array of ObjectIds)
- `description` (string)
- `author` (string)
- `image` (object with url, publicId)
- `trailer` (object with url, publicId)
- `type` (2D, 3D)
- `duration` (number, phút)
- `origin` (string)
- `ageRating` (P, K, T13, T16, T18, C)
- `actors` (array of strings)

#### Response: 201 Created
```json
{
  "status": "success",
  "message": "Movie created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "The Avengers",
    ...
  }
}
```

#### Error Cases:
| Status | Error | Description |
|--------|-------|-------------|
| 400 | Validation failed | Body không hợp lệ hoặc endDate ≤ releaseDate |
| 401 | Unauthorized | Chưa authenticate |
| 403 | Forbidden | Người dùng không phải Admin |
| 409 | Movie already exists | Phim với tiêu đề đó đã tồn tại |

---

### 6. Update Movie ⭐ ADMIN ONLY

**Description:** Cập nhật thông tin phim  
**Method:** `PUT`  
**Endpoint:** `/api/v1/movies/:id`  
**Authentication:** Required (Admin)

#### Business Logic:
- **Không được rút ngắn khung chiếu:** Nếu phim đã có showtime, không được update `releaseDate` > earliest showtime hoặc `endDate` < latest showtime
- **Validation:** Nếu cập nhật cả `releaseDate` và `endDate`, bắt buộc `releaseDate < endDate`

#### Headers:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### URL Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | ObjectId | Yes | ID của phim (24-char hex string) |

#### Request Body:
```json
{
  "title": "The Avengers: Updated",
  "description": "...",
  "releaseDate": "2024-05-04T00:00:00Z",
  "endDate": "2024-09-30T23:59:59Z"
}
```

#### Notes:
- Tất cả fields là optional, ít nhất phải cập nhật 1 field
- Các fields không gửi sẽ giữ nguyên giá trị cũ

#### Response: 200 OK
```json
{
  "status": "success",
  "message": "Movie updated successfully",
  "data": { ... }
}
```

#### Error Cases:
| Status | Error | Description |
|--------|-------|-------------|
| 400 | Validation failed | Body không hợp lệ |
| 400 | Cannot shorten movie release window | Cố gắng rút ngắn khi có showtime |
| 404 | Movie not found | ID không tồn tại |
| 401 | Unauthorized | Chưa authenticate |
| 403 | Forbidden | Không phải Admin |

---

### 7. Delete Movie ⭐ ADMIN ONLY

**Description:** Xóa mềm một bộ phim (soft delete - không xóa vĩnh viễn)  
**Method:** `DELETE`  
**Endpoint:** `/api/v1/movies/:id`  
**Authentication:** Required (Admin)

#### Headers:
```
Authorization: Bearer <access_token>
```

#### URL Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | ObjectId | Yes | ID của phim |

#### Response: 200 OK
```json
{
  "status": "success",
  "message": "Movie deleted successfully"
}
```

#### Error Cases:
| Status | Error | Description |
|--------|-------|-------------|
| 404 | Movie not found | ID không tồn tại |
| 401 | Unauthorized | Chưa authenticate |
| 403 | Forbidden | Không phải Admin |

---

## Showtime API

### 1. List Showtimes (with filters & pagination)

**Description:** Lấy danh sách suất chiếu với hỗ trợ lọc, sắp xếp, phân trang  
**Method:** `GET`  
**Endpoint:** `/api/v1/showtimes`  
**Authentication:** No (Public)

#### Query Parameters:
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `movie` | ObjectId | Lọc suất chiếu theo movie ID | `69b40a4d2c78cf2966139101` |
| `status` | string | Trạng thái (UPCOMING, NOW_SHOWING, ENDED) | `UPCOMING` |
| `date` | date | Lọc suất chiếu theo ngày (ISO 8601) | `2024-05-04` |
| `startTime` | date | Thời gian bắt đầu từ (ISO 8601) | `2024-05-04T09:00:00Z` |
| `endTime` | date | Thời gian bắt đầu đến (ISO 8601) | `2024-05-04T23:00:00Z` |
| `location` | string | Địa điểm rạp chiếu | `Hà Nội` |
| `sortBy` | string | Sắp xếp (field:asc, field:desc) | `startTime:asc` |
| `limit` | number | Số bản ghi/trang | `20` |
| `page` | number | Số trang | `1` |
| `populate` | string | Populate relation (comma-separated) | `movie,screen` |

#### Notes:
- `status` là **virtual field** (không lưu cứng trong DB), được tính theo thời gian thực:
  - `ENDED` khi `endTime <= now`
  - `UPCOMING` khi `startTime > now`
  - ngược lại là `NOW_SHOWING`

#### Response: 200 OK
```json
{
  "status": "success",
  "message": "Showtimes list fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "status": "UPCOMING",
      "startTime": "2024-05-04T10:00:00Z",
      "endTime": "2024-05-04T12:23:00Z",
      "movie": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "The Avengers",
        "genres": [{ "_id": "507f1f77bcf86cd799439012", "name": "Action" }],
        "duration": 143,
        "ageRating": "T13"
      },
      "screen": {
        "_id": "507f1f77bcf86cd799439015",
        "name": "Screen A",
        "seatCapacity": 120,
        "theater": {
          "_id": "507f1f77bcf86cd799439016",
          "name": "Lotte Cinema",
          "location": "Hà Nội",
          "address": "86 Duy Tân, Cầu Giấy, Hà Nội"
        }
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalResults": 250,
    "totalPages": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Error Cases:
| Status | Error | Description |
|--------|-------|-------------|
| 400 | Validation failed | Query params không hợp lệ |

---

### 2. Get Showtime by ID

**Description:** Lấy chi tiết một suất chiếu theo ID  
**Method:** `GET`  
**Endpoint:** `/api/v1/showtimes/:id`  
**Authentication:** No (Public)

#### URL Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | ObjectId | Yes | ID của suất chiếu (24-char hex string) |

#### Query Parameters:
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `populate` | string | Populate relation (comma-separated) | `movie,screen` |

#### Populate behavior:
- Mặc định `GET /showtimes/:id` **không populate** `movie` và `screen`.
- Chỉ populate khi truyền `populate`.
- Hỗ trợ: `movie`, `movie.genres`, `screen`, `screen.theater`.

#### Response: 200 OK
Cấu trúc giống trong List Showtimes response data

#### Error Cases:
| Status | Error | Description |
|--------|-------|-------------|
| 404 | Showtime not found | ID không tồn tại |
| 400 | Invalid ID format | ID không hợp lệ |

---

### 3. Create Showtime ⭐ ADMIN ONLY

**Description:** Tạo suất chiếu mới  
**Method:** `POST`  
**Endpoint:** `/api/v1/showtimes`  
**Authentication:** Required (Admin)

#### Business Logic:
- **Suất chiếu trong khung chiếu phim:** `releaseDate ≤ startTime` và `endTime ≤ endDate`
- **Không trùng thời gian:** Cùng screen không được chồng + buffer 30 phút giữa các suất
- **Thời gian hợp lệ:** `startTime < endTime`
- **Thời lượng suất chiếu hợp lệ:** `(endTime - startTime)` phải **≥** `movie.duration` (đơn vị phút)
- **Duration của movie phải hợp lệ:** movie phải có `duration > 0`

#### Headers:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body:
```json
{
  "startTime": "2024-05-04T10:00:00Z",
  "endTime": "2024-05-04T12:23:00Z",
  "movie": "507f1f77bcf86cd799439011",
  "screen": "507f1f77bcf86cd799439015"
}
```

#### Required Fields:
- `startTime` (ISO 8601 date)
- `endTime` (ISO 8601 date, must be > startTime)
- `movie` (ObjectId, phải là bộ phim hợp lệ)
- `screen` (ObjectId, phải là phòng chiếu hợp lệ)

#### Optional Fields:
- Không có optional field.
- `status` được tính tự động (virtual), không nhận từ request body.

#### Response: 201 Created
```json
{
  "status": "success",
  "message": "Showtime created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    ...
  }
}
```

#### Error Cases:
| Status | Error | Description |
|--------|-------|-------------|
| 400 | Validation failed | Body không hợp lệ |
| 400 | endTime must be greater than startTime | startTime ≥ endTime |
| 400 | Movie not found | Movie ID không tồn tại |
| 400 | Screen not found | Screen ID không tồn tại |
| 400 | Movie must have releaseDate and endDate | Phim chưa cấu hình thời gian chiếu |
| 400 | Movie must have a valid duration (minutes) before creating showtimes | Phim chưa cấu hình duration hợp lệ (> 0) |
| 400 | Showtime must be within movie releaseDate and endDate | Suất nằm ngoài khung chiếu phim |
| 400 | Showtime duration must be at least movie duration (X minutes) | Thời lượng suất chiếu ngắn hơn duration của phim |
| 409 | Showtime overlaps with another showtime | Chồng lấn với suất khác (< 30 phút) |
| 409 | Showtime already exists | Suất chiếu này đã tồn tại |
| 401 | Unauthorized | Chưa authenticate |
| 403 | Forbidden | Không phải Admin |

---

### 4. Update Showtime ⭐ ADMIN ONLY

**Description:** Cập nhật thông tin suất chiếu  
**Method:** `PUT`  
**Endpoint:** `/api/v1/showtimes/:id`  
**Authentication:** Required (Admin)

#### Business Logic:
- Cùng các ràng buộc như Create Showtime
- Nếu cập nhật cả `startTime` và `endTime`, bắt buộc `startTime < endTime`
- Luôn kiểm tra `(endTime - startTime) ≥ movie.duration` sau cập nhật (kể cả khi đổi `movie` hoặc chỉ đổi thời gian)
- Không cho phép cập nhật nếu showtime đã có booking ở trạng thái `PENDING` hoặc `CONFIRMED`
- Exclude chính nó khi check overlap

#### Headers:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### URL Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | ObjectId | Yes | ID của suất chiếu |

#### Request Body:
```json
{
  "startTime": "2024-05-04T10:30:00Z",
  "endTime": "2024-05-04T13:00:00Z"
}
```

#### Notes:
- Tất cả fields là optional, ít nhất phải cập nhật 1 field
- Các fields không gửi sẽ giữ nguyên giá trị cũ
- `status` không được phép cập nhật trực tiếp, hệ thống tự tính theo thời gian

#### Response: 200 OK
```json
{
  "status": "success",
  "message": "Showtime updated successfully",
  "data": { ... }
}
```

#### Error Cases:
Giống Create Showtime + thêm:
| Status | Error | Description |
|--------|-------|-------------|
| 404 | Showtime not found | ID không tồn tại |
| 409 | Cannot modify or delete showtime because active bookings already exist | Showtime đã có booking active (`PENDING`/`CONFIRMED`) |

---

### 5. Delete Showtime ⭐ ADMIN ONLY

**Description:** Xóa mềm một suất chiếu (soft delete)  
**Method:** `DELETE`  
**Endpoint:** `/api/v1/showtimes/:id`  
**Authentication:** Required (Admin)

#### Business Logic:
- Không cho phép xóa nếu showtime đã có booking ở trạng thái `PENDING` hoặc `CONFIRMED`

#### Headers:
```
Authorization: Bearer <access_token>
```

#### URL Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | ObjectId | Yes | ID của suất chiếu |

#### Response: 200 OK
```json
{
  "status": "success",
  "message": "Showtime deleted successfully"
}
```

#### Error Cases:
| Status | Error | Description |
|--------|-------|-------------|
| 404 | Showtime not found | ID không tồn tại |
| 409 | Cannot modify or delete showtime because active bookings already exist | Showtime đã có booking active (`PENDING`/`CONFIRMED`) |
| 401 | Unauthorized | Chưa authenticate |
| 403 | Forbidden | Không phải Admin |

---

## Business Logic

### Movie Rules
1. **Thời gian chiếu**: Bắt buộc `releaseDate < endDate`
2. **Thời gian chiếu không thể rút ngắn**: Nếu phim đã có showtime, không được update `releaseDate` sau earliest showtime hoặc `endDate` trước latest showtime
3. **Title unique**: Không được có 2 phim cùng tên
4. **Soft delete**: Xóa phim không xóa vĩnh viễn, để truy vết

### Showtime Rules
1. **Thời gian suất chiếu hợp lệ**: `startTime < endTime`
2. **Nằm trong khung chiếu phim**: `movie.releaseDate ≤ startTime` và `endTime ≤ movie.endDate`
3. **Thời lượng suất chiếu không ngắn hơn phim**: `(endTime - startTime) ≥ movie.duration` (phút)
4. **Không chồng lấn**: Cùng screen không được overlap, phải cách nhau ≥ 30 phút (configurable)
5. **Screen hợp lệ**: Screen phải tồn tại trong database
6. **Movie hợp lệ**: Movie phải tồn tại trong database và phải có `releaseDate`, `endDate`, `duration > 0`
7. **Không cho chỉnh sửa khi đã có booking active**: Nếu showtime đã có booking `PENDING` hoặc `CONFIRMED` thì không được update/delete
8. **Soft delete**: Xóa suất chiếu không xóa vĩnh viễn
9. **Status virtual**: `status` không lưu trong DB, luôn tính động theo `startTime/endTime`

### Configuration
```javascript
// src/constants/index.js
const SHOWTIME_BUFFER_MINUTES = 30; // Min gap between showtimes in same screen
```

---

## Error Codes

| HTTP Code | Scenario | Description |
|-----------|----------|-------------|
| 200 | Success | Request thành công |
| 201 | Created | Resource được tạo thành công |
| 400 | Bad Request | Validation failed, invalid params, business rule violation |
| 401 | Unauthorized | Chưa authenticate hoặc token không hợp lệ |
| 403 | Forbidden | Không có quyền truy cập (không phải Admin) |
| 404 | Not Found | Resource không tồn tại |
| 409 | Conflict | Duplicate resource hoặc conflict business rule |
| 500 | Internal Server Error | Server error |

---

## Enums

### Movie Type
```javascript
MOVIE_TYPE = {
  TWO_D: '2D',
  THREE_D: '3D'
}
```

### Age Rating
```javascript
AGE_RATING = {
  P: 'P',      // General audience
  K: 'K',      // Under 6
  T13: 'T13',  // 13+
  T16: 'T16',  // 16+
  T18: 'T18',  // 18+
  C: 'C'       // Restricted
}
```

### Showtime Status
```javascript
SHOWTIME_STATUS = {
  UPCOMING: 'UPCOMING',
  NOW_SHOWING: 'NOW_SHOWING',
  ENDED: 'ENDED'
}
```

---

## Common Response Structure

### Success Response (200, 201)
```json
{
  "status": "success",
  "message": "Description of what happened",
  "data": { /* Resource data */ }
}
```

### Paginated Response
```json
{
  "status": "success",
  "message": "List fetched successfully",
  "data": [ /* Array of resources */ ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalResults": 150,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response
```json
{
  "status": "fail",
  "message": "Error description",
  "statusCode": 400
}
```

---

## Authentication

### Header Format
```
Authorization: Bearer <access_token>
```

### Admin Only Endpoints
Các endpoint được đánh dấu ⭐ chỉ admin có thể truy cập:
- POST /api/v1/movies
- PUT /api/v1/movies/:id
- DELETE /api/v1/movies/:id
- POST /api/v1/showtimes
- PUT /api/v1/showtimes/:id
- DELETE /api/v1/showtimes/:id

---

## Examples

### Create Movie Example
```bash
curl -X POST http://localhost:3000/api/v1/movies \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Avengers",
    "description": "Earth'\''s mightiest heroes",
    "releaseDate": "2024-05-04T00:00:00Z",
    "endDate": "2024-08-31T23:59:59Z",
    "type": "2D",
    "duration": 143,
    "origin": "USA",
    "ageRating": "T13",
    "authors": "Joss Whedon"
  }'
```

### Create Showtime Example
```bash
curl -X POST http://localhost:3000/api/v1/showtimes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "2024-05-04T10:00:00Z",
    "endTime": "2024-05-04T12:23:00Z",
    "movie": "507f1f77bcf86cd799439011",
    "screen": "507f1f77bcf86cd799439015"
  }'
```

### List Showtimes By Movie Example
```bash
curl "http://localhost:3000/api/v1/showtimes?movie=69b40a4d2c78cf2966139101&status=UPCOMING"
```

### Get Showtime Detail With Populate Example
```bash
curl "http://localhost:3000/api/v1/showtimes/507f1f77bcf86cd799439014?populate=movie.genres,screen.theater"
```

### Get Now-Showing Movies
```bash
curl http://localhost:3000/api/v1/movies/now-showing?location=Hà%20Nội&limit=10&populate=genres
```

---

**Last Updated:** March 7, 2026  
**API Version:** 1.0
