import {
  Designation,
  Employee,
  EmployeeData,
  createEmployee,
} from "./models";

export class OrganizationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "OrganizationError";
  }
}

export class Organization {
  private readonly employees = new Map<string, Employee>();

  public addEmployee(data: EmployeeData): Employee {
    this.validateEmployeeData(data);

    if (this.employees.has(data.id)) {
      throw new OrganizationError(`Employee ID '${data.id}' already exists.`);
    }

    if (
      data.designation === Designation.CEO &&
      [...this.employees.values()].some(
        (employee: Employee) => employee.designation === Designation.CEO,
      )
    ) {
      throw new OrganizationError("Only one CEO is allowed.");
    }

    this.validateReportsTo(data.designation, data.reportsTo);

    if (data.reportsTo !== undefined) {
      this.ensureManagerExists(data.reportsTo);
    }

    const employee = createEmployee({
      ...data,
      reportees: [],
    });

    this.employees.set(employee.id, employee);

    if (employee.reportsTo) {
      this.addReportee(employee.reportsTo, employee.id);
    }

    return employee;
  }

  public getEmployee(id: string): Employee {
    const employee = this.employees.get(id);

    if (!employee) {
      throw new OrganizationError(`Employee '${id}' was not found.`);
    }

    return employee;
  }

  public getAllEmployees(): Employee[] {
    return [...this.employees.values()];
  }

  public updateEmployee(id: string, changes: Partial<Omit<EmployeeData, "id">>): Employee {
    const existing = this.getEmployee(id);

    const updated: EmployeeData = {
      name: changes.name ?? existing.name,
      id: existing.id,
      dateOfBirth: changes.dateOfBirth ?? existing.dateOfBirth,
      designation: changes.designation ?? existing.designation,
      reportsTo: changes.reportsTo !== undefined
        ? changes.reportsTo
        : existing.reportsTo,
    };

    this.validateEmployeeData(updated);
    this.validateReportsTo(updated.designation, updated.reportsTo);

    if (
      updated.designation === Designation.CEO &&
      existing.designation !== Designation.CEO &&
      [...this.employees.values()].some(
        (employee: Employee) =>
          employee.id !== id && employee.designation === Designation.CEO,
      )
    ) {
      throw new OrganizationError("Only one CEO is allowed.");
    }

    if (updated.reportsTo === id) {
      throw new OrganizationError("An employee cannot report to itself.");
    }

    if (updated.reportsTo !== undefined) {
      this.ensureManagerExists(updated.reportsTo);
    }

    if (updated.reportsTo !== existing.reportsTo) {
      if (existing.reportsTo) {
        this.removeReportee(existing.reportsTo, id);
      }

      if (updated.reportsTo) {
        this.addReportee(updated.reportsTo, id);
      }
    }

    if (updated.designation !== existing.designation) {
      this.validateExistingReporteesForNewDesignation(
        existing.reportees,
        updated.designation,
      );
    }

    existing.designation = updated.designation;
    existing.reportsTo = updated.reportsTo;
    // name and dateOfBirth are readonly in the model to keep employee identity stable.
    // Re-create the object when those fields need updating.
    if (updated.name !== existing.name || updated.dateOfBirth !== existing.dateOfBirth) {
      const replacement = createEmployee({
        ...updated,
        reportees: [...existing.reportees],
      });

      this.employees.set(id, replacement);
      return replacement;
    }

    return existing;
  }

  public deleteEmployee(id: string): void {
    const employee = this.getEmployee(id);

    if (employee.reportees.length > 0) {
      throw new OrganizationError(
        `Cannot delete '${id}' because the employee has reportees: ${employee.reportees.join(", ")}.`,
      );
    }

    if (employee.reportsTo) {
      this.removeReportee(employee.reportsTo, id);
    }

    this.employees.delete(id);
  }

  private validateEmployeeData(data: EmployeeData): void {
    if (!data.name.trim()) {
      throw new OrganizationError("Employee name is required.");
    }

    if (!data.id.trim()) {
      throw new OrganizationError("Employee ID is required.");
    }

    if (!this.isValidDate(data.dateOfBirth)) {
      throw new OrganizationError(
        `Invalid dateOfBirth '${data.dateOfBirth}'. Expected a valid MM/DD/YYYY date.`,
      );
    }

    if (!Object.values(Designation).includes(data.designation)) {
      throw new OrganizationError(`Invalid designation '${data.designation}'.`);
    }

    if (data.designation === Designation.CEO && data.reportsTo !== undefined) {
      throw new OrganizationError("CEO must not report to anyone.");
    }

    if (data.designation !== Designation.CEO && !data.reportsTo) {
      throw new OrganizationError(
        `${data.designation} must have a reportsTo employee ID.`,
      );
    }
  }

  private validateReportsTo(
    designation: Designation,
    reportsTo: string | undefined,
  ): void {
    if (designation === Designation.CEO) {
      if (reportsTo !== undefined) {
        throw new OrganizationError("CEO must not have a reportsTo value.");
      }
      return;
    }

    if (!reportsTo) {
      throw new OrganizationError(`${designation} requires reportsTo.`);
    }

    const manager = this.getEmployee(reportsTo);
    const expectedManagerDesignation = this.getExpectedManagerDesignation(designation);

    if (manager.designation !== expectedManagerDesignation) {
      throw new OrganizationError(
        `${designation} must report to a ${expectedManagerDesignation}.`,
      );
    }
  }

  private getExpectedManagerDesignation(
    designation: Designation,
  ): Designation {
    switch (designation) {
      case Designation.Engineer:
        return Designation.Lead;
      case Designation.Lead:
        return Designation.Manager;
      case Designation.Manager:
        return Designation.Director;
      case Designation.Director:
        return Designation.CEO;
      case Designation.CEO:
        throw new OrganizationError("CEO does not have a manager.");
    }
  }

  private ensureManagerExists(id: string): void {
    this.getEmployee(id);
  }

  private addReportee(managerId: string, employeeId: string): void {
    const manager = this.getEmployee(managerId);
    const employee = this.getEmployee(employeeId);

    if (!manager.canHaveReportee(employee.designation)) {
      throw new OrganizationError(
        `${employee.designation} '${employeeId}' cannot report to ${manager.designation} '${managerId}'.`,
      );
    }

    if (!manager.reportees.includes(employeeId)) {
      manager.reportees.push(employeeId);
    }
  }

  private removeReportee(managerId: string, employeeId: string): void {
    const manager = this.getEmployee(managerId);
    const index = manager.reportees.indexOf(employeeId);

    if (index >= 0) {
      manager.reportees.splice(index, 1);
    }
  }

  private validateExistingReporteesForNewDesignation(
    reportees: string[],
    newDesignation: Designation,
  ): void {
    const allowedChild = newDesignation === Designation.CEO
      ? Designation.Director
      : newDesignation === Designation.Director
        ? Designation.Manager
        : newDesignation === Designation.Manager
          ? Designation.Lead
          : newDesignation === Designation.Lead
            ? Designation.Engineer
            : undefined;

    for (const reporteeId of reportees) {
      const reportee = this.getEmployee(reporteeId);

      if (allowedChild !== reportee.designation) {
        throw new OrganizationError(
          `Cannot change designation because '${reporteeId}' would have an invalid reporting relationship.`,
        );
      }
    }
  }

  private isValidDate(value: string): boolean {
    const match = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(\d{4})$/.exec(value);

    if (!match) {
      return false;
    }

    const month = Number(match[1]);
    const day = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }
}
