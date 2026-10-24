#!/bin/sh
# Runs android/test/ReminderMathTest.java: the repeat maths Android uses to book a reminder's next ring (Version 34).
set -e
JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"
here="$(cd "$(dirname "$0")" && pwd)"
out="$(mktemp -d)"
"$JAVA_HOME/bin/javac" -nowarn -d "$out" "$here/../src/com/quranutrition/sakhi/ReminderMath.java" "$here/ReminderMathTest.java"
"$JAVA_HOME/bin/java" -cp "$out" com.quranutrition.sakhi.ReminderMathTest
rm -rf "$out"
