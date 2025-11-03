# Database Schema for Voucher Management System

This document outlines the proposed database schema for the Voucher Management System. This schema is designed to be scalable, maintainable, and serves as a blueprint for backend development and database setup. It is based on a relational model, suitable for SQL databases like PostgreSQL or MySQL.

## Table of Contents
1.  [Schema Diagram](#schema-diagram)
2.  [Table Definitions](#table-definitions)
    -   [`outlets`](#outlets)
    -   [`users`](#users)
    -   [`package_templates`](#package_templates)
    -   [`customer_packages`](#customer_packages)
    -   [`vouchers`](#vouchers)
    -   [`service_records`](#service_records)
3.  [Indexes](#indexes)
4.  [Important Notes](#important-notes)

---

## Schema Diagram

```
+---------------------+      +-----------------------+      +-----------------------+
|       outlets       |      |         users         |      |       vouchers        |
+---------------------+      +-----------------------+      +-----------------------+
| id (PK) VARCHAR(255)|--+   | id (PK) VARCHAR(255)  |      | id (PK) VARCHAR(255)  |
| name VARCHAR(255)   |  |   | username VARCHAR(255) |      | recipient_name ...    |
| location ...        |  |   | password_hash TEXT    |      | recipient_mobile ...  |
| code VARCHAR(10)    |  |   | role ENUM('admin','user') |   | outlet_id (FK) ...    |---( outlets.id
| address TEXT        |  +---< outlet_id (FK) ...    |      | issue_date TIMESTAMP  |
| gstin VARCHAR(15)   |      +-----------------------+      | expiry_date TIMESTAMP |
| phone VARCHAR(20)   |                                     | redeemed_date ...     |
+---------------------+                                     | status ENUM(...)      |
                                                            | type ENUM(...)        |
                                                            | discount_percentage.. |
                                                            | bill_no ...           |
+---------------------+      +-----------------------+      | redemption_bill_no... |
| package_templates   |      |   customer_packages   |      +-----------------------+
+---------------------+      +-----------------------+
| id (PK) VARCHAR(255)|--+   | id (PK) VARCHAR(255)  |      +-----------------------+
| name VARCHAR(255)   |  |   | customer_name ...     |      |    service_records    |
| package_value DEC   |  |   | customer_mobile ...   |      +-----------------------+
| service_value DEC   |  |   | package_template_id(FK)|--< | id (PK) VARCHAR(255)  |
+---------------------+  +---< outlet_id (FK) ...    |      | customer_package_id(FK)|---( customer_packages.id
                         |   | assigned_date DATE    |      | service_name ...      |
                         +---< remaining_service_val |      | service_value DEC     |
                             +-----------------------+      | redeemed_date DATE    |
                                                            | transaction_id ...    |
                                                            +-----------------------+
```
*(Note: This is a simplified text-based representation of relationships.)*

---

## Table Definitions

### `outlets`
Stores information about each physical salon branch.

| Column      | Data Type         | Constraints                             | Description                                 |
|-------------|-------------------|-----------------------------------------|---------------------------------------------|
| `id`          | `VARCHAR(255)`    | `PRIMARY KEY`, `NOT NULL`                 | Unique identifier (e.g., 'o-1').            |
| `name`        | `VARCHAR(255)`    | `NOT NULL`                                | Name of the outlet (e.g., 'MADINAGUDA').    |
| `location`    | `VARCHAR(255)`    | `NOT NULL`                                | City or area of the outlet.                 |
| `code`        | `VARCHAR(10)`     | `NOT NULL`, `UNIQUE`                      | Short unique code for the outlet (e.g., 'NAT'). |
| `address`     | `TEXT`            | `NOT NULL`                                | Full postal address.                        |
| `gstin`       | `VARCHAR(15)`     | `NOT NULL`, `UNIQUE`                      | GST Identification Number.                  |
| `phone`       | `VARCHAR(20)`     | `NOT NULL`                                | Contact phone number.                       |
| `created_at`  | `TIMESTAMP`       | `DEFAULT CURRENT_TIMESTAMP`             | Timestamp of creation.                      |
| `updated_at`  | `TIMESTAMP`       | `DEFAULT CURRENT_TIMESTAMP`             | Timestamp of last update.                   |

### `users`
Stores user accounts for logging into the system.

| Column          | Data Type             | Constraints                             | Description                                                     |
|-----------------|-----------------------|-----------------------------------------|-----------------------------------------------------------------|
| `id`              | `VARCHAR(255)`        | `PRIMARY KEY`, `NOT NULL`                 | Unique identifier (e.g., 'u-admin').                            |
| `username`        | `VARCHAR(255)`        | `NOT NULL`, `UNIQUE`                      | Login username.                                                 |
| `password_hash`   | `TEXT`                | `NOT NULL`                                | **Hashed and salted** password. **NEVER store plain text.** |
| `role`            | `ENUM('admin','user')`| `NOT NULL`, `DEFAULT 'user'`              | User role ('admin' for full access, 'user' for outlet staff). |
| `outlet_id`       | `VARCHAR(255)`        | `FOREIGN KEY` references `outlets(id)`    | The outlet the user is assigned to. Can be `NULL` for admins. |
| `created_at`      | `TIMESTAMP`           | `DEFAULT CURRENT_TIMESTAMP`             | Timestamp of creation.                                          |
| `updated_at`      | `TIMESTAMP`           | `DEFAULT CURRENT_TIMESTAMP`             | Timestamp of last update.                                       |

### `package_templates`
Stores the definitions for different customer packages.

| Column          | Data Type         | Constraints                 | Description                                    |
|-----------------|-------------------|-----------------------------|------------------------------------------------|
| `id`              | `VARCHAR(255)`    | `PRIMARY KEY`, `NOT NULL`     | Unique identifier (e.g., 'pt-1').              |
| `name`            | `VARCHAR(255)`    | `NOT NULL`                    | Display name (e.g., 'Pay 5000 Get 7500').      |
| `package_value`   | `DECIMAL(10, 2)`  | `NOT NULL`                    | The amount the customer pays (e.g., 5000.00).  |
| `service_value`   | `DECIMAL(10, 2)`  | `NOT NULL`                    | The total value of services the customer gets. |
| `created_at`      | `TIMESTAMP`       | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of creation.                         |

### `customer_packages`
Stores instances of packages assigned to customers.

| Column                    | Data Type         | Constraints                               | Description                                     |
|---------------------------|-------------------|-------------------------------------------|-------------------------------------------------|
| `id`                        | `VARCHAR(255)`    | `PRIMARY KEY`, `NOT NULL`                   | Unique identifier for the assigned package.     |
| `customer_name`             | `VARCHAR(255)`    | `NOT NULL`                                  | Name of the customer.                           |
| `customer_mobile`           | `VARCHAR(20)`     | `NOT NULL`                                  | Mobile number of the customer.                  |
| `package_template_id`       | `VARCHAR(255)`    | `NOT NULL`, `FOREIGN KEY` refs `package_templates(id)` | Which package template was used.                |
| `outlet_id`                 | `VARCHAR(255)`    | `NOT NULL`, `FOREIGN KEY` refs `outlets(id)`    | Outlet where the package was assigned.          |
| `assigned_date`             | `DATE`            | `NOT NULL`                                  | Date the package was assigned.                  |
| `remaining_service_value`   | `DECIMAL(10, 2)`  | `NOT NULL`                                  | The current remaining balance of service value. |
| `created_at`                | `TIMESTAMP`       | `DEFAULT CURRENT_TIMESTAMP`               | Timestamp of creation.                          |

### `vouchers`
Stores all issued vouchers.

| Column                | Data Type                               | Constraints                             | Description                                   |
|-----------------------|-----------------------------------------|-----------------------------------------|-----------------------------------------------|
| `id`                    | `VARCHAR(255)`                          | `PRIMARY KEY`, `NOT NULL`                 | Unique voucher code/ID.                       |
| `recipient_name`        | `VARCHAR(255)`                          | `NOT NULL`                                | Name of the person receiving the voucher.     |
| `recipient_mobile`      | `VARCHAR(20)`                           | `NOT NULL`                                | Mobile number of the recipient.               |
| `outlet_id`             | `VARCHAR(255)`                          | `NOT NULL`, `FOREIGN KEY` refs `outlets(id)`| Outlet where the voucher was issued.          |
| `issue_date`            | `TIMESTAMP`                             | `NOT NULL`                                | Date and time the voucher was issued.         |
| `expiry_date`           | `TIMESTAMP`                             | `NOT NULL`                                | Date and time the voucher expires.            |
| `redeemed_date`         | `TIMESTAMP`                             | `NULL`                                    | Date and time of redemption. `NULL` if not redeemed. |
| `status`                | `ENUM('Issued', 'Redeemed', 'Expired')` | `NOT NULL`                                | Current status of the voucher.                |
| `type`                  | `ENUM('Partner', 'Family & Friends')`   | `NOT NULL`                                | The type of voucher.                          |
| `discount_percentage`   | `INT`                                   | `NOT NULL`                                | The discount percentage offered.              |
| `bill_no`               | `VARCHAR(255)`                          | `NOT NULL`                                | The original bill number for which the voucher was issued. |
| `redemption_bill_no`    | `VARCHAR(255)`                          | `NULL`                                    | The bill number used for redemption.          |
| `created_at`            | `TIMESTAMP`                             | `DEFAULT CURRENT_TIMESTAMP`             | Timestamp of creation.                        |

### `service_records`
Stores a record of each service redeemed from a customer's package.

| Column                | Data Type         | Constraints                                   | Description                                   |
|-----------------------|-------------------|-----------------------------------------------|-----------------------------------------------|
| `id`                    | `VARCHAR(255)`    | `PRIMARY KEY`, `NOT NULL`                       | Unique identifier for the service record.     |
| `customer_package_id`   | `VARCHAR(255)`    | `NOT NULL`, `FOREIGN KEY` refs `customer_packages(id)` | The package this service belongs to.          |
| `service_name`          | `VARCHAR(255)`    | `NOT NULL`                                    | Name of the service redeemed (e.g., 'Haircut'). |
| `service_value`         | `DECIMAL(10, 2)`  | `NOT NULL`                                    | The value of the service redeemed.            |
| `redeemed_date`         | `DATE`            | `NOT NULL`                                    | The date the service was redeemed.            |
| `transaction_id`        | `VARCHAR(255)`    | `NOT NULL`                                    | Groups services redeemed in a single visit.   |
| `created_at`            | `TIMESTAMP`       | `DEFAULT CURRENT_TIMESTAMP`                 | Timestamp of creation.                        |

---

## Indexes

To ensure high performance, especially as the data grows, the following indexes should be created:

-   **`users` table:** on `username` (for fast login checks).
-   **`vouchers` table:** on `recipient_mobile` and `outlet_id`.
-   **`customer_packages` table:** on `customer_mobile` and `outlet_id`.
-   **All Foreign Key columns** should be indexed to speed up joins (e.g., `users.outlet_id`, `vouchers.outlet_id`, `service_records.customer_package_id`, etc.).

---

## Important Notes

1.  **Security:** User passwords **must** be securely hashed using a strong algorithm like **bcrypt** or **Argon2**. Never, under any circumstances, store plain-text passwords in the database.
2.  **Data Types:** The specific data types (`VARCHAR`, `INT`, `DECIMAL`) may vary slightly depending on the chosen SQL dialect (e.g., PostgreSQL, MySQL). The types listed here are standard and generally applicable.
3.  **Relationships:** Deletion behavior for foreign keys should be considered. For example, when an `outlet` is deleted, what should happen to its associated `users`? Setting `ON DELETE SET NULL` for `users.outlet_id` might be appropriate.
4.  **Transaction Management:** When performing operations that modify multiple tables (like assigning a package and creating initial service records), they should be wrapped in a database transaction to ensure atomicity. If one part fails, the entire operation should be rolled back.
5.  **Timestamps:** The `created_at` and `updated_at` columns are highly recommended for auditing and debugging purposes. Most modern database frameworks can manage these automatically.
