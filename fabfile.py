from fabric.api import *
from fabric.contrib.console import confirm

env.hosts = ['ftlnx109-lviw-uk-p']

##### Change these to reflect your username etc
env.user = 'Steve.Bernard'
temp_location = '/var/tmp/Steve.Bernard/deployment_tmp/'
#####


location = '/var/opt/customer/apps/interactive.ftdata.co.uk/var/www/scripts/uk-election-results-2016/'

@task
def publish():  
  #local('chown 664  package.json readme.md svg-styles.js gather.js dir-table.js create-configs.js config.js chart-render.js auth.js')
  local('tar czf ukelectionresults2016.tgz ./package.json ./readme.md ./main.js ./views/assembly.html ./views/england.html ./views/mayoral.html ./views/template.html ./config.json')             #tar it up
  put('ukelectionresults2016.tgz', temp_location)  #push to server  

  with cd(location):        #untar to the correct location
    run('tar xzf ' + temp_location + 'ukelectionresults2016.tgz')
    run('npm install')      #install node modules

  print 'PUBLISHED!\n\n' + location


@task
def run_app():
  with cd(location):
    sudo('npm run start')