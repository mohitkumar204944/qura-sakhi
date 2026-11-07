# Version 39.79: R8 shrinks away the library code Sakhi never calls (Firebase brings about 9 MB of it). Nothing is renamed, so a
# crash report reads as the source does, and the page reaches the bridge by its methods' names, which are always kept.
-dontobfuscate
-keepattributes JavascriptInterface,*Annotation*,SourceFile,LineNumberTable
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
