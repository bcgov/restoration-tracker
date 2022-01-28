/// <reference types="cypress" />
import * as faker from "faker";

export function navigate_project() {
  // Create project
  cy.wait(1000);
  cy.visit("/admin/projects/create");
  cy.wait(1000);
}

// Add Coordinator takes variables or when omitted (NULL), it will use fake data)
export function add_coordinator_info(
  navloc,
  fname,
  lname,
  email,
  agency,
  share
) {
  // Coordinator Info
  cy.get("h1").contains("Create Restoration Project").should("be.visible");
  cy.get("#coordinator\\.first_name").clear();
  cy.get("#coordinator\\.first_name").type(fname || faker.name.firstName());
  cy.get("#coordinator\\.last_name").clear();
  cy.get("#coordinator\\.last_name").type(lname || faker.name.lastName());
  cy.get("#coordinator\\.email_address").clear();
  cy.get("#coordinator\\.email_address").type(email || faker.internet.email());
  cy.get("#coordinator\\.coordinator_agency").click();

  // Agency is the sequential number for the shown agency in the drop down.
  cy.get(
    "#coordinator\\.coordinator_agency-option-" +
      (agency || faker.random.number({ min: 0, max: 264 }))
  ).click();

  // Select the Radiobutton
  // the Share parameter takes 'Yes', 'No' or NULL, which defaults to 'Yes'

  cy.get('[name="coordinator.share_contact_details"][type="radio"]').check({
    force: share,
  });
  //cy.get('input[name="share_contact_details"]').uncheck()
}

export function add_permits(navloc, permit_nr, permit_type, sampling) {
  // Permits Info

  cy.get("h2").contains("Permits").should("be.visible");
  cy.get('#permit-type-select').click();
  cy.get('[name="permit.permits.[0].permit_type"]').focus();
  cy.get("#menu-permit\\.permits\\.\\[0\\]\\.permit_type > div.MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded > ul > li:nth-child(" + faker.random.number({ min: 1, max: 2 }) +")").click();
  cy.get('[name="permit.permits.[0].permit_number"]').clear();
  cy.get('[name="permit.permits.[0].permit_number"]').type(
    permit_nr || faker.random.number()
  );
}

export function add_locations(description, kml_file) {
  // Locations
  cy.get('h2').contains("Location").should("be.visible");
  cy.get("#caribou-range-select").type("{enter}");
  cy.get('li[data-value="1"]').click();
  cy.get('[data-testid="project-boundary-upload"]').click();
  cy.get('[data-testid="drop-zone-input"]').attachFile(
    "shapes/" + (kml_file || faker.random.number({ min: 1, max: 9 })) + ".kml"
  );
  cy.wait(5000);
  cy.get("button").contains("Close").click();
}

export function add_gpx(gpx_file) {
  // GPX Flight Path upload
  cy.get('[data-testid="project-boundary-upload"]').click();
  cy.get('[data-testid="drop-zone-input"]').attachFile(
    "shapes/" + (gpx_file || faker.random.number({ min: 1, max: 8 })) + ".gpx"
  );
  cy.wait(5000);
  cy.get("button").contains("Close").click();
}

export function add_zip(zip_file) {
  // Shapefile zip upload
  cy.get('[data-testid="boundary_file-upload"]').click();
  cy.get('[data-testid="drop-zone-input"]').attachFile(
    "shapes/" + (zip_file || faker.random.number({ min: 1, max: 1 })) + ".zip"
  );
  cy.wait(5000);
  cy.get("button").contains("Close").click();
}

export function add_project_info(
  project_name,
  project_type,
  start_date,
  end_date
) {

  cy.get('h2').contains("General Information").should("be.visible");
  cy.get("#project\\.project_name").clear();
  cy.get("#project\\.project_name").type(
    (
      project_name || faker.company.catchPhrase() + " " + faker.company.bs()
    ).substring(0, 50)
  );

  cy.get("#start_date").type(
    start_date ||
      "20" +
        faker.random.number({ min: 19, max: 21 }) +
        "-" +
        faker.random.number({ min: 10, max: 12 }) +
        "-" +
        faker.random.number({ min: 10, max: 28 }), {force:true}
  );
  cy.get("#end_date").type(
    end_date ||
      "20" +
        faker.random.number({ min: 22, max: 30 }) +
        "-" +
        faker.random.number({ min: 10, max: 12 }) +
        "-" +
        faker.random.number({ min: 10, max: 28 }), {force:true}
  );
}

