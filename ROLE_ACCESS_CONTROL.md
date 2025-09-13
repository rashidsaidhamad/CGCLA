# 🔐 CGCLA Role-Based Access Control Structure

## 📋 **User Roles & Access Control**

### 🔴 **Admin Role**
- **Username**: `admin`
- **Password**: `admin123`
- **Redirects to**: `/admin` (AdminDashboard)
- **Access**: Full system access

### 🔵 **Chief Role** 
- **Username**: `john` (John Doe)
- **Password**: `password123`
- **Redirects to**: `/chief` (ChiefDashboard)
- **Access**: Management level access

### 🟢 **Storekeeper Role**
- **Username**: `emma` (Emma Johnson)
- **Password**: `password123`
- **Redirects to**: `/dashboard` (EmployeeDashboard)
- **Access**: Inventory and warehouse operations

### 🟡 **Requester Role**
- **Usernames**: `alice_hr`, `bob_it`, `carol_admin`, `david_security`, `eve_procurement`
- **Password**: `password123`
- **Redirects to**: `/department` (DepartmentDashboard)
- **Access**: Request submission and department operations

## 🛡️ **Protected Routes**

Each route is protected and will redirect unauthorized users:

```javascript
/admin/*      → Only Admin role
/chief/*      → Only Chief role  
/dashboard/*  → Only Storekeeper role
/department/* → Only Requester role
```

## 🔄 **Automatic Redirections**

If a user tries to access an unauthorized page, they are automatically redirected to their appropriate dashboard:

- **Admin** accessing `/chief` → Redirected to `/admin`
- **Storekeeper** accessing `/department` → Redirected to `/dashboard`
- **Requester** accessing `/admin` → Redirected to `/department`
- **Chief** accessing `/dashboard` → Redirected to `/chief`

## 🧪 **Testing Credentials**

Use these credentials to test the role-based access:

1. **Admin Test**: `admin` / `admin123` → Should go to AdminDashboard
2. **Chief Test**: `john` / `password123` → Should go to ChiefDashboard  
3. **Storekeeper Test**: `emma` / `password123` → Should go to EmployeeDashboard
4. **Requester Test**: `alice_hr` / `password123` → Should go to DepartmentDashboard

## 🎯 **Expected Behavior**

✅ **Correct Access**:
- Admin logs in → AdminDashboard
- Emma (Storekeeper) logs in → EmployeeDashboard (`/dashboard`)
- Requesters log in → DepartmentDashboard (`/department`)
- Chief logs in → ChiefDashboard

❌ **Blocked Access**:
- Non-admin trying to access `/admin` → Redirected to their dashboard
- Non-storekeeper trying to access `/dashboard` → Redirected to their dashboard
- Non-requester trying to access `/department` → Redirected to their dashboard
