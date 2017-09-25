#EKA QA CHALLENGE

##Introduction
The objective of this challenge from the company perspective, is to get a good grasp of the technical ability of a candidate. To do so, we've put together a small full stack app with *no* testing suite built out to see if a candidate can develop robust tests to pinpoint possible bugs/flaws in the application.

Your objective, as a candidate, will be to develop a test suite to complement the features that already exist within this application.

The full stack application in this project is build on React, Webpack, Babel, Node, and Express. There are multiple packages installed besides those, and you can check them out in the package.json. You don't need to worry about the packages that have already been installed though.

##Directions
As mentioned in the introduction, we would like you to develop a test suite that complements the workflow that we've described below.

Once you develop your tests and write your code in this project, create a Github repository for your work and push your work to the remote repo. Then, e-mail us back in the thread in which you received this challenge with the url to your Github repo.

The only requirements that we will impose on the tests that you write is that you write them using technologies that we would like you to use. At some point for your tests, you should be using **Nightwatch**, **Mocha**, and **Enzyme**. Also, as mentioned before, your tests should be covering the workflow described below.

##Workflow
The basic workflow is as such:

1. User goes to website, clicks the button (literally the only thing on the site). Clicking the button ultimately creates a PDF on the server.
2. That button sends a request to a specified endpoint on the server.
3. The server receives that request and passes it to the relevant controller.
4. The controller takes that request and tells a service to start working.
5. The service handles all the grunt work. The PDF is created (or maybe an error occurs), and the service's work is complete.

##Setup
There is a little bit of setup needed in order to get this repo working for you.

1. Run `yarn install`
  * If you don't have yarn installed, you can install it by running `npm install -g yarn`
  * If you don't have npm installed, you need to intall Node.

2. Run `yarn start`
  * This will trigger the webpack bundle process and spin up your server.

##Questions?
Treat this as if you just got a steaming pile of code from your favorite developer, and you're writing tests to cover his back. Obviously, if you have questions about what some piece of code (that you didn't write) is doing, it's fair game to ask.

Questions should be sent out via the e-mail thread that you received this challenge. Don't forget to reply to all.
