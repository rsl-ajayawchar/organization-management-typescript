export enum Designation {
  Engineer = "Engineer",
  Lead = "Lead",
  Manager = "Manager",
  Director = "Director",
  CEO = "CEO",
}

export interface EmployeeData {
  name: string;
  id: string;
  dateOfBirth: string;
  designation: Designation;
  reportsTo?: string;
  reportees?: string[];
}

export abstract class Employee {
  public readonly name: string;
  public readonly id: string;
  public readonly dateOfBirth: string;
  public designation: Designation;
  public reportsTo?: string;
  public readonly reportees: string[];

  protected constructor(data: EmployeeData) {
    this.name = data.name;
    this.id = data.id;
    this.dateOfBirth = data.dateOfBirth;
    this.designation = data.designation;
    this.reportsTo = data.reportsTo;
    this.reportees = data.reportees ?? [];
  }

  public abstract canHaveReportee(designation: Designation): boolean;

  public toJSON(): EmployeeData {
    return {
      name: this.name,
      id: this.id,
      dateOfBirth: this.dateOfBirth,
      designation: this.designation,
      ...(this.reportsTo ? { reportsTo: this.reportsTo } : {}),
      reportees: [...this.reportees],
    };
  }
}

export class Engineer extends Employee {
  public constructor(data: EmployeeData) {
    super(data);
  }

  public canHaveReportee(): boolean {
    return false;
  }
}

export class Lead extends Employee {
  public constructor(data: EmployeeData) {
    super(data);
  }

  public canHaveReportee(designation: Designation): boolean {
    return designation === Designation.Engineer;
  }
}

export class Manager extends Employee {
  public constructor(data: EmployeeData) {
    super(data);
  }

  public canHaveReportee(designation: Designation): boolean {
    return designation === Designation.Lead;
  }
}

export class Director extends Employee {
  public constructor(data: EmployeeData) {
    super(data);
  }

  public canHaveReportee(designation: Designation): boolean {
    return designation === Designation.Manager;
  }
}

export class CEO extends Employee {
  public constructor(data: EmployeeData) {
    super(data);
  }

  public canHaveReportee(designation: Designation): boolean {
    return designation === Designation.Director;
  }
}

export function createEmployee(data: EmployeeData): Employee {
  switch (data.designation) {
    case Designation.Engineer:
      return new Engineer(data);
    case Designation.Lead:
      return new Lead(data);
    case Designation.Manager:
      return new Manager(data);
    case Designation.Director:
      return new Director(data);
    case Designation.CEO:
      return new CEO(data);
  }
}
