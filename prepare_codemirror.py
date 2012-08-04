import os
import md5
import re
files_for_codemirror_base = [
  "util.js",
  "stringstream.js",
  "select.js",
  "undo.js",
  "editor.js",
  "tokenize.js"
]

files_for_mixed_editor = [
  "parsexml.js",
  "parsecss.js",
  "tokenizejavascript.js",
  "parsejavascript.js",
  "parsehtmlmixed.js"
]

files_for_js_editor = [
  "tokenizejavascript.js",
  "parsejavascript.js"
]

os.system('rm codemirror/js/prod_*')

def append_files_and_compress(files, path, output_file_name):
  file_buffer = ''
  print(len(files))
  for i in range(0, len(files)):
    this_file = open(path + files[i])
    file_buffer += this_file.read() + '\n'
    this_file.close()
  output_file = open(path + output_file_name + '.js', 'w')
  output_file.write(file_buffer)
  output_file.close()
  os.system('java -jar yuicompressor-2.4.1.jar ' + path + output_file_name + '.js -o ' + path + output_file_name + '1.js')
  m = md5.new()
  compressed_base = open(path + output_file_name + '1.js')
  m.update(compressed_base.read())
  compressed_base.close()
  os.system('mv ' + path + output_file_name + '1.js ' + path + 'prod_' + output_file_name + '_' + m.hexdigest() + '.js')
  os.system('rm '  + path + output_file_name + '.js ')
  return 'prod_' + output_file_name + '_' + m.hexdigest() + '.js'

base_file_name = append_files_and_compress(files_for_codemirror_base, 'codemirror/js/', 'base')
mixed_file_name = append_files_and_compress(files_for_mixed_editor, 'codemirror/js/', 'mixed')
js_file_name = append_files_and_compress(files_for_js_editor, 'codemirror/js/', 'js_only')

# open code mirror, replace the base filename line
codemirror_file = open('codemirror/js/codemirror.js')
codemirror_text = codemirror_file.read()
codemirror_file.close()
codemirror_text = re.sub('basefiles:.*\[.*\]', 'basefiles: [\'' + base_file_name + '\']', codemirror_text)
codemirror_file = open('codemirror/js/codemirror.js', 'w')
codemirror_file.write(codemirror_text)
codemirror_file.close()
codemirror_file_name = append_files_and_compress(['codemirror.js'], 'codemirror/js/', 'codemirrorz')



# open index.html, replace the parserfile lines
index_file = open('index.html')
index_text = index_file.read()
index_file.close()
index_text = re.sub('parserfile:.*\["prod_mixed.*\]', 'parserfile: ["'+mixed_file_name+'"]', index_text)
index_text = re.sub('parserfile:.*\["prod_js_only.*\]', 'parserfile: ["'+js_file_name+'"]', index_text)
index_text = re.sub('src="codemirror/js/prod_codemirrorz.*\.js', 'src="codemirror/js/' + codemirror_file_name, index_text)
index_file = open('index.html', 'w')
index_file.write(index_text)
index_file.close()