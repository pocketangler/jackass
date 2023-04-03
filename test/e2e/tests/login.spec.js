import { test } from "../fixtures/test.js";
const { describe, beforeEach } = test;

describe("When I log in", () => {

    beforeEach(async ({ login }) => {

        await login.withUsernameAndPassword("roofus@gmail.com", "Passwodrd1!");

    });

    test("Then it should display my name and sign out button", async ({ login }) => {

        await login.expectSignedInAs("Roofus Gibonicus");

    });

});
