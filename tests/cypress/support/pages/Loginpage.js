//------Elements-----
const euaIDButton = "(//button[@type='button'])[2]";
const usernameInput = "//input[@name='username']";
const passwordInput = "//input[@name='password']";
const agreeTermCondition = "//input[@type='checkbox']";
const signInButton = "//input[@id='okta-signin-submit']";



//-----Actions-----
export class Loginpage {

    launch() 
    {
        cy.visit('http://mdctsedsdev.cms.gov/');
        cy.wait(2000);
    }

    clickEuaIDbutton(){
        cy.xpath(euaIDButton).click();
    }

    enterUserName(){
        cy.xpath(usernameInput).type("MDCT_Test");
    }

    enterPassword(){
        cy.xpath(passwordInput).type("October1!9");
    }

     clickAgreeTermAndConditions(){
         cy.xpath(agreeTermCondition).click();
     }

     clickSignIn(){
         cy.xpath(signInButton).click();
     }

}

export default Loginpage