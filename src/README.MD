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
