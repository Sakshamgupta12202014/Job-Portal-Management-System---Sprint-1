# JaCoCo Implementation Documentation

This document outlines the implementation of JaCoCo code coverage in the Job Portal Management System backend project.

## Overview
JaCoCo (Java Code Coverage) is a free code coverage library for Java, which has been created by the EclEmma team. It provides metrics on how much of the source code is exercised by the test suite.

## Technologies Used
- **Java 17**: The project is built using Java 17.
- **Maven**: The build automation tool used for managing dependencies and the build lifecycle.
- **Spring Boot**: The core framework for the microservices.
- **JaCoCo Maven Plugin**: The plugin used to integrate JaCoCo with the Maven build process.

## Implementation Details

### Changes Made
The `jacoco-maven-plugin` was added to the `pom.xml` of each microservice within the `<build><plugins>` section. 

### Configuration Code
The following configuration was added:
```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

### Use of Code
- **prepare-agent**: This goal prepares a property pointing to the JaCoCo runtime agent that is passed as a VM argument to the unit tests.
- **report**: This goal creates code coverage reports for a single project in different formats (HTML, XML, CSV). It is bound to the `test` phase, meaning reports will be generated after tests are executed.

## How to Generate Reports
To generate the code coverage reports, run the following command in the root of the project or within each service directory:
```bash
mvn clean test
```
The reports will be generated in the `target/site/jacoco` directory of each service.
