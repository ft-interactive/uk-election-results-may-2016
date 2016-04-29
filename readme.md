Creates an html file for UK election results

Contacts

tom.pearson@ft.com
steve.bernard@ft.com

runs on a cron job every 1 minute

* * * * * cd /var/opt/customer/apps/interactive.ftdata.co.uk/var/www/scripts/uk-election-results-2016/ npm run start >> log.txt