export function add_objectives(objectives, caveats) {
  cy.get("#project\\.objectives").click();
  cy.get("#project\\.objectives").type(objectives || faker.lorem.paragraph());
}

export function add_classification(
  classification,
  sub_classification1,
  sub_classification2
) {
  var subclass1_count, subclass2_count;

  cy.get("button").contains("Add Classification").click();
  cy.get("#iucn\\.classificationDetails\\.\\[0\\]\\.classification")
    .focus()
    .type("{enter}");
  if (classification) {
    cy.get('li[data-value="' + classification + '"]').click();
  } else {
    cy.get(
      'li[data-value="' + faker.random.number({ min: 1, max: 10 }) + '"]'
    ).click();
  }

  cy.get("#iucn\\.classificationDetails\\.\\[0\\]\\.subClassification1")
    .focus()
    .type("{downarrow}{enter}"); // Select the first Entry

  cy.get("#iucn\\.classificationDetails\\.\\[0\\]\\.subClassification2")
    .focus()
    .type("{downarrow}{enter}"); // Select the first Entry

}

export function add_funding(start_date, end_date) {

  cy.get('h2').contains("Funding and Partnerships").should("be.visible");
  cy.get('button[data-testid="add-funding-source-button"]')
    .contains("Add Funding Source")
    .click();
  cy.get("#agency_id").focus().type("{downarrow}{enter}");
  cy.get("#agency_project_id").type(
    faker.random.number({ min: 1000, max: 9999999 })
  );
  cy.get("#funding_amount").type(
    faker.random.number({ min: 100, max: 100000 })
  );
  cy.get("#funding_amount").tab().type(
    start_date ||
      "20" +
        faker.random.number({ min: 19, max: 21 }) +
        "-" +
        faker.random.number({ min: 10, max: 12 }) +
        "-" +
        faker.random.number({ min: 10, max: 28 })
  );
  cy.get("#funding_amount").tab().tab().type(
    end_date ||
      "20" +
        faker.random.number({ min: 22, max: 30 }) +
        "-" +
        faker.random.number({ min: 10, max: 12 }) +
        "-" +
        faker.random.number({ min: 10, max: 28 })
  );
  cy.get("button").contains("Save Changes").click();

  cy.wait(1000);
}

export function add_partnerships() {
  cy.get("#partnerships\\.indigenous_partnerships").focus().type("{downarrow}{enter}");
  cy.get("#partnerships\\.stakeholder_partnerships").focus().type("{downarrow}{enter}").tab();

  cy.wait(1000);
}

export function publish_project() {
  cy.get('button[data-testid="publish-project-button"]')
    .contains("Publish")
    .should("be.visible");
  cy.get('button[data-testid="publish-project-button"]').click();
  cy.wait(10000);
  cy.get('button[data-testid="publish-project-button"]')
    .contains("Unpublish")
    .should("be.visible");
  cy.wait(2000);
}

export function attach_file() {
  cy.get("#h2-button-toolbar-Upload").focus().click();
  cy.wait(1000);
  cy.get('input[data-testid="drop-zone-input"]').attachFile("1.doc");
  cy.wait(1000);
  cy.get("button").contains("Close").click();
  cy.wait(2000);
}

export function submit_project() {
  cy.get('button[data-testid="project-create-button"]').click();
  cy.wait(5000);
}

export function next_page_project() {
  cy.get('button[data-testid="stepper_next"]').click();
}

export function previous_page_project() {
  cy.get('button[data-testid="stepper_previous"]').click();
}

export function cancel_project() {
  cy.get('button[data-testid="stepper_cancel"]').click();
}
