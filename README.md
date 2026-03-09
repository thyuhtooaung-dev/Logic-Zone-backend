## <a name="table">Table of Contents</a>

1.  [Introduction](#introduction)
2.  [Tech Stack](#tech-stack)
3.  [Features](#features)

## <a name="introduction">Introduction</a>

A high-performance PERN stack (PostgreSQL, Express, React, Node.js) academic hub. This multi-role system (Admin, Teacher, Student) utilizes a decoupled architecture where an Express/Node.js backend serves a modular React frontend powered by Refine. By leveraging PostgreSQL (Neon) with Drizzle ORM, it ensures type-safe data integrity for class management, automated scheduling, and real-time analytics. Secure access is managed via Better-Auth, providing a robust, controlled-access environment for campus operations.

## <a name="tech-stack"> Tech Stack</a>

### Frontend Stack

- [React](https://react.dev/)
- [Refine](https://jsm.dev/pern-refine)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://zod.dev/)

### Backend Stack

- [Arcjet](https://jsm.dev/pern-arcjet)
- [Better Auth](https://www.better-auth.com/)
- [Cloudinary](https://jsm.dev/pern-cloudinary)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Express.js](https://expressjs.com/)
- [Neon](https://neon.com/)
- [Node.js](https://nodejs.org/)

### Dev Tools
- [CodeRabbit](https://jsm.dev/pern-coderabbit)
- [Site24x7](https://jsm.dev/pern-site24x7)

## <a name="features"> Features</a>

**Multi-Role Authentication**: A secure entry system powered by **Better Auth** and **Arcjet** that dynamically routes Students, Teachers, and Admins to protected dashboards with strict role-based permissions.

**Unified Analytics Dashboard**: A high-level overview of the institution's health, featuring real-time statistics on student enrollment, active classes, and faculty distribution via **Refine's** data providers.

**Intelligent Subject Management**: Centralized control for curriculum where you can create subjects, apply instant filters, and drill down into specific class assignments and teacher workloads.

**Departmental Governance**: A structural management layer that organizes subjects and faculties into departments, providing detailed views of every student and educator within a specific academic branch.

**Dynamic Faculty Directory**: A robust, paginated directory of all professors featuring advanced search by name or email, profile image hosting via **Cloudinary**, and full teaching schedule visibility.

**Advanced Class Orchestration**: The core engine of the app built with **Drizzle ORM**, allowing Admins to schedule sessions, set capacity limits, and manage complex assignments of multiple teachers across different sections.

**Code-Based Enrollment System**: A "Google Classroom" inspired workflow where students gain instant access to courses by entering a unique 6-8 digit joining code, ensuring a secure and controlled-access environment.

And many more, including code architecture and reusability.
