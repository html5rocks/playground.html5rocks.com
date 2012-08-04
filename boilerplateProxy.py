import os
import wsgiref.handlers
from google.appengine.ext.webapp import template
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app


class Main(webapp.RequestHandler):
  def get(self):
    # we do this because we need to find the path to the template.
    # it's relative to the path of this file, so if the url has apis/ajax/playground
    # we need to take it out
    path = self.request.path
    path = path[1:]
    path = path.replace('apis/ajax/playground/', '')

    path = os.path.join(os.path.dirname(__file__), path)
    self.response.out.write(template.render(path, {}))

application = webapp.WSGIApplication([(r'/samples/boilerplateHTML/.*', Main),
                                      (r'/apis/ajax/playground/samples/boilerplateHTML/.*', Main)
                                     ],
                                     debug=False)

def main():
  run_wsgi_app(application)


if __name__ == '__main__':
  main()