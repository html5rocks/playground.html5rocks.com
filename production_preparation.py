import os
import md5
import re

print "Please enter the password key you would like to use for the secret token:"

secret_token = raw_input('> ')
if secret_token:
  print 'Using secret token: %s' % secret_token


  # have to copy all files to the new directory
  # have to delete the .svn directories
  os.system('rm -rf ../interactive_copy')
  os.system('mkdir ../interactive_copy')
  os.system('cp -R * ../interactive_copy')
  os.chdir('../interactive_copy')
  os.system('find ./ -name \'*.svn\' | xargs -t rm -rf')

  os.system('find ./js -name \'*.js\' | xargs -L1 -IMYFILES -t java -jar yuicompressor-2.4.1.jar MYFILES -o MYFILES')
  os.system('find . -name \'*.css\' | xargs -L1 -IMYFILES -t java -jar yuicompressor-2.4.1.jar --type css MYFILES -o MYFILES')
  os.system('find samples/TOC/*.js | xargs -L1 -IMYFILES -t java -jar yuicompressor-2.4.1.jar MYFILES -o MYFILES')

  m = md5.new()
  interactive_logic = open('js/interactive_logic.js')
  m.update(interactive_logic.read())
  interactive_logic.close()
  os.system('mv js/interactive_logic.js js/interactive_logic_'+m.hexdigest()+'.js')

  index_file = open('index.html')
  index_text = index_file.read()
  index_file.close()
  index_text = re.sub('interactive_logic\.js', 'interactive_logic_'+m.hexdigest()+'.js', index_text)
  index_file = open('index.html', 'w')
  index_file.write(index_text)
  index_file.close()





  m = md5.new()
  styles = open('css/styles.css')
  m.update(styles.read())
  styles.close()
  os.system('mv css/styles.css css/styles_'+m.hexdigest()+'.css')

  index_file = open('index.html')
  index_text = index_file.read()
  index_file.close()
  index_text = re.sub('styles\.css', 'styles_'+m.hexdigest()+'.css', index_text)
  index_file = open('index.html', 'w')
  index_file.write(index_text)
  index_file.close()



  # INSERT OUR SECRET KEY
  main_py_file = open('main.py')
  main_text = main_py_file.read()
  main_py_file.close()
  main_text = re.sub('super_secret', secret_token, main_text)
  if re.search(secret_token, main_text) is not None:
    main_py_file = open('main.py', 'w')
    main_py_file.write(main_text)
    main_py_file.close()
  else:
    print 'ERROR: Inserting secret token failed!'
  # styles.css
else:
  print "Error with secret token!"