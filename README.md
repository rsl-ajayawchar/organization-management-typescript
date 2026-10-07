# Organization Management System - TypeScript

A simple Organization Management system built using **TypeScript and OOP concepts**

## Project Structure

```text
organization-management-ts/
- src/
   - models.ts
   - organization.ts
   - index.ts
- package.json
- tsconfig.json
- README.md
```


## Setup

Install dependencies:

```bash
npm install
```

## Run

Development mode:

```bash
npm run dev
```

Build TypeScript:

```bash
npm run build
```

Run compiled JavaScript:

```bash
npm start
```

### OOP approach

`Employee` is the base abstraction. Each designation is represented by a class:

```text
Employee
- Engineer
- Lead
- Manager
- Director
- CEO
```

The `Organization` class owns the employee collection and enforces organization-level business rules.

A `Map<string, Employee>` is used for employee storage because employee IDs are unique and employee lookup by ID is a core operation.

### Delete behavior

An employee who still has reportees cannot be deleted. This avoids leaving invalid references in the organization hierarchy.

### Update behavior

Employee ID remains immutable. Name, date of birth, designation, and reporting relationship can be updated.

When a reporting relationship changes, the old manager's reportee list and the new manager's reportee list are updated.

## Assumptions

- Employee IDs are strings and must be unique.
- CEO is the only role without `reportsTo`.
- Each non-CEO employee has exactly one `reportsTo`.
- Reporting relationships must follow the required one-level hierarchy.
- Deleting employees with reportees is rejected rather than automatically reassigning their reportees.
- Employee IDs are immutable during update.
- `dateOfBirth` must be a real calendar date in `MM/DD/YYYY` format.
