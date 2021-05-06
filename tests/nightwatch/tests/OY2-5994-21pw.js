

const path = require('path');
const timeout = 1000;

const mySelector =  "//*[@data-testid='textInput']";


module.exports={
    "@tags": ["smoke","year", "tag1"],


    // before: function(browser) {
    //    browser.url(browser.launch_url).waitForElementPresent('body');
                     
    // },

    // after: function(browser) {
    //     browser.end();
     
    // },

    // "click on EUA login button": function(browser){
    //     const tests_data={
   
    //         login:{
           
    //          selector:"div[data-testid='OktaLogin'] > button",
    //         },
    //     };
    //     browser.click(tests_data.login.selector).waitForElementPresent('body');
        
    // },
    
    // "Enter Username and Password to login": function(browser){
    //     const tests_data={
    //         username: {
    //             selector: "input[id=okta-signin-username]",
    //         },
    //         password: {
    //            selector: "input[id=okta-signin-password]",
    //        },
    //        rememberme: {
    //            selector: "input[id=tandc]",
    //        }, 
    //        signin:{
    //            selector: "input[type=submit]",
    //        },
    //     };
    //     browser.setValue(tests_data.username.selector,'MDCT_Test', function(){
    //         browser.expect.element(tests_data.username.selector).value.to.equal('MDCT_Test');
    //     });
        
    //     browser.setValue(tests_data.password.selector,'January9!1', function(){
    //         browser.click(tests_data.rememberme.selector);
    //         browser.click(tests_data.signin.selector).waitForElementPresent('body');

    //     });
        
    // },

    before : function(browser) {
        console.log('Setting up the browser instance...');
        console.log('Opening the browser...')
        browser.maximizeWindow().url(browser.launch_url).waitForElementPresent('body');
        // Login credentails are pulled from .env files, this file should not be tracked and
        // must be stated in the .gitignore file
        //Click on Login with EUA ID  
        browser.useCss().click("button.usa-button[data-testid='LoaderButton']");
        const username = browser.globals.user;
        const password = browser.globals.pass;
        // Loing activities 
        //browser.useCss().click(".LoginWithOkta .LoaderButton");
        browser.useCss().setValue("input#okta-signin-username", username).pause(100);
        browser.useCss().setValue("input#okta-signin-password", password).pause(100);
        browser.useCss().click("input#tandc");
        browser.useCss().click("input#okta-signin-submit").pause(3000);
        browser.waitForElementPresent('body');
    },
    after : function(browser) {
        console.log("Stopping test executions...")
        console.log('Closing down the browser instance...');
        browser.end();
    },

    "Click on Quarter1": function(browser){
        const tests_data={
            quarter1:{
                selector: "div[data-testid='accordionItem_2021'] > ul > li > a",
             },

        };
        browser.click(tests_data.quarter1.selector).waitForElementPresent('body');
        
    },

    "click on 21PregnantWomen": function(browser){
        const tests_data={
            pw:{
                selector: "div[id=row-0] > div > a",
            },
        };
        browser.click(tests_data.pw.selector).waitForElementPresent('body');
    },

    "Fill the 21PregnantWomen form and Save ": function(browser){
        const tests_data={
            fpl:{
                selector: "div[data-testid=textInput]",
            },
            ffs:{
                selector: "input[data-testid=textInput]",
            },
            fplchangebutton:{
                selector: "button[data-testid=button]",
            },
            number:{
                selector: "input[type=number]",
            },
            save:{
                selector:"button[data-testid=saveButton]",
            },
            age:{
                selector: "[id=react-tabs-0]",
            },
            footer:{
                selector: "div[data-testid=grid] > a",
            },
        };
        browser.verify.containsText(tests_data.age.selector, "Ages 19");
        
        
        

        //working
        browser.elements("xpath", "//*[@data-testid='textInput']", function(link_array) {
            link_array.value.forEach(function(element, index){
            let ele = element.ELEMENT;
            browser.elementIdEnabled(ele, function(result) {
                if(result.value == true){
                    browser.elementIdClear(ele);
                    browser.elementIdValue(ele, index );
                }
            });  
        });
      });

        //working 
    //     browser.elements("xpath", "//*[@data-testid='textInput']", function(link_array) {
    //     for (var x = 0; x < link_array.value.length; x++){
    //         let ele = link_array.value[x].ELEMENT;
    //         browser.elementIdEnabled(ele, function(result) {
    //             if(result.value == true){
    //                 browser.elementIdClear(ele);
    //                 browser.elementIdValue(ele, "5");
    //             }
    //         });  
    //     }
    //   });
        
    
        const valueContains = function() { 
        browser.verify.valueContains(tests_data.number.selector, "315");
        browser.click(tests_data.fplchangebutton.selector);
        }
           
        browser.clearValue(tests_data.number.selector);
        browser.setValue(tests_data.number.selector,'315', valueContains);
        const myAssert = function(any) {
        browser.assert.attributeContains( ffs, "textInput");
        }
        browser.click(tests_data.save.selector);
       
        browser.click(tests_data.footer.selector);
        browser.pause(timeout * 5);

    },
        
        
};       