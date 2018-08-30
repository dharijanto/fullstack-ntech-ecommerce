# Setup
* Database is populated automatically through NCloud server
* Views, however, are not populated automatically. To populate views, goto CMS,
  then click on "Populate Views" on the left pane.

# Files
## tsconfig.json
Although this is not actually needed, without files key set to empty array,
tsify keeps reading all the source code, even those that are not relevant to the build. (i.e. backend)
```
{ "files": [] }
```