@ECHO OFF
SETLOCAL ENABLEDELAYEDEXPANSION
REM cd .11ty & deno install & deno run -A npm:@11ty/eleventy & set SAVEDRC=!ERRORLEVEL! & call;
cd .11ty & npm install --quiet & npx @11ty/eleventy & set SAVEDRC=!ERRORLEVEL! & call;
EXIT /B %SAVEDRC%
