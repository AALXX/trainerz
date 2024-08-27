pipeline {
    agent any
    
    triggers {
           pollSCM('H/5 * * * *')  // Poll the SVN repository every 5 minutes
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([$class: 'SubversionSCM',
                          locations: [[credentialsId: 'daddd0c0-6510-4396-a5b6-e9a0ce4caa94', 
                                       remote: 'http://192.168.72.208/trainerz']]])
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    // Build Docker image for client-web
                    dir('client-web') {
                        sh 'docker build -t client-web:latest .'
                    }

                    // Build Docker image for main-backend
                    dir('server/main-backend') {
                        sh 'docker build -t main-backend:latest .'
                    }

                    // Build Docker image for search-server
                    dir('server/file-server') {
                        sh 'docker build -t file-server:latest .'
                    }

                    dir('server/search-server') {
                        sh 'docker build -t search-server:latest .'
                    }

                    dir('server/chat-server') {
                        sh 'docker build -t chat-server:latest .'
                    }

                    // Build Docker image for video-stream-server
                    // dir('server/video-stream-server') {
                    //     sh 'docker build -t video-stream-server:latest .'
                    // }

                    // Build Docker image for rust-service
                    // dir('server/rust-service') {
                    //     sh 'docker build -t rust-service:latest .'
                    // }
                }
            }
        }

        // stage('Run Tests in Docker Containers') {
        //     steps {
        //         script {
        //             // Run tests inside the client-web Docker container
        //             sh 'docker run --rm client-web:latest npm run build'

        //             // Run tests inside the main-backend Docker container
        //             sh 'docker run --rm main-backend:latest npm run test'

        //             // Uncomment and configure the following as needed
        //             // Run tests inside the search-server Docker container
        //             // sh 'docker run --rm search-server:latest go test ./...'

        //             // Run tests inside the video-stream-server Docker container
        //             // sh 'docker run --rm video-stream-server:latest ./gradlew test'

        //             // Run tests inside the rust-service Docker container
        //             // sh 'docker run --rm rust-service:latest cargo test'
        //         }
        //     }
        // }
    }

    // Uncomment and configure these post actions if needed
    // post {
    //     always {
    //         junit '**/target/surefire-reports/*.xml' // Adjust according to your test report locations
    //         archiveArtifacts artifacts: '**/target/*.jar', allowEmptyArchive: true
    //         archiveArtifacts artifacts: '**/build/**', allowEmptyArchive: true
    //     }
    // }
}