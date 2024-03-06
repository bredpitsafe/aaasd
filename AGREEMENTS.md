### Naming conventions
* `kebab-case` for html files
* `camelCase` for ts/js files, variables, functions, methods, and instances
* `PascalCase` for react components, classes and structs
* `UPPER_SNAKE_CASE` for constants
* `lowercase` for everything else

### Function naming conventions
* function name starts with verb (except `one2another`, `toSomething`)
* react components that has side effects should be placed in Widget folder and have `Widget` suffix, also they should use minimal amount of arguments

### Types naming conventions
* Types as primary option, interfaces as fallback
* `T` prefix for type
* `I` prefix for interface
* `E` prefix for enum

### Types
* Required return type for public functions and methods

### Explicit Error Handling
* If function don't have success grants, it have to return Error as one of return type  

### Object vs Class for keeping state
We prefer use object, class cannot be serialized and deserialized without additional work

### Dependency injection
* Use ModuleFactory for creating modules

### Unit Tests
* Unit tests should be written for reusable Classes and Functions, that contain critical logic. For example
  * Library solutions
  * Complex computations
  * ...

### Merge request
* Merge request has a description
* Merge request has a link to issue
* Comment prefixes
  * `fix/bug:` - bug that must be fixed (or comment without prefix)
  * `nit/nth:` - nitpick / nice to have
  * `que/dis:` - question / discussion
* All comments should be resolved before merge
* Reviewer can `resolve` comment only if he fixed it
* Reviewer can not `resolve` comment if it is discussion / question / dispute. In this case comment can be `resolved` only by author
* If you want to merge request asap, you can ask for review in slack
* If you merge request saw nobody for a one week(WIP not included) and it something easy, you can merge it without approves.
* Merge request should be reviewed by at least two persons
* Thursday is a day for focusing on merge requests

### Guidelines for developing new functionality (Tables, Charts, Diagrams, etc.)
* Both new functionality and that which has been affected must be verified.
* Test how the interface behaves when there is no data available.
* Check how the interface responds when an error occurs.
* Test the functionality of filters and sorting options.
* Ensure that an error message is displayed when the connection to the server is lost.
* Verify that data is updated and the cache is invalidated, if necessary, when the connection to the server is restored.
* Test that the Cache/Observable in the SharedWorker works correctly with multiple consumers (covering all previous points).

