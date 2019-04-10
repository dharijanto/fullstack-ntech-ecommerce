# Receipt
## Description
Receipt is formatted as HTML. We then use puppeteer to convert into to PDF, and finally
print it using linux 'lp'.

## Puppeteer Setup
* We use 'page.pdf()' 
* Width is hard-coded as its options (i.e. 'width: '58mm') height is left out, so that 'lp -o fit-to-page' option works properly.
```
page.pdf({ width: '58mm', path: '/tmp/output.pdf' })
```
* Troubleshooting:
```
# Run this if headless chrome fails to run
sudo sysctl -w kernel.unprivileged_userns_clone=1
```

## Printer Setup
* Install CUPS
* Install drivers (i.e. for ZJ-58 http://www.zjiang.com/en/)
* Print using the command
```
lp -d POS58 -o fit-to-page output.pdf
```

# Search
Search is implemented using Sphinx Search. Sphinx indexes data from mysql periodically, when there's new data
from cloud.
## TODO
1. When user searches for 'Sandisk', we should show up appropriate subCategories (i.e. flash drive)

# Installation
* Install Sphinx Search
* Modify Sphinx Search config according to what's on configs/sphinx.conf, make sure to modify localShopId appropriately

# Test
## Unit Test

## Functional Test
* Check that shopifiedProductsView is correct
  -Create product entry on db
  -Create shopProduct entry on db
  -Create order and order details entry
  -Create stock entry
  -Check the view is consistent for:
    -shopProduct data correctly overrides product
    -stockQuantity is consistent with stock - order
* Orders
   -Check open, closed, and po orders decrease inStockProduct quantity
   -Check that cancelled order restores inStockProduct quantity

## CI Test
* Check that all the pages returns 200