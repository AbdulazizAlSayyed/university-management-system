// Root API router. Mounts the shared auth module + the three role modules:
//   /api/auth       -> modules/auth       (public: login/register)
//   /api/admin      -> modules/admin      (verifyToken + authorize("admin"))
//   /api/professor  -> modules/professor  (verifyToken + authorize("professor"))
//   /api/student    -> modules/student    (verifyToken + authorize("student"))
