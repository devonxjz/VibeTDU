@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------
@echo off
set MAVEN_OPTS=-Xmx512m

set WRAPPER_JAR="%~dp0.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

"%JAVA_HOME%\bin\java.exe" -cp %WRAPPER_JAR% %WRAPPER_LAUNCHER% %*
if "%JAVA_HOME%"=="" goto tryJava
goto end

:tryJava
java -cp %WRAPPER_JAR% %WRAPPER_LAUNCHER% %*

:end
