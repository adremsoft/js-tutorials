# Modern VanillaJS (ES6)

The project demonstrates application split into view and using ES modules loaded by the browser.

Browser requires import paths to be relative and contain extension.
The sample illustrates usage of modules and simple method of binding events by specifying attributes `bind` in form

     "<event-name>:<method>"
     
For example,

    bind="click:onClick"
    
            
The method of rendering is not effective as rendering of the list replaces all DOM elements every time the list being rendered.
It clearly shows that we need some additional templating and diff engine to render only changes.


The application must be server from web server as modules will refuse to load from file URL.
Use webstorm built-in server  

- right-click on index.html
- Run index.html

The browser should open and load the application.
