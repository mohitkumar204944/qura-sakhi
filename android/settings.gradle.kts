// Qura Sakhi's Android app, built with Gradle (Version 39.79): build-apk.sh prepares the web app in build/assets and then runs
// this build. One module, the app itself, in this folder.
pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories { google(); mavenCentral() }
}
rootProject.name = "QuraSakhi"
