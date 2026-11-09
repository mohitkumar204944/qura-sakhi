// Qura Sakhi's Android app (Version 39.79): the WebView wrapper in src/, its resources in res/, and the web app that
// build-apk.sh copies into build/assets. Run it through build-apk.sh, which passes the version and the signing key.
plugins {
    id("com.android.application") version "9.5.1"
    id("com.google.gms.google-services") version "4.5.0" apply false
}

// Version 39.79: "Share how I use Sakhi" through Firebase Analytics, only when google-services.json (from the Firebase console,
// not in git) is in this folder; without it the app has no Firebase code at all (usage/none).
// Version 40 (prototype): the Ask Sakhi test app (SAKHI_CHAT in build-apk.sh) passes sakhi.idSuffix=.ask: its own app ID, beside the
// Play app, and no Firebase (google-services.json names only com.quranutrition.sakhi, and the chat screen sends Firebase nothing).
val idSuffix = (findProperty("sakhi.idSuffix") as String?).orEmpty()
val firebase = file("google-services.json").exists() && idSuffix.isEmpty()

// Gradle's output in build-gradle/ (build-apk.sh owns build/), set first so every path below is made inside it
layout.buildDirectory.set(file("build-gradle"))
if (firebase) apply(plugin = "com.google.gms.google-services")

fun prop(name: String, dev: String): String = (findProperty(name) as String?) ?: dev   // build-apk.sh always passes them

android {
    namespace = "com.quranutrition.sakhi"
    compileSdk = 36
    buildToolsVersion = "36.0.0"
    defaultConfig {
        applicationId = "com.quranutrition.sakhi"
        if (idSuffix.isNotEmpty()) applicationIdSuffix = idSuffix
        minSdk = 29        // Android 10 and newer (Mohit, 25 Oct: newer phones)
        targetSdk = 36     // Google Play's floor since 31 Aug 2026
        versionCode = prop("sakhi.versionCode", "1").toInt()
        versionName = prop("sakhi.versionName", "dev")
    }
    sourceSets["main"].apply {
        manifest.srcFile("build/AndroidManifest.xml")   // AndroidManifest.xml without its package line (the namespace above)
        java.setSrcDirs(listOf("src", if (firebase) "usage/firebase" else "usage/none"))
        res.setSrcDirs(listOf("res"))
        assets.setSrcDirs(listOf("build/assets"))
    }
    signingConfigs {
        // the prototype key for testers' APKs; the upload key for Google Play (its password from the keychain, never a file)
        create("proto") {
            storeFile = file("sakhi-prototype.keystore"); storePassword = "android"; keyAlias = "sakhi"; keyPassword = "android"
            enableV2Signing = true; enableV3Signing = true; enableV4Signing = true   // as apksigner signed them before Version 39.79
        }
        create("upload") {
            storeFile = file(System.getenv("SAKHI_UPLOAD_KEYSTORE") ?: "sakhi-upload.keystore")
            storePassword = System.getenv("SAKHI_UPLOAD_PASS"); keyAlias = "upload"; keyPassword = System.getenv("SAKHI_UPLOAD_PASS")
        }
    }
    buildTypes {
        getByName("release") {
            // Version 39.79: R8 shrinks the libraries Firebase brings; proguard-rules.pro renames nothing and keeps every method the page
            // calls (@JavascriptInterface)
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            signingConfig = signingConfigs.getByName(if (findProperty("sakhi.signing") == "upload") "upload" else "proto")
            vcsInfo { include = false }   // android/ isn't the repository's top folder, so there is nothing to record
        }
    }
    // Wind down's sounds stay uncompressed, so Android plays them straight from the app (the APK and the Play bundle); the
    // fonts, already compressed, are stored as they were before Version 39.79
    androidResources { noCompress += listOf("ogg", "woff2") }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    lint { checkReleaseBuilds = false }
}
dependencies {
    if (firebase) {
        implementation(platform("com.google.firebase:firebase-bom:35.1.0"))
        implementation("com.google.firebase:firebase-analytics")
    }
}
