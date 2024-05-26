FROM openjdk:17 

WORKDIR /app

# Copy the Maven project files to the container
COPY pom.xml .
COPY / ./

# Build the application using Maven
RUN ./mvnw package -DskipTests -T100


COPY target/video-stream-api-0.0.1-SNAPSHOT.jar /app/video-stream-api-0.0.1-SNAPSHOT.jar

# Set environment variables for the database connection
ENV SPRING_DATASOURCE_URL=jdbc:mysql://mysql-container:3306/gh_platform_db
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=root

# Expose the port the application runs on
EXPOSE 7500


# Define the command to run the application when the container starts
CMD ["java", "-jar", "video-stream-api-0.0.1-SNAPSHOT.jar"]