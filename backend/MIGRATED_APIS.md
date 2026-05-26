# Migrated API Map

These APIs have been shifted from the old `server/` Mongo backend surface to the new `backend/` PostgreSQL backend surface.

## Auth

- API: `POST /api/auth/login`
- Route: `backend/src/routes/auth.routes.js`
- Controller: `backend/src/controllers/auth.controller.js`
- Service: `backend/src/services/auth.service.js`
- Database contract: `fn_login_user(email)`

## Students Manage CRUD

- API: `POST /api/students/manage`
- Route: `backend/src/routes/student.routes.js`
- Controller: `backend/src/controllers/student.controller.js`
- Service: `backend/src/services/student.service.js`
- Database contract: `sp_manage_student(...)`
- Actions: `1` create, `2` update, `3` delete

## Students Report/List

- API: `GET /api/students/report?class_id=&section_id=&academic_year_id=`
- Route: `backend/src/routes/studentReport.routes.js`
- Controller: `backend/src/controllers/studentReport.controller.js`
- Service: `backend/src/services/studentReport.service.js`
- Database contract: `fn_get_students_full_details(class_id, section_id, academic_year_id)`

## Fee Payments

- API: `POST /api/payments/manage`
- Route: `backend/src/routes/payment.routes.js`
- Controller: `backend/src/controllers/payment.controller.js`
- Service: `backend/src/services/payment.service.js`
- Database contract: `sp_manage_fee_payment(...)`

## Teachers Manage CRUD

- API: `POST /api/teachers/manage`
- API: `GET /api/teachers`
- API: `GET /api/teachers/:id`
- Route: `backend/src/routes/teacher.routes.js`
- Controller: `backend/src/controllers/teacher.controller.js`
- Service: `backend/src/services/teacher.service.js`
- Database contract: `sp_manage_teacher(...)`, `fn_get_teacher_details(teacher_id)`
- Actions: `1` create, `2` update, `3` delete

## Attendance Read

- API: `GET /api/attendance?student_id=`
- API: `GET /api/attendance/:id`
- Route: `backend/src/routes/attendance.routes.js`
- Controller: `backend/src/controllers/attendance.controller.js`
- Service: `backend/src/services/attendance.service.js`
- Database contract: `fn_get_student_attendance(attendance_id, student_id)`
- Status: read-only integration is wired in frontend; marking attendance still needs backend write APIs.

## Fees Surface

- API base: `/api/fees`
- Route: `backend/src/routes/fee.routes.js`
- Controller: `backend/src/controllers/fee.controller.js`
- Service: `backend/src/services/fee.service.js`
- Status: frontend is pointed to backend; fee-structure save/assign/generate/reset still need exact PostgreSQL procedure signatures.
