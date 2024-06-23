load("@aspect_bazel_lib//lib:tar.bzl", "tar")
load("@container_structure_test//:defs.bzl", "container_structure_test")
load("@rules_java//java:defs.bzl", "java_binary", "java_library", "java_test")
load("@rules_oci//oci:defs.bzl", "oci_image")

package(default_visibility = ["//visibility:public"])

java_library(
    name = "java-maven-lib",
    srcs = glob(["src/main/java/platform/api/videostreamapi/**/*.java"]),
    resources = glob(["src/main/resources/**"]),
    deps = [
        "@maven//:com_google_guava_guava",
        "@maven//:org_springframework_boot_spring_boot",
        "@maven//:org_springframework_boot_spring_boot_autoconfigure",
        "@maven//:org_springframework_boot_spring_boot_starter",
        "@maven//:org_springframework_boot_spring_boot_starter_web",
        "@maven//:org_springframework_boot_spring_boot_starter_webflux",
        "@maven//:org_springframework_boot_spring_boot_starter_actuator",
        "@maven//:org_springframework_boot_spring_boot_starter_data_jpa",
        "@maven//:org_postgresql_postgresql",
        "@maven//:com_googlecode_json_simple_json_simple",
        "@maven//:jakarta_persistence_jakarta_persistence_api",
        "@maven//:io_projectreactor_reactor_core",
        "@maven//:org_springframework_spring_beans",
        "@maven//:org_springframework_spring_context",
        "@maven//:org_springframework_spring_core",
        "@maven//:org_springframework_spring_jdbc",
        "@maven//:org_springframework_spring_web",
    ],
)

java_binary(
    name = "video-stream-api",
    main_class = 'platform.api.videostreamapi.VideoStreamApiApplication',
    runtime_deps = [":java-maven-lib"],
)

java_test(
    name = "tests",
    srcs = glob(["src/maintest/java/platform/api/videostreamapi/*.java"]),
    test_class = 'platform.api.videostreamapi.VideoStreamApiApplication',
    deps = [
        ":java-maven-lib",
        "@maven//:com_google_guava_guava",
        "@maven//:junit_junit",
        "@maven//:org_springframework_boot_spring_boot_starter_test",
    ],
)

tar(
    name = "layer",
    srcs = ["java-maven_deploy.jar"],
)

oci_image(
    name = "image",
    base = "@distroless_java",
    entrypoint = [
        "java",
        "-jar",
        "/java-maven-deploy.jar",
    ],
    tars = [":layer"],
)

container_structure_test(
    name = "container_test",
    configs = ["container-structure-test.yaml"],
    image = ":image",
    tags = ["requires-docker"],
)