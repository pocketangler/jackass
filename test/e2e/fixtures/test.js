import base from "@playwright/test";
import login from "./login-fixture.js";

export const test = base.extend({

    login

});
