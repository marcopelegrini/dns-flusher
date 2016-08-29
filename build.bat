REM @echo off
if "%1"=="" goto blank

rm -rf target
svn export %1 target
cd target
rm -rf .settings
rm .project
rm -rf sources
zip -r -9 %1.xpi *
cd ..

:blank
echo "Informe o projeto"