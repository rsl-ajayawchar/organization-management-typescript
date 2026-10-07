import { Designation, EmployeeData } from "./models";
import { Organization, OrganizationError } from "./organization";

function runDemo(): void {
  const organization = new Organization();

  const ceo: EmployeeData = {
    name: "Asha CEO",
    id: "E001",
    dateOfBirth: "01/15/1975",
    designation: Designation.CEO,
  };

  const director: EmployeeData = {
    name: "Ravi Director",
    id: "E002",
    dateOfBirth: "02/20/1980",
    designation: Designation.Director,
    reportsTo: "E001",
  };

  const manager: EmployeeData = {
    name: "Neha Manager",
    id: "E003",
    dateOfBirth: "03/10/1985",
    designation: Designation.Manager,
    reportsTo: "E002",
  };

  const lead: EmployeeData = {
    name: "Vikram Lead",
    id: "E004",
    dateOfBirth: "04/25/1990",
    designation: Designation.Lead,
    reportsTo: "E003",
  };

  const engineer: EmployeeData = {
    name: "Ajay Engineer",
    id: "E005",
    dateOfBirth: "05/12/1995",
    designation: Designation.Engineer,
    reportsTo: "E004",
  };

  console.log("\n1. CREATE");
  organization.addEmployee(ceo);
  organization.addEmployee(director);
  organization.addEmployee(manager);
  organization.addEmployee(lead);
  organization.addEmployee(engineer);
  console.log("Created organization hierarchy.");

  console.log("\n2. GET ALL");
  console.table(organization.getAllEmployees().map((employee) => employee.toJSON()));

  console.log("\n3. GET BY ID");
  console.log(organization.getEmployee("E005").toJSON());

  console.log("\n4. UPDATE");
  organization.updateEmployee("E005", {
    name: "Ajay Updated",
    dateOfBirth: "05/13/1995",
  });
  console.log(organization.getEmployee("E005").toJSON());

  console.log("\n5. VALIDATION - DUPLICATE ID");
  try {
    organization.addEmployee({ ...engineer, name: "Duplicate Engineer" });
  } catch (error) {
    printError(error);
  }

  console.log("\n6. VALIDATION - INVALID HIERARCHY");
  try {
    organization.addEmployee({
      name: "Invalid Engineer",
      id: "E006",
      dateOfBirth: "06/15/1996",
      designation: Designation.Engineer,
      reportsTo: "E002",
    });
  } catch (error) {
    printError(error);
  }

  console.log("\n7. VALIDATION - SECOND CEO");
  try {
    organization.addEmployee({
      name: "Second CEO",
      id: "E007",
      dateOfBirth: "07/15/1970",
      designation: Designation.CEO,
    });
  } catch (error) {
    printError(error);
  }

  console.log("\n8. DELETE WITH REPORTEES");
  try {
    organization.deleteEmployee("E004");
  } catch (error) {
    printError(error);
  }

  console.log("\n9. DELETE");
  organization.deleteEmployee("E005");
  console.log("Deleted E005 successfully.");

  console.log("\n10. UPDATE NON-EXISTENT ID");
  try {
    organization.updateEmployee("E999", { name: "Nobody" });
  } catch (error) {
    printError(error);
  }
}

function printError(error: unknown): void {
  if (error instanceof OrganizationError) {
    console.log(`Rejected: ${error.message}`);
    return;
  }

  console.log("Unexpected error:", error);
}

runDemo();
