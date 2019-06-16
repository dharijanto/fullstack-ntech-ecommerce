# TODO
- Closed order management should only show last 7 days, so we're not giving out unnecessary informations
  to staffs.
- 

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
## Installation
* Install Sphinx Search
* Modify Sphinx Search config according to what's on configs/sphinx.conf, make sure to modify localShopId appropriately
* Modify system-level daemon runner so that sphinx is run as the same user/group
  as ncloud process so that reindexing can be done through the app.
  (verify this through App CMS -> Other Management -> Reindex Search DB)
* Start sphinx using systemd or systemctl
* Reindex the database using ```sphinx-indexer --rotate --all```
* Add a cronjob that does GET request to the sync path every 30 minutes.
 

# Sync
## Cloud to Shop
* Shop requests sync using POST: /cloud-sync/request { timeSince: '2019-04-03 11:12:00' }
    * Shop checks its internal state to determine whether it's currently syncing. If it's, do nothing.
      Otherwise, move on. -> ShopSyncService.getLastSyncState()
    * LocalSyncService.requestSync()
* Cloud responds with { status: true, data: { status: 'preparing } }
    * CloudSyncService.
* Shop requests sync using POST: /cloud-sync/request { timeSince: '2019-04-03 11:12:00' }
* Cloud checks its database and see it's been prepared, hence sends back
  { status: true, data: { status: 'ready', url: '/sync-data/7.json', timeUntil: '2019-04-03 14:08:00' } }
* Shop downloads the JSON file and updates its local state. While updating,
  sets its internal status to { state: 'Syncing', since: '2019-04-03 11:12:00' until: '2019-04-03 14:08:00' }
  to prevent parallel synchronization
* After syncing has finished, update its state to { status: 'Finished', since: '2019-04-03 11:12:00' until: '2019-04-03 14:08:00' }
### Usage
* Use a cronjob to trigger the sync in timely manner
```
curl /sync-management/cloud-to-local/sync
```

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
