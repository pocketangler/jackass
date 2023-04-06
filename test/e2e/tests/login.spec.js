import { test } from "../fixtures/test.js";
const { describe, beforeEach } = test;

// describe("When I log in", () => {

//     beforeEach(async ({ login }) => {

//         await login.withUsernameAndPassword("roofus@gmail.com", "Password1!");

//     });

//     test("Then it should display my name and sign out button", async ({ login }) => {

//         await login.expectSignedInAs("Roofus Gibonicus");

//     });

//     describe("And then I log out again", () => {

//         beforeEach(async ({ login, page }) => {

//             await login.signOut();

//         });

//         test("Then it should revert to showing the sign in button", async ({ login }) => {

//             await login.expectSignedOut();

//         });

//     });

// });

test("Webkit bug", async ({ context, page }) => {

    await page.goto("/");
    const storageState = await context.storageState();
    console.log(storageState);
    await page.evaluate(() => localStorage.setItem("dev-mode", true));
    const storageState2 = await context.storageState();
    console.log(storageState2);
    await page.reload();

});
