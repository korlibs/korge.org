#!/usr/bin/env bash
docker run -p 4000:4000 -v "$(pwd):/srv/jekyll" -it jekyll/jekyll:3.8.6 jekyll s --livereload